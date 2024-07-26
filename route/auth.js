const express = require("express");
const route = express.Router();
const { Signin } = require("../controller/auth");




route.post("/Signin", (req, res) => {
    Signin(req, res);
});


module.exports = route;
