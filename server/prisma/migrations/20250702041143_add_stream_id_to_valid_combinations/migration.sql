/*
  Warnings:

  - Added the required column `stream_id` to the `valid_combinations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "valid_combinations" ADD COLUMN     "stream_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "valid_combinations" ADD CONSTRAINT "valid_combinations_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "streams"("stream_id") ON DELETE RESTRICT ON UPDATE CASCADE;
