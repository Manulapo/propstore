import { PrismaClient } from '@prisma/client';
import sampleData from './sample-data';

// seeding is the process of populating the database with sample data.
// it is useful for development and testing purposes. e.g. to test the application with a large dataset, while putting up the application for the first time, etc.
// run this script with `ts-node db/seed.ts` to populate the database with sample data.

async function main() {
    const prisma = new PrismaClient()
    // delete all data first
    await prisma.product.deleteMany()
    await prisma.product.createMany({ data: sampleData.products })

    await prisma.user.deleteMany()
    await prisma.user.createMany({ data: sampleData.users })

    await prisma.account.deleteMany()
    // await prisma.account.createMany({ data: sampleData.account })

    await prisma.verificationToken.deleteMany()
    // await prisma.verificationToken.createMany({ data: sampleData.verificationToken })

    await prisma.session.deleteMany()
    // await prisma.session.createMany({ data: sampleData.session })

    console.log('Sample data loaded.')
}

main();