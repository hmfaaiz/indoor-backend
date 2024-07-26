const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();
const {
  //   GenerateToken,
  //   Authentication,
} = require("../middleware/authentication");
const {

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
      role_id:other.role_id
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


module.exports = {
   
    Signin,
  };
  