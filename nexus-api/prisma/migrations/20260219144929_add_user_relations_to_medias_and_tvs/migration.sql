/*
  Warnings:

  - The primary key for the `playlist_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `playlist_password` on the `playlists` table. All the data in the column will be lost.
  - You are about to drop the column `playlist_user` on the `playlists` table. All the data in the column will be lost.
  - The primary key for the `tv_devices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `admin_id` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admin_id` to the `tv_devices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `medias` ADD COLUMN `admin_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `playlist_items` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `playlists` DROP COLUMN `playlist_password`,
    DROP COLUMN `playlist_user`;

-- AlterTable
ALTER TABLE `tv_devices` DROP PRIMARY KEY,
    ADD COLUMN `admin_id` VARCHAR(191) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `medias` ADD CONSTRAINT `medias_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admin_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tv_devices` ADD CONSTRAINT `tv_devices_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admin_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
