import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcrypt-ts-edge';
import sampleData from './sample-data';

const prisma = new PrismaClient()

// seeding is the process of populating the database with sample data.
// it is useful for development and testing purposes. e.g. to test the application with a large dataset, while putting up the application for the first time, etc.
// run this script with `ts-node db/seed.ts` to populate the database with sample data.

async function main() {
    // This is a destructive development seed. Delete dependants first so it
    // remains safe after historical-order foreign keys become restrictive.
    await prisma.review.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cart.deleteMany()
    await prisma.product.deleteMany()
    await prisma.account.deleteMany()
    await prisma.verificationToken.deleteMany()
    await prisma.session.deleteMany()
    await prisma.user.deleteMany()

    await prisma.product.createMany({ data: sampleData.products })
    const seedPassword = process.env.SEED_PASSWORD || crypto.randomUUID()
    await prisma.user.createMany({
      data: sampleData.users.map((user) => ({
        ...user,
        password: hashSync(seedPassword, 10),
      })),
    })

    console.log(`Sample data loaded. Demo password: ${seedPassword}`)
}

main()
  .catch((error) => {
    console.error('Seed error:', error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
