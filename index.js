
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const apiRoutes = require('./route/index');
const client = new PrismaClient();
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
        res.status(200).send("Room Management System Api is running successfully");
    
})
app.use("/api",apiRoutes);
app.listen(5000, () => {
    console.log("Server is running");
})
