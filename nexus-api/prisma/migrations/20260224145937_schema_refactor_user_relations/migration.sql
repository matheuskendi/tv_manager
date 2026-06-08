/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `tv_devices` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `tv_devices_name_key` ON `tv_devices`(`name`);
