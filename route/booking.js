const express = require("express");
const route = express.Router();
const {AllocateRoom, ReservedRoom,DeallocateRoom,Archive,UpdateBooking,Report} = require("../controller/booking");
const { checkPermission } = require("../middleware/checkPermission");
const {Authentication} = require("../middleware/authentication");

let moduleName = "Booking"

route.use(Authentication);

route.post("/",checkPermission(moduleName), (req, res) => {
    AllocateRoom(req, res);
});

route.get("/", checkPermission(moduleName), (req, res) => {
    ReservedRoom(req, res);
});
route.delete("/",checkPermission(moduleName), (req, res) => {
    DeallocateRoom(req, res);
});
route.get("/Archive",checkPermission(moduleName) ,(req, res) => {
    Archive(req, res);
});
route.put("/UpdateBooking",checkPermission(moduleName) ,(req, res) => {
    UpdateBooking(req, res);
});
route.get("/Report",checkPermission(moduleName) ,(req, res) => {
    Report(req, res);
});

module.exports = route;
