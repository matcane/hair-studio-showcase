CREATE TABLE `hair_generations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`action_type` text NOT NULL,
	`action_id` text NOT NULL,
	`action_title` text,
	`style_texture` text,
	`style_length` text,
	`before_filename` text NOT NULL,
	`after_filename` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hair_generations_uuid_unique` ON `hair_generations` (`uuid`);--> statement-breakpoint
CREATE INDEX `looks_created_at_idx` ON `hair_generations` (`created_at`);