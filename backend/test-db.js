const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const res = await prisma.qRCode.findFirst();
    console.log("Success! Columns:", Object.keys(res || {}));
  } catch (e) {
    console.error("DB Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
