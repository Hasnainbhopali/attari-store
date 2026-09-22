-- Add Cloudinary fields to ProductImage
-- publicId, width, height, format

ALTER TABLE "ProductImage" 
ADD COLUMN "publicId" TEXT,
ADD COLUMN "width" INTEGER,
ADD COLUMN "height" INTEGER,
ADD COLUMN "format" TEXT;

-- Create unique index on publicId
CREATE UNIQUE INDEX "ProductImage_publicId_key" ON "ProductImage"("publicId");