-- DropForeignKey
ALTER TABLE `tv_devices` DROP FOREIGN KEY `fk_tv_playlist`;

-- AlterTable
ALTER TABLE `tv_devices` MODIFY `playlist_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `tv_devices` ADD CONSTRAINT `fk_tv_playlist` FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
