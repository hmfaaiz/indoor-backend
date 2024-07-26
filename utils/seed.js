const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  generatePassword,
  encryptPassword,
  decryptPassword,
} = require("../utils/password");

const main = async () => {
  const actions = ["GET", "POST", "PUT", "DELETE","LIST"];

  for (const action_name of actions) {
    await prisma.action.upsert({
      where: { action_name },
      update: {},
      create: { action_name },
    });
  }

  const roles = [
    "SuperAdmin",
    "Admin",
  ];

  for (const role_name of roles) {
    await prisma.role.upsert({
      where: { role_name },
      update: {},
      create: { role_name },
    });
  }

  const modules = ["Room","User","Booking"];

  for (const name of modules) {
    await prisma.module.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const findModules = await prisma.module.findMany();
  const findActions = await prisma.action.findMany();

  for (const module of findModules) {
    for (const action of findActions) {
      const existingPermission = await prisma.permission.findFirst({
        where: {
          module_id: module.id,
          action_id: action.id,
        },
      });

      if (!existingPermission) {
        await prisma.permission.create({
          data: {
            module_id: module.id,
            action_id: action.id,
          },
        });
      }
    }
  }

  const superAdminEmail = "superadmin@room.com";
  const superAdminPassword = "12345";
  const superAdminName = "Faaiz";
  let password = await encryptPassword(superAdminPassword);
  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      password: JSON.stringify(password),
      name: superAdminName,
      role_id: 1,
    },
  });

  const adminEmail = "admin@room.com";
  const adminPassword = "12345";
  const adminName = "Ali";
  let adminpassword = await encryptPassword(adminPassword);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: JSON.stringify(adminpassword),
      name: adminName,
      role_id: 2,
    },
  });

};

main()
  .then(() => {
    console.log("Data seeded successfully.");
  })
  .catch((e) => {
    console.error("Error seeding data:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
