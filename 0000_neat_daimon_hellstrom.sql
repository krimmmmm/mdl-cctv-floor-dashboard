CREATE TABLE `activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipmentId` varchar(64) NOT NULL,
	`equipmentName` varchar(128) NOT NULL,
	`equipmentType` enum('camera','rack','cabinet') NOT NULL,
	`changeType` enum('status','position','rotation','installation_step') NOT NULL,
	`action` text NOT NULL,
	`oldValue` text,
	`newValue` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cabinet_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cabinetId` varchar(64) NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'idle',
	`installationStatus` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`installCabinet` boolean NOT NULL DEFAULT false,
	`acPower` boolean NOT NULL DEFAULT false,
	`utp` boolean NOT NULL DEFAULT false,
	`poeSwitch` boolean NOT NULL DEFAULT false,
	`fiberOptic` boolean NOT NULL DEFAULT false,
	`ready` boolean NOT NULL DEFAULT false,
	`x` float NOT NULL DEFAULT 0,
	`y` float NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cabinet_status_id` PRIMARY KEY(`id`),
	CONSTRAINT `cabinet_status_cabinetId_unique` UNIQUE(`cabinetId`)
);
--> statement-breakpoint
CREATE TABLE `camera_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cameraId` varchar(64) NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'idle',
	`installationStatus` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`wiringUTP` boolean NOT NULL DEFAULT false,
	`wallMountingInstalled` boolean NOT NULL DEFAULT false,
	`domeCameraInstalled` boolean NOT NULL DEFAULT false,
	`x` float NOT NULL DEFAULT 0,
	`y` float NOT NULL DEFAULT 0,
	`rotation` float NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `camera_status_id` PRIMARY KEY(`id`),
	CONSTRAINT `camera_status_cameraId_unique` UNIQUE(`cameraId`)
);
--> statement-breakpoint
CREATE TABLE `rack_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rackId` varchar(64) NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'idle',
	`installationStatus` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`acPower` boolean NOT NULL DEFAULT false,
	`utp` boolean NOT NULL DEFAULT false,
	`poeSwitch` boolean NOT NULL DEFAULT false,
	`fiberOptic` boolean NOT NULL DEFAULT false,
	`ready` boolean NOT NULL DEFAULT false,
	`x` float NOT NULL DEFAULT 0,
	`y` float NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rack_status_id` PRIMARY KEY(`id`),
	CONSTRAINT `rack_status_rackId_unique` UNIQUE(`rackId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
