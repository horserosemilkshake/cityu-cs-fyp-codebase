drop database if exists fypdb;
create database if not exists fypdb;
use fypdb;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `admin` ;

CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `eight_digit_hk_phone_number` varchar(255) DEFAULT NULL,
  `cryptowallet_address` varchar(255) DEFAULT NULL,
  `cryptowallet_private_key` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `client` ;

CREATE TABLE `client` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `eight_digit_hk_phone_number` varchar(255) DEFAULT NULL,
  `cryptowallet_address` varchar(255) DEFAULT NULL,
  `cryptowallet_private_key` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `eight_digit_hk_phone_number` (`eight_digit_hk_phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `driver` ;

CREATE TABLE `driver` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `eight_digit_hk_phone_number` varchar(255) DEFAULT NULL,
  `vehicle_capacity_in_kg` double DEFAULT '0',
  `container_height` double DEFAULT '0',
  `container_length` double DEFAULT '0',
  `container_width` double DEFAULT '0',
  `current_coordinate` varchar(255) DEFAULT NULL,
  `last_coordinate` varchar(255) DEFAULT NULL,
  `speed` double DEFAULT '0',
  `ready` tinyint(1) DEFAULT '0',
  `cryptowallet_address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `eight_digit_hk_phone_number` (`eight_digit_hk_phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `p2p_package` ;

CREATE TABLE `p2p_package` (
  `id` int NOT NULL AUTO_INCREMENT,
  `package_id` varchar(255) DEFAULT NULL,
  `package_description` varchar(255) DEFAULT NULL,
  `package_weight_in_kg` double DEFAULT NULL,
  `package_height` double DEFAULT '0',
  `package_length` double DEFAULT '0',
  `package_width` double DEFAULT '0',
  `package_sender_name` varchar(255) DEFAULT NULL,
  `package_recipient_name` varchar(255) DEFAULT NULL,
  `package_pickup_location` varchar(255) DEFAULT NULL,
  `package_pickup_coordinate` varchar(255) DEFAULT NULL,
  `package_destination` varchar(255) DEFAULT NULL,
  `package_destination_coordinate` varchar(255) DEFAULT NULL,
  `finished` tinyint(1) DEFAULT '0',
  `responsible_driver_name` varchar(255) DEFAULT NULL,
  `deadline` varchar(255) DEFAULT NULL,
  `time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `picked_up` tinyint(1) DEFAULT NULL,
  `image` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `package_id` (`package_id`),
  KEY `package_sender_name` (`package_sender_name`),
  KEY `package_recipient_name` (`package_recipient_name`),
  KEY `responsible_driver_name` (`responsible_driver_name`),
  CONSTRAINT `p2p_package_ibfk_1` FOREIGN KEY (`package_sender_name`) REFERENCES `client` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `points` ;

CREATE TABLE `points` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `coordinate` varchar(255) DEFAULT NULL,
  `position` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `username` (`username`),
  CONSTRAINT `points_ibfk_1` FOREIGN KEY (`username`) REFERENCES `driver` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=357 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `references` ;

CREATE TABLE `references` (
  `package_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `client_side_reference_hash` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `driver_side_reference_hash` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

DROP TABLE IF EXISTS `w2p_package` ;

CREATE TABLE `w2p_package` (
  `id` int NOT NULL AUTO_INCREMENT,
  `package_id` varchar(255) DEFAULT NULL,
  `package_description` varchar(255) DEFAULT NULL,
  `package_weight_in_kg` double DEFAULT NULL,
  `package_height` double DEFAULT '0',
  `package_length` double DEFAULT '0',
  `package_width` double DEFAULT '0',
  `package_recipient_name` varchar(255) DEFAULT NULL,
  `package_pickup_location` varchar(255) DEFAULT NULL,
  `package_pickup_coordinate` varchar(255) DEFAULT NULL,
  `package_destination` varchar(255) DEFAULT NULL,
  `package_destination_coordinate` varchar(255) DEFAULT NULL,
  `finished` tinyint(1) DEFAULT '0',
  `responsible_driver_name` varchar(255) DEFAULT NULL,
  `deadline` varchar(255) DEFAULT NULL,
  `time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `picked_up` tinyint(1) DEFAULT NULL,
  `image` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `package_id` (`package_id`),
  KEY `package_recipient_name` (`package_recipient_name`),
  KEY `responsible_driver_name` (`responsible_driver_name`),
  CONSTRAINT `w2p_package_ibfk_1` FOREIGN KEY (`package_recipient_name`) REFERENCES `client` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;



INSERT INTO `admin` (`id`, `username`, `password`, `eight_digit_hk_phone_number`, `cryptowallet_address`, `cryptowallet_private_key`) VALUES ('1','root','root','65890040','0x3EEf2554B7d4fD4863E95Dd486519F595E09F140','ZmJhYjYwMDMzYTBkOTIzNTljZmEyYmQyOWZmOTI0MWUyOTliYmFlMWMwOTEzNzVmNzkzNGNmNzg4NGZmZGQ3ZQ==');



INSERT INTO `client` (`id`, `username`, `password`, `nickname`, `eight_digit_hk_phone_number`, `cryptowallet_address`, `cryptowallet_private_key`) VALUES ('1','client1','password1','Alice Johnson','23479800','0xAa65ddf86831b99b5dd87aA1A32E7aA94Cc4BE29','MDQwZmQ0NmU4YzdlMmJlOTVhYzdlNzNkYjk0ZWY3ZGY0NzgxNDM5MzM3MDAzMjZkNDQwNzQzZmY3N2JlNGQ2ZA=='),('2','client2','password2','Bob Williams','32498077','0xAa65ddf86831b99b5dd87aA1A32E7aA94Cc4BE29','MDQwZmQ0NmU4YzdlMmJlOTVhYzdlNzNkYjk0ZWY3ZGY0NzgxNDM5MzM3MDAzMjZkNDQwNzQzZmY3N2JlNGQ2ZA==');



INSERT INTO `driver` (`id`, `username`, `password`, `nickname`, `eight_digit_hk_phone_number`, `vehicle_capacity_in_kg`, `container_height`, `container_length`, `container_width`, `current_coordinate`, `last_coordinate`, `speed`, `ready`, `cryptowallet_address`) VALUES ('1','driver1','password1','John Doe','12345678','1000','100','100','100','22.3846033,113.9667532','22.3846033,113.9667532','0','1','0x76eA3CB33f89f485811FdEcF073439E9cE9DF6D3'),('2','driver2','password2','Jane Smith','87654321','800','2','4','1.5','22.3632868,114.1237281','22.3632868,114.1237281','0','0','0x76eA3CB33f89f485811FdEcF073439E9cE9DF6D3');



INSERT INTO `p2p_package` (`id`, `package_id`, `package_description`, `package_weight_in_kg`, `package_height`, `package_length`, `package_width`, `package_sender_name`, `package_recipient_name`, `package_pickup_location`, `package_pickup_coordinate`, `package_destination`, `package_destination_coordinate`, `finished`, `responsible_driver_name`, `deadline`, `time`, `picked_up`, `image`) VALUES ('1','p2p001','Small package','1.5','0.2','0.3','0.2','client1','client2','G/F, 101-104, Sheung Chuk Yuen, Tam Mei','22.4736, 114.0600','Shop 6A, Shek Kong Upper Village, Yuen Long','22.4307, 114.1039','0',null,'2024-03-09 23:59:59','2024-03-09 21:48:28','0',null),('2','p2p002','Medium package','3','2','25','17','client2','client1','Shop G-11, G/F, Festival Walk, 80 Tat Chee Ave, Kowloon Tong','22.3368846, 114.1745502','1/F, HKPC Building, 78 Tat Chee Avenue, Kowloon, Hong Kong','22.335991, 114.175511','1','driver1','2024-03-09 23:59:59','2024-03-09 21:48:28','0',null),('3','p2p003','Small package','1.5','1','1','1','client2','client1','Wu Kai Sha Road, Ma On Shan','22.4298, 114.2422','Hong Chun Road, Sai Kung','22.3785, 114.2666','0',null,'2024-03-09 23:59:59','2024-03-09 21:48:28','0',null),('17','869318d2-4673-4a73-8967-4c761c7cd561','CCNA Study Guide (New)','1372.3420000000003','18.1','22.3','3.4','client1','client2','Tuen Mun Town Center','22.37399, 114.08107','Mong Kok Mall','22.37399, 114.19504','1','driver1','2024-06-25 06:55:25','2024-06-24 05:56:34','0',null);



INSERT INTO `points` (`id`, `username`, `coordinate`, `position`) VALUES ('352','driver1','["22.384592,114.08074","22.37399,114.08107","22.384592,114.19471","22.45293,114.00658"]','162253'),('353','driver1','22.3368846,114.1745502','1'),('354','driver1','22.335991,114.175511','2'),('355','driver1','22.37399,114.08107','3'),('356','driver1','22.37399,114.19504','4');



INSERT INTO `references` (`package_id`, `client_side_reference_hash`, `driver_side_reference_hash`) VALUES ('869318d2-4673-4a73-8967-4c761c7cd561','0x60e070408ee9a43dd1f58774828226dd4154c66d1c59f9f8c93fc09bec5d8ed9',null);



INSERT INTO `w2p_package` (`id`, `package_id`, `package_description`, `package_weight_in_kg`, `package_height`, `package_length`, `package_width`, `package_recipient_name`, `package_pickup_location`, `package_pickup_coordinate`, `package_destination`, `package_destination_coordinate`, `finished`, `responsible_driver_name`, `deadline`, `time`, `picked_up`, `image`) VALUES ('1','w2p001','Large package','10','1','1.5','1','client1','Pickup Location E','22.3728, 114.1170','Destination F','22.3382, 114.1476','0',null,'04:56','2024-03-09 21:49:00','0',null),('17','fd82a88b-2f7f-4f10-bc20-e63e4d3c029a','Linear Algerbra and Its Application','750','3','25','10','client2','Tuen Mun Swimming Pool','22.384608, 114.08071','Home 1A, Tai Tong Tsuen','22.357724, 114.02245','0',null,'2024-06-25 02:14:50','2024-06-24 01:15:20','0',null);

