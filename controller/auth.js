const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();
const {
  //   GenerateToken,
    Authentication,
} = require("../middleware/authentication");
const {
  encryptPassword,
  decryptPassword,
} = require("../utils/password");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();


const Signin = async (req, res) => {

  try {
    if (
      !req.body.email ||
      !validator.isEmail(req.body.email) ||
      !req.body.password
    ) {
      return res
        .status(404)
        .json({ status: 404, message: "please enter your credentials" });
    }
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    const findUser = await client.user.findFirst({
      where: { email: userEmail },
      include: {
        role: true,
      }
    });

    if (!findUser) {
      return res
        .status(404)
        .json({ status: 404, message: "user does not exist" });
    }
    let encryptedPassword = JSON.parse(findUser.password);
    let decryptedPassword = await decryptPassword(encryptedPassword);


    if (decryptedPassword != userPassword) {
      return res
        .status(404)
        .json({ status: 404, message: "password is wrong" });
    }

    const { password, ...other } = findUser;


    const forToken = {
      id: other.id,
      email: other.email,
      role_id: other.role_id
    };
    const tokenExpiration = "30d";
    jwt.sign(
      { forToken },
      process.env.Key,
      { expiresIn: tokenExpiration },
      async (err, token) => {
        if (token) {

          return res.status(200).json({ data: other, token: token });
        }
      }
    );
    
  } catch {
    return res.status(500).json({ status: 500, message: "Internal error" });
  }
};

const MyProfile = async (req, res) => {

  console.log("my profile")
  Authentication(req, res, async (user) => {

  try {
    if (
      !req.user.id

    ) {
      return res
        .status(404)
        .json({ status: 404, message: "please enter your credentials" });
    }

    const findUser = await client.user.findFirst({
      where: { id: req.user.id },
      include: {
        role: true,
      }
    });

    if (!findUser) {
      return res
        .status(404)
        .json({ status: 404, message: "user does not exist" });
    }
    let encryptedPassword = JSON.parse(findUser.password);
    let decryptedPassword = await decryptPassword(encryptedPassword);
    const data={
      id:findUser.id,
      email: findUser.email,
      password:decryptedPassword ,
      name: findUser.name,
      role_id:findUser.role_id,
      role:findUser.role.role_name
    
    }


    return res.status(200).json({status:200,message:"My Profile",data});
  } catch {
    return res.status(500).json({ status: 500, message: "Internal error" });
  }
  })

};

const UpdateProfile = async (req, res) => {
  Authentication(req, res, async (user) => {
    try {
      if (!req.user.id) {
        return res.status(404).json({ status: 404, message: "Please enter your credentials" });
      }

      // Extract and validate request body fields
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ status: 400, message: "email, password, name are required" });
      }

      // Find the user in the database
      const findUser = await client.user.findFirst({
        where: { id: req.user.id },
        include: { role: true }
      });

      if (!findUser) {
        return res.status(404).json({ status: 404, message: "User does not exist" });
      }

      // Prepare updates
      const updates = {};
      if (email) updates.email = email;
      if (name) updates.name = name;
      if (password) {
        // Encrypt the new password
        const encryptedPassword = await encryptPassword(password);
        updates.password = JSON.stringify(encryptedPassword);
      }

      // Update user in the database
      await client.user.update({
        where: { id: req.user.id },
        data: updates
      });

      // Fetch updated user details
      const updatedUser = await client.user.findFirst({
        where: { id: req.user.id },
        include: { role: true }
      });

      // Prepare response data
      const data = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role_id: updatedUser.role_id,
        role: updatedUser.role.role_name
      };

      return res.status(200).json({ status: 200, message: "Profile updated successfully", data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  });
};





module.exports = {

  Signin,MyProfile,UpdateProfile
};
