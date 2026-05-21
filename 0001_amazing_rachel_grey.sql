CREATE TABLE `fiber_routes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`routeId` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`points` text NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`color` varchar(32) NOT NULL DEFAULT '#EF4444',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fiber_routes_id` PRIMARY KEY(`id`),
	CONSTRAINT `fiber_routes_routeId_unique` UNIQUE(`routeId`)
);
