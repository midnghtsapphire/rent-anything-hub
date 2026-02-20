CREATE TABLE `supportTickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`category` enum('general','billing','listing','rental','safety','bug','other') NOT NULL DEFAULT 'general',
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`adminNotes` text,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportTickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `barterOffers` ADD `offeredItemValue` decimal(10,2);--> statement-breakpoint
ALTER TABLE `barterOffers` ADD `message` text;--> statement-breakpoint
ALTER TABLE `listings` ADD `condition` enum('like_new','good','fair','poor') DEFAULT 'good' NOT NULL;--> statement-breakpoint
ALTER TABLE `listings` ADD `viewCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `rentals` ADD `stripeCheckoutSessionId` varchar(255);--> statement-breakpoint
ALTER TABLE `rentals` ADD `meetupLocation` varchar(255);--> statement-breakpoint
ALTER TABLE `rentals` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `reviews` ADD `listingId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `reviews` ADD `reviewType` enum('renter_to_owner','owner_to_renter') NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_tickets_user` ON `supportTickets` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_tickets_status` ON `supportTickets` (`status`);--> statement-breakpoint
CREATE INDEX `idx_listings_weird` ON `listings` (`isWeird`);--> statement-breakpoint
CREATE INDEX `idx_reviews_listing` ON `reviews` (`listingId`);