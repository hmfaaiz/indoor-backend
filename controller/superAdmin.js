

const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();
const {
  generatePassword,
  encryptPassword,decryptPassword
} = require("../utils/password");


const dotenv = require("dotenv");
dotenv.config();



const AddRolePermission = async (req, res) => {
    try {
  
      const findPermission = await client.rolePermission.findFirst({
        where: {
          role_id: req.body.role_id,
          permission_id: req.body.permission_id,
        },
      });
  
      if (findPermission) {
        return res
          .status(409)
          .json({ status: 409, message: "Role Permission  already exists" });
      }
      await client.rolePermission.create({
        data: {
            role_id: req.body.role_id,
            permission_id: req.body.permission_id,
        },
      });
  
      // Send success response
      return res.status(200).json({
        status: 200,
        message: "Permission added successfully.",
      });
    } catch (error) {
  
      return res
        .status(500)
        .json({ status: 500, message: "Internal server error" });
    }
  };
  
  const GetRolePermission = async (req, res) => {
    console.log("hit")
    try {
      let findRolePermission = await client.rolePermission.findMany({
        include: {
          role: true,
          permission: {
            include: {
              module: true,
              action: true
            }
          }
        }
      });
  
      // Use an object to aggregate permissions under each role
      const rolePermissions = {};
  
      findRolePermission.forEach(rp => {
        const roleName = rp.role.role_name;
        const moduleName = rp.permission.module.name;
        const actionName = rp.permission.action.action_name;
  
        if (!rolePermissions[roleName]) {
          rolePermissions[roleName] = {};
        }
  
        if (!rolePermissions[roleName][moduleName]) {
          rolePermissions[roleName][moduleName] = [];
        }
  
        // Check if action already exists for this module under this role
        if (!rolePermissions[roleName][moduleName].includes(actionName)) {
          rolePermissions[roleName][moduleName].push(actionName);
        }
      });
  
      // Format the data for response
      const formattedData = Object.keys(rolePermissions).map(roleName => ({
        roleName,
        permissions: rolePermissions[roleName]
      }));
  
      return res.status(200).json({
        status: 200,
        message: "Role Permissions retrieved successfully.",
        data: formattedData
      });
    } catch (error) {

      return res.status(500).json({ status: 500, message: "Internal server error", error });
    }
  };
  

  module.exports = {
    AddRolePermission, GetRolePermission,
  };