ALTER TABLE `team` ADD `name_canonical` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `team_name_canonical_unique` ON `team` (`name_canonical`);