-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "metadata" JSONB;

-- CreateIndex
CREATE INDEX "orders_metadata_idx" ON "orders" USING GIN ("metadata");
