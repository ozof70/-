CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`item` text NOT NULL,
	`renter` text NOT NULL,
	`renterName` text NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`total` integer NOT NULL,
	FOREIGN KEY (`item`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_bookings_item_dates` ON `bookings` (`item`,`start`,`end`);--> statement-breakpoint
CREATE INDEX `idx_bookings_renter` ON `bookings` (`renter`);--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`ownerName` text NOT NULL,
	`title` text NOT NULL,
	`series` text NOT NULL,
	`size` text NOT NULL,
	`city` text NOT NULL,
	`price` integer NOT NULL,
	`deposit` integer NOT NULL,
	`description` text NOT NULL,
	`delivery` text NOT NULL,
	`image` text NOT NULL,
	`created` integer NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_items_owner` ON `items` (`owner`);