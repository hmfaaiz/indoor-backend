const express = require("express");
const route = express.Router();
const { Signin,MyProfile,UpdateProfile } = require("../controller/auth");




route.post("/Signin", (req, res) => {
    Signin(req, res);
});


route.get("/MyProfile", (req, res) => {
    MyProfile(req, res);
});

route.put("/UpdateProfile", (req, res) => {
    UpdateProfile(req, res);
});


module.exports = route;
