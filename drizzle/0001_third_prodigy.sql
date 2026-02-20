CREATE TABLE `adminSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `adminSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `barterOffers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`fromUserId` int NOT NULL,
	`toUserId` int NOT NULL,
	`offeredItemDescription` text NOT NULL,
	`status` enum('pending','accepted','rejected','completed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `barterOffers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `circleMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`circleId` int NOT NULL,
	`userId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `circleMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(50) NOT NULL,
	`pricePerDay` decimal(10,2) NOT NULL,
	`fairValuePrice` decimal(10,2),
	`location` varchar(255) NOT NULL,
	`zipCode` varchar(10),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`availability` enum('available','rented','unavailable') NOT NULL DEFAULT 'available',
	`isVerified` boolean NOT NULL DEFAULT false,
	`isEmergency` boolean NOT NULL DEFAULT false,
	`isWeird` boolean NOT NULL DEFAULT false,
	`isBarterEnabled` boolean NOT NULL DEFAULT false,
	`isDeliveryAvailable` boolean NOT NULL DEFAULT false,
	`images` json NOT NULL,
	`specs` json NOT NULL,
	`co2SavedPerRental` decimal(8,2) DEFAULT '0',
	`isFlagged` boolean NOT NULL DEFAULT false,
	`flagReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `neighborhoodCircles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`zipCode` varchar(10) NOT NULL,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`memberCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `neighborhoodCircles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rentals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`renterId` int NOT NULL,
	`ownerId` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`status` enum('pending','confirmed','in_progress','completed','canceled') NOT NULL DEFAULT 'pending',
	`paymentStatus` enum('pending','paid','refunded') NOT NULL DEFAULT 'pending',
	`stripePaymentIntentId` varchar(255),
	`damageReported` boolean NOT NULL DEFAULT false,
	`damageDescription` text,
	`insuranceClaimed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rentals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rentalId` int NOT NULL,
	`fromUserId` int NOT NULL,
	`toUserId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tokenTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`type` enum('purchase','earn','spend','refund','bonus') NOT NULL,
	`description` varchar(255),
	`relatedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tokenTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `displayName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `users` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `zipCode` varchar(10);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `tokenBalance` int DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionTier` enum('free','starter','pro','enterprise') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('active','canceled','past_due','none') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `accessibilityMode` enum('default','wcag_aaa','eco_code','neuro_code','dyslexic','no_blue_light') DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isBanned` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `banReason` text;--> statement-breakpoint
CREATE INDEX `idx_barter_listing` ON `barterOffers` (`listingId`);--> statement-breakpoint
CREATE INDEX `idx_barter_fromUser` ON `barterOffers` (`fromUserId`);--> statement-breakpoint
CREATE INDEX `idx_members_circle` ON `circleMembers` (`circleId`);--> statement-breakpoint
CREATE INDEX `idx_members_user` ON `circleMembers` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_listings_category` ON `listings` (`category`);--> statement-breakpoint
CREATE INDEX `idx_listings_emergency` ON `listings` (`isEmergency`);--> statement-breakpoint
CREATE INDEX `idx_listings_availability` ON `listings` (`availability`);--> statement-breakpoint
CREATE INDEX `idx_listings_user` ON `listings` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_circles_zip` ON `neighborhoodCircles` (`zipCode`);--> statement-breakpoint
CREATE INDEX `idx_rentals_listing` ON `rentals` (`listingId`);--> statement-breakpoint
CREATE INDEX `idx_rentals_renter` ON `rentals` (`renterId`);--> statement-breakpoint
CREATE INDEX `idx_rentals_status` ON `rentals` (`status`);--> statement-breakpoint
CREATE INDEX `idx_reviews_rental` ON `reviews` (`rentalId`);--> statement-breakpoint
CREATE INDEX `idx_reviews_toUser` ON `reviews` (`toUserId`);--> statement-breakpoint
CREATE INDEX `idx_tokens_user` ON `tokenTransactions` (`userId`);