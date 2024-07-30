const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();


const dotenv = require("dotenv");
dotenv.config();

const Register = async (req, res) => {
  try {
    if (!req.body.room_number || !req.body.type || !req.body.capacity) {
      return res.status(400).json({ status: 400, message: "Incomplete or malformed request data" });
    }
    const findRoom = await client.room.findFirst({
      where: { room_number: req.body.room_number,
        is_active:true
       },
    });

    if (findRoom) {
      return res
        .status(409)
        .json({ status: 409, message: "Room already exists" });
    }



    await client.room.create({
      data: {
        room_number: req.body.room_number,
        type: req.body.type,
        capacity: req.body.capacity,
        detail: req.body.detail,
 
      },
    });

    return res
      .status(200)
      .json({ status: 200, message: "Successfully registered" });

  } catch (error) {

    return res
      .status(500)
      .json({ status: 500, message: "Internal server error" });
  }
};



const GetRoom = async (req, res) => {
  try {
    const findRoom = await client.room.findMany({
      where: {
        is_active: true 
      },
    });
    
 
    return res.status(200).json({ status: 200, message: "Successfully found", data: findRoom });

  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};


const UpdateRoom = async (req, res) => {
  try {
    const {id}=req.query;
    const { room_number, type, capacity, detail } = req.body;

    const findRoom = await client.room.findUnique({
      where: { id: Number(id) }
    });

    if (!findRoom) {
      return res.status(404).json({ status: 404, message: "Room not found" });
    }

    await client.room.update({
      where: { id: Number(id) },
      data: {
         room_number,
        type,capacity:parseInt(capacity,10),detail
     
      },
    });

    return res.status(200).json({ status: 200, message: "Room updated successfully" });

  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};


const SoftDeleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const findRoom = await client.room.findUnique({
      where: { id: Number(id) }
    });

    if (!findRoom) {
      return res.status(404).json({ status: 404, message: "Room not found" });
    }

    await client.room.update({
      where: { id: Number(id) },
      data: {
        isActive: false
      }
    });

    return res.status(200).json({ status: 200, message: "User soft deleted successfully" });

  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};


module.exports = {
  Register, GetRoom,UpdateRoom,SoftDeleteRoom
};