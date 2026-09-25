-- Enable pg_trgm extension for fuzzy/text similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram GIN indexes for fuzzy search on Product fields
CREATE INDEX IF NOT EXISTS idx_product_name_trgm ON "Product" USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_description_trgm ON "Product" USING GIN (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_sku_trgm ON "Product" USING GIN (sku gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_category_name_trgm ON "Category" USING GIN (name gin_trgm_ops);