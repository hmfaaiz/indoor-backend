const express = require("express");
const route = express.Router();
const { GetRolePermission,AddRolePermission} = require("../controller/superAdmin");

route.get("/GetRolePermission", (req, res) => {
  GetRolePermission(req, res);
});

route.post("/AddRolePermission", (req, res) => {
  AddRolePermission(req, res);
});


module.exports = route;
