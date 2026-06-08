/*
  Warnings:

  - Made the column `password_hash` on table `tv_devices` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `tv_devices` MODIFY `password_hash` VARCHAR(255) NOT NULL;
