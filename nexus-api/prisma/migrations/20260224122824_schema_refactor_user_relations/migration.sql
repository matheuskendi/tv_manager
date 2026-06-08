/*
  Warnings:

  - You are about to drop the column `password` on the `tv_devices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tv_devices` DROP COLUMN `password`,
    ADD COLUMN `password_hash` VARCHAR(255) NULL;
