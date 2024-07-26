const express = require("express");
const route = express.Router();
const {Register, GetRoom,UpdateRoom,SoftDeleteRoom} = require("../controller/room");
const { checkPermission } = require("../middleware/checkPermission");
const {Authentication} = require("../middleware/authentication");

let moduleName = "Room"

route.use(Authentication);

route.post("/",checkPermission(moduleName), (req, res) => {
  Register(req, res);
});

route.get("/", checkPermission(moduleName), (req, res) => {
    GetRoom(req, res);
});
route.put("/",checkPermission(moduleName), (req, res) => {
    UpdateRoom(req, res);
});
route.delete("/",checkPermission(moduleName) ,(req, res) => {
    SoftDeleteRoom(req, res);
});

module.exports = route;
