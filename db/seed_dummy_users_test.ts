import { PrismaClient } from "@prisma/client";
import { fakerIT, fakerEN } from "@faker-js/faker";
import { uuids } from "./sample-data";

const prisma = new PrismaClient();

const length = uuids.length; // Number of users to create

async function main() {
  const users = Array.from({ length }).map((_, i) => {
    const faker = i % 2 === 0 ? fakerIT : fakerEN;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      id: uuids[i],
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
      password: faker.internet.password(),
      role: "user",
      image: "",
      address: {
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        postalCode: faker.location.zipCode(),
        country: faker.location.country(),
      },
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent(),
    };
  });

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${length} users with random data`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
