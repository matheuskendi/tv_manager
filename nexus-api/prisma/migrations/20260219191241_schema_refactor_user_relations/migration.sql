-- DropForeignKey
ALTER TABLE `playlist_items` DROP FOREIGN KEY `fk_media`;

-- DropForeignKey
ALTER TABLE `playlist_items` DROP FOREIGN KEY `fk_playlist`;

-- DropForeignKey
ALTER TABLE `playlists` DROP FOREIGN KEY `fk_playlist_owner`;

-- AlterTable
ALTER TABLE `playlist_items` MODIFY `playlist_id` VARCHAR(191) NOT NULL,
    MODIFY `media_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `playlists` MODIFY `created_by` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `playlist_items` ADD CONSTRAINT `fk_media` FOREIGN KEY (`media_id`) REFERENCES `medias`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `playlist_items` ADD CONSTRAINT `fk_playlist` FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `playlists` ADD CONSTRAINT `fk_playlist_owner` FOREIGN KEY (`created_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
