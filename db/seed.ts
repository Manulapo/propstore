import { PrismaClient } from '@prisma/client';
import sampleData from './sample-data';

async function main() {
    const prisma = new PrismaClient()
    // delete all data first
    await prisma.product.deleteMany()
    await prisma.product.createMany({ data: sampleData.products })

    console.log('Sample data loaded.')
}

main();