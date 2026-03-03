CREATE TABLE `team` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`invite_slug` text NOT NULL,
	`captain_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`captain_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_name_unique` ON `team` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `team_invite_slug_unique` ON `team` (`invite_slug`);--> statement-breakpoint
ALTER TABLE `participant` ADD `team_id` text REFERENCES team(id);