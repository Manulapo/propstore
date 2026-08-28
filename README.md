# PropStore

PropStore is a small Next.js e-commerce demo for movie and TV props. It uses
PostgreSQL through Prisma, credentials authentication, Stripe for the real
payment path, and a local PayPal-shaped demo flow that never calls PayPal.

## Local setup

1. Install Node.js and choose npm as the package manager.
2. Copy `.env.example` to `.env.local` and fill in the database/auth values.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Apply migrations and optionally load development data:

   ```bash
   npx prisma migrate deploy
   npx tsx db/seed.ts
   ```

   The seed command creates a random demo password unless `SEED_PASSWORD` is
   set, then prints the password once. Never run the destructive seed against
   a shared or production database.

5. Start the application:

   ```bash
   npm run dev
   ```

## Checks

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npm run build
```

PayPal tests are fully local and do not require credentials or network access.
Stripe checkout/webhooks require Stripe configuration when those flows are
used.
