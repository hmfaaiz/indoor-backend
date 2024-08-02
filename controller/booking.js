const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();


const dotenv = require("dotenv");
dotenv.config();


const AllocateRoom = async (req, res) => {
    try {
    
      if (!req.body.room_id || !req.body.start_time || !req.body.end_time || !req.body.contact_number || !req.body.contact_name) {
        return res.status(400).json({ status: 400, message: "Incomplete or malformed request data" });
      }
  

      const startTime = new Date(req.body.start_time);
      const endTime = new Date(req.body.end_time);
  
      const now = new Date();
  
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return res.status(400).json({ status: 400, message: "Invalid date format" });
      }
 
      if (startTime < now) {
        return res.status(400).json({ status: 400, message: "Start time cannot be in the past" });
      }
  
      if (endTime < now) {
        return res.status(400).json({ status: 400, message: "End time cannot be in the past" });
      }
  
      if (startTime >= endTime) {
        return res.status(400).json({ status: 400, message: "End time must be after start time" });
      }
  
 
      const room = await client.room.findFirst({
        where: {
          id: req.body.room_id,
          is_active: true
        }
      });
  
      if (!room) {
        return res.status(404).json({ status: 404, message: "Room not found or inactive" });
      }
  
 
      const existingBooking = await client.booking.findMany({
        where: {
          room_id: req.body.room_id,
          is_active: true,
          OR: [
            {
              AND: [
                { start_time: { lte: endTime } },
                { end_time: { gte: startTime } }
              ]
            }
          ]
        },
      });
  
      if (existingBooking.length > 0) {
        return res.status(409).json({ status: 409, message: "Room is already booked for the requested time" ,data:existingBooking});
      }
  

      await client.booking.create({
        data: {
          room_id: req.body.room_id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          contact_number: req.body.contact_number,
          contact_name: req.body.contact_name,
          contact_email: req.body.contact_email || null,
          user_id: req.user.id,
          is_active: true
        },
      });
  
      return res.status(200).json({ status: 200, message: "Successfully registered" });
  
    } catch (error) {
      console.error("Error in AllocateRoom:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  };
  
  
  const ReservedRoom = async (req, res) => {
    try {
      
      const now = new Date();
  
     
      const findBooking = await client.booking.findMany({
        where: {
          is_active: true,
          start_time: {
            gte: now 
          }
          
        },
        orderBy: {
            start_time: 'asc' 
          },
          include:{
            room:true
          }
      });
   
      return res.status(200).json({ status: 200, message: "Successfully found", data: findBooking });
  
    } catch (error) {
      console.error("Error in ReservedRoom:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  };
  


const DeallocateRoom = async (req, res) => {
  try {
    const { id } = req.query;

    const findBooking = await client.booking.findUnique({
      where: { id: Number(id) }
    });

    if (!findBooking) {
      return res.status(404).json({ status: 404, message: "Booking not found" });
    }

    await client.booking.update({
      where: { id: Number(id) },
      data: {
        is_active: false
      }
    });

    return res.status(200).json({ status: 200, message: "Deallocated successfully" });

  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};


  
  
const Archive = async (req, res) => {
  try {
    const now = new Date();

    const findBooking = await client.booking.findMany({
      where: {
        OR: [
          {
            is_active: false // Include inactive bookings
          },
          {
            start_time: {
              lt: now // Include past bookings if inactive
            }
          }
        ]
      },
      orderBy: {
        start_time: 'asc' // Sort bookings by start_time in ascending order
      },
      include:{
        room:true
      }
    });

    return res.status(200).json({ status: 200, message: "Successfully found", data: findBooking });

  } catch (error) {
    
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};


const UpdateBooking = async (req, res) => {
  try {
    const { id } = req.query;

    const { room_id, start_time, end_time, contact_email, contact_name, contact_number } = req.body;
   
    if (!room_id || !start_time || !end_time || !contact_number || !contact_name) {
      return res.status(400).json({ status: 400, message: "Incomplete or malformed request data" });
    }

    const startTime = new Date(start_time);
    const endTime = new Date(end_time);
    const now = new Date();

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({ status: 400, message: "Invalid date format" });
    }

    if (startTime < now) {
      return res.status(400).json({ status: 400, message: "Start time cannot be in the past" });
    }

    if (endTime < now) {
      return res.status(400).json({ status: 400, message: "End time cannot be in the past" });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ status: 400, message: "End time must be after start time" });
    }

    // Find the booking to be updated
    const findBooking = await client.booking.findUnique({
      where: { id: Number(id) }
    });

    if (!findBooking) {
      return res.status(404).json({ status: 404, message: "Booking not found" });
    }

    // Check if the new booking time conflicts with existing bookings
    const existingBooking = await client.booking.findMany({
      where: {
        room_id: room_id.id,
        is_active: true,
        AND: [
          {
            OR: [
              {
                AND: [
                  { start_time: { lte: endTime } },
                  { end_time: { gte: startTime } }
                ]
              }
            ]
          }
        ],
        NOT: {
          id: Number(id) // Exclude the current booking
        }
      }
    });

    if (existingBooking.length > 0) {
      return res.status(409).json({ status: 409, message: "Room is already booked for the requested time", data: existingBooking });
    }

    // Update the booking
    await client.booking.update({
      where: { id: Number(id) },
      data: {
        room_id:room_id.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        contact_email,
        contact_name,
        contact_number
      }
    });

    return res.status(200).json({ status: 200, message: "Booking updated successfully" });

  } catch (error) {
    console.error("Error in UpdateBooking:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const Report = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)); // Start of today
    const endOfDay = new Date(startOfDay).setHours(23, 59, 59, 999); // End of today

    const endOfDayDate = new Date(endOfDay);



    const [findBooking, findArchive, findRoom,todayBooking] = await Promise.all([
      client.booking.findMany({
        where: {
          is_active: true,
          start_time: { gte: now }
        },
        orderBy: { start_time: 'asc' },
        include: { room: true }
      }),

      client.booking.findMany({
        where: {
          OR: [
            { is_active: false },
            { start_time: { lt: now } }
          ]
        },
        orderBy: { start_time: 'asc' }
      }),

      client.room.findMany({
        where: { is_active: true }
      }),


      client.booking.findMany({
        where: {
          start_time: { gte: now, lte: endOfDayDate }, // Bookings starting today
          is_active: true
        },
        orderBy: { start_time: 'asc' },
        include: { room: true }
      })
    ]);


    const data = {
      total_rooms: findRoom.length,
      total_bookings: findBooking.length,
      total_archive: findArchive.length,
      total_todayBooking: todayBooking.length
    };

 
    return res.status(200).json({ status: 200, message: "Report",data });

  } catch (error) {
    console.error("Error in Report:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

const AllBooking = async (req, res) => {
  try {
    
    const now = new Date();

   
    const findBooking = await client.booking.findMany({
      where: {
        is_active: true,
        
      },
      orderBy: {
          start_time: 'asc' 
        },
        include:{
          room:true
        }
    });
 
    return res.status(200).json({ status: 200, message: "Successfully found", data: findBooking });

  } catch (error) {
    console.error("Error in ReservedRoom:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};



module.exports = {
    AllocateRoom,ReservedRoom,DeallocateRoom,Archive,UpdateBooking,Report,AllBooking
};