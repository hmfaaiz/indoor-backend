

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkPermission = (module) => async (req, res, next) => {
    let action = req.method
    try {
        console.log("check permission", req.user.role_id,action)
        const rolePermissions = await prisma.rolePermission.findMany({
            where: { role_id: req.user.role_id }, // Replace with the roleId you want to query
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

        const hasPermission = rolePermissions.some(user =>
            user.permission.module.name === module &&
            user.permission.action.action_name === action
        );



        if (!hasPermission) {
            return res.status(403).json({
                status: 403,
                message: `User does not have permission to ${action} in ${module} module.`
            });
        }

        next();
    } catch (error) {
        console.error("Error checking permission:", error);
        return res.status(500).json({ status: 500, message: "Internal server error", error });
    }
};

module.exports = { checkPermission };