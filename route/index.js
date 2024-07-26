const express = require('express');
const router = express.Router();

const authRoute = require('./auth');
const roomRoute = require('./room');
const superAdminRoute = require('./superAdmin');
const bookingRoute = require('./booking');


router.use('/auth', authRoute);
router.use('/room', roomRoute);
router.use('/user', superAdminRoute);
router.use('/booking', bookingRoute);


module.exports = router;
