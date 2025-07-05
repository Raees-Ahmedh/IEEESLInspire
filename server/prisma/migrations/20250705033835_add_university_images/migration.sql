-- AlterTable
ALTER TABLE "universities" ADD COLUMN     "gallery_images" JSONB,
ADD COLUMN     "image_url" VARCHAR(500),
ADD COLUMN     "logo_url" VARCHAR(500);
