-- Add idempotencyKey column to Order table
ALTER TABLE "Order" ADD COLUMN "idempotencyKey" TEXT;

-- Create unique index on idempotencyKey
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");