CREATE TABLE `telegram_players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`telegramUserId` bigint NOT NULL,
	`username` varchar(64),
	`firstName` varchar(128) NOT NULL,
	`lastName` varchar(128),
	`languageCode` varchar(16),
	`photoUrl` text,
	`level` int NOT NULL DEFAULT 1,
	`experience` int NOT NULL DEFAULT 0,
	`questStreak` int NOT NULL DEFAULT 0,
	`relics` int NOT NULL DEFAULT 0,
	`playerStatus` enum('new','active','inactive') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `telegram_players_id` PRIMARY KEY(`id`),
	CONSTRAINT `telegram_players_telegramUserId_unique` UNIQUE(`telegramUserId`)
);
