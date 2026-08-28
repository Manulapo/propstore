-- Preserve historical orders when users or products are removed.
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_productId_fkey";
ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_userId_fkey";
ALTER TABLE "Order"
  ADD CONSTRAINT "Order_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Keep the oldest review if legacy data contains duplicate user/product rows.
DELETE FROM "Review" older
USING "Review" newer
WHERE older."userId" = newer."userId"
  AND older."productId" = newer."productId"
  AND (
    older."createdAt" > newer."createdAt"
    OR (older."createdAt" = newer."createdAt" AND older."id" > newer."id")
  );

CREATE UNIQUE INDEX "review_userId_productId_key"
  ON "Review"("userId", "productId");

CREATE INDEX "Cart_userId_idx" ON "Cart"("userId");
CREATE INDEX "Cart_sessionCartId_idx" ON "Cart"("sessionCartId");
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX "Review_productId_idx" ON "Review"("productId");
