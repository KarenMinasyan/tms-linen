-- CreateTable
CREATE TABLE `listings` (
    `id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `linen_attribute` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservations` (
    `id` VARCHAR(64) NOT NULL,
    `listing_id` VARCHAR(64) NOT NULL,
    `status` VARCHAR(32) NOT NULL,
    `planned_arrival_time` DATETIME(3) NOT NULL,
    `planned_departure_time` DATETIME(3) NOT NULL,
    `guests_count` INTEGER NOT NULL,
    `infants` INTEGER NOT NULL,
    `number_of_guests_override` INTEGER NULL,
    `requested_sofabed` BOOLEAN NOT NULL,

    INDEX `idx_reservations_listing_id_planned_arrival_time`(`listing_id`, `planned_arrival_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` VARCHAR(64) NOT NULL,
    `task_type` VARCHAR(64) NOT NULL,
    `status` VARCHAR(32) NOT NULL,
    `listing_id` VARCHAR(64) NULL,
    `reservation_id` VARCHAR(64) NULL,
    `planned_start` DATETIME(3) NOT NULL,

    INDEX `idx_tasks_listing_id`(`listing_id`),
    INDEX `idx_tasks_reservation_id`(`reservation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_linen` (
    `task_id` VARCHAR(64) NOT NULL,
    `sheets` INTEGER NOT NULL,
    `towels` INTEGER NOT NULL,
    `bathmats` INTEGER NOT NULL,
    `handtowels` INTEGER NOT NULL,
    `dishtowels` INTEGER NOT NULL,
    `prepared_for_guests` INTEGER NOT NULL,
    `requested_sofabeds_count` INTEGER NOT NULL,
    `actual_guests` INTEGER NOT NULL,
    `infants` INTEGER NOT NULL,
    `number_of_guests_override` INTEGER NULL,
    `requested_sofabed` BOOLEAN NOT NULL,

    PRIMARY KEY (`task_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `linen_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` VARCHAR(64) NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `event_id` VARCHAR(128) NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_linen_history_task_id_created_at`(`task_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_idempotency` (
    `event_id` VARCHAR(128) NOT NULL,
    `event_type` VARCHAR(64) NOT NULL,
    `processed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `fk_reservations_listing_id` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `fk_tasks_listing_id` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_linen` ADD CONSTRAINT `fk_task_linen_task_id` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `linen_history` ADD CONSTRAINT `fk_linen_history_task_id` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
