const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();

const tokenExpiration = "1d";

const GenerateToken = (user, res) => {
  jwt.sign(
    { user },
    process.env.Key,
    { expiresIn: tokenExpiration },
    (err, token) => {
      if (token) {
        return res.status(200).json({ token: token });
      } else {
        return res.status(404).json({ message: "Something is wrong in token" });
      }
    }
  );
};

const Authentication = (req, res, next) => {
  const token = req.headers.token || req.headers.authorization;
 
  if (token) {
    jwt.verify(
      token.replace("Bearer ", ""),
      process.env.Key,
      async (err, user) => {
        if (user) {

          const currentTime = Math.floor(Date.now() / 1000);

          if (user.exp && user.exp < currentTime) {
            return res
              .status(404)
              .json({ status: 404, message: "Token has expired" });
          } else {
            let findUser = await client.user.findFirst({
              where: { id: user.forToken.id },
            });

            if (
              !findUser
            ) {
              return res

                .status(404)
                .json({ status: 404, message: "You are not authenticate" });
            }


            const userData = {
              id: user.forToken.id,
              roleId: user.forToken.roleId

            };

            req.user = userData;
         

            next()
          }
        } else {
          return res
            .status(404)
            .json({ status: 404, message: "Invalid token" });
        }
      }
    );
  } else {
    return res

      .status(404)
      .json({ status: 404, message: "You are not authenticate" });
  }

};

module.exports = { GenerateToken, Authentication };