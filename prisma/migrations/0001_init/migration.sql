-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "CurrencyCode" AS ENUM ('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'BRL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(30),
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(3),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(250) NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "category_id" UUID,
    "base_price" DECIMAL(12,2) NOT NULL,
    "compare_at_price" DECIMAL(12,2),
    "cost_price" DECIMAL(12,2),
    "currency" "CurrencyCode" NOT NULL DEFAULT 'USD',
    "stock_level" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
    "is_low_stock" BOOLEAN NOT NULL DEFAULT false,
    "weight_grams" DECIMAL(10,2),
    "width_mm" DECIMAL(10,2),
    "height_mm" DECIMAL(10,2),
    "depth_mm" DECIMAL(10,2),
    "images" JSONB,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT[],
    "metadata" JSONB,
    "rating_avg" DECIMAL(3,2),
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "order_number" VARCHAR(50) NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(14,2) NOT NULL,
    "shipping_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL,
    "currency" "CurrencyCode" NOT NULL DEFAULT 'USD',
    "country" VARCHAR(100),
    "city" VARCHAR(200),
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "postal_code" VARCHAR(20),
    "timezone" VARCHAR(50),
    "shipping_address" JSONB,
    "billing_address" JSONB,
    "notes" TEXT,
    "placed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "localized_price" DECIMAL(14,2) NOT NULL,
    "currency" "CurrencyCode" NOT NULL DEFAULT 'USD',
    "tax_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL,
    "metadata" JSONB,
    "placed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_is_active_created_at_idx" ON "users"("is_active", "created_at");

-- CreateIndex
CREATE INDEX "users_last_login_at_idx" ON "users"("last_login_at");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users" USING BRIN ("created_at");

-- CreateIndex
CREATE INDEX "users_metadata_idx" ON "users" USING GIN ("metadata");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_slug_key" ON "product_categories"("slug");

-- CreateIndex
CREATE INDEX "product_categories_slug_idx" ON "product_categories"("slug");

-- CreateIndex
CREATE INDEX "product_categories_parent_id_idx" ON "product_categories"("parent_id");

-- CreateIndex
CREATE INDEX "product_categories_sort_order_idx" ON "product_categories"("sort_order");

-- CreateIndex
CREATE INDEX "product_categories_name_idx" ON "product_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_status_created_at_idx" ON "products"("status", "created_at");

-- CreateIndex
CREATE INDEX "products_category_id_status_idx" ON "products"("category_id", "status");

-- CreateIndex
CREATE INDEX "products_base_price_idx" ON "products"("base_price");

-- CreateIndex
CREATE INDEX "products_stock_level_idx" ON "products"("stock_level");

-- CreateIndex
CREATE INDEX "products_is_low_stock_idx" ON "products"("is_low_stock");

-- CreateIndex
CREATE INDEX "products_rating_avg_idx" ON "products"("rating_avg");

-- CreateIndex
CREATE INDEX "products_created_at_idx" ON "products" USING BRIN ("created_at");

-- CreateIndex
CREATE INDEX "products_tags_idx" ON "products" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "products_metadata_idx" ON "products" USING GIN ("metadata");

-- CreateIndex
CREATE INDEX "products_status_stock_level_base_price_idx" ON "products"("status", "stock_level", "base_price");

-- CreateIndex
CREATE INDEX "products_category_id_status_created_at_idx" ON "products"("category_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "products_status_rating_avg_idx" ON "products"("status", "rating_avg");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_order_number_idx" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_user_id_placed_at_idx" ON "orders"("user_id", "placed_at");

-- CreateIndex
CREATE INDEX "orders_status_placed_at_idx" ON "orders"("status", "placed_at");

-- CreateIndex
CREATE INDEX "orders_payment_status_status_idx" ON "orders"("payment_status", "status");

-- CreateIndex
CREATE INDEX "orders_placed_at_idx" ON "orders" USING BRIN ("placed_at");

-- CreateIndex
CREATE INDEX "orders_lat_lng_idx" ON "orders"("lat", "lng");

-- CreateIndex
CREATE INDEX "orders_country_status_idx" ON "orders"("country", "status");

-- CreateIndex
CREATE INDEX "orders_country_placed_at_idx" ON "orders"("country", "placed_at");

-- CreateIndex
CREATE INDEX "orders_currency_status_idx" ON "orders"("currency", "status");

-- CreateIndex
CREATE INDEX "orders_city_country_idx" ON "orders"("city", "country");

-- CreateIndex
CREATE INDEX "orders_total_idx" ON "orders"("total");

-- CreateIndex
CREATE INDEX "orders_status_payment_status_placed_at_idx" ON "orders"("status", "payment_status", "placed_at");

-- CreateIndex
CREATE INDEX "orders_user_id_status_placed_at_idx" ON "orders"("user_id", "status", "placed_at");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_placed_at_idx" ON "order_items"("product_id", "placed_at");

-- CreateIndex
CREATE INDEX "order_items_product_id_unit_price_idx" ON "order_items"("product_id", "unit_price");

-- CreateIndex
CREATE INDEX "order_items_localized_price_idx" ON "order_items"("localized_price");

-- CreateIndex
CREATE INDEX "order_items_placed_at_idx" ON "order_items" USING BRIN ("placed_at");

-- CreateIndex
CREATE INDEX "order_items_quantity_idx" ON "order_items"("quantity");

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

