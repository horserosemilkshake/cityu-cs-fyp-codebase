-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: fypdb
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `eight_digit_hk_phone_number` varchar(255) DEFAULT NULL,
  `cryptowallet_address` varchar(255) DEFAULT NULL,
  `cryptowallet_private_key` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'root','root','65890040','0x3EEf2554B7d4fD4863E95Dd486519F595E09F140','fbab60033a0d92359cfa2bd29ff9241e299bbae1c091375f7934cf7884ffdd7e');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `eight_digit_hk_phone_number` varchar(255) DEFAULT NULL,
  `cryptowallet_address` varchar(255) DEFAULT NULL,
  `cryptowallet_private_key` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `eight_digit_hk_phone_number` (`eight_digit_hk_phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client`
--

LOCK TABLES `client` WRITE;
/*!40000 ALTER TABLE `client` DISABLE KEYS */;
INSERT INTO `client` VALUES (1,'client1','password1','Alice Johnson','11111111','0xAa65ddf86831b99b5dd87aA1A32E7aA94Cc4BE29','040fd46e8c7e2be95ac7e73db94ef7df478143933700326d440743ff77be4d6d'),(2,'client2','password2','Bob Williams','22222222','0xAa65ddf86831b99b5dd87aA1A32E7aA94Cc4BE29','040fd46e8c7e2be95ac7e73db94ef7df478143933700326d440743ff77be4d6d');
/*!40000 ALTER TABLE `client` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver`
--

DROP TABLE IF EXISTS `driver`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver`
--

LOCK TABLES `driver` WRITE;
/*!40000 ALTER TABLE `driver` DISABLE KEYS */;
INSERT INTO `driver` VALUES (1,'driver1','password1','John Doe','12345678',1000,2.5,5,2,'22.3745317,113.9655417','22.3745317,113.9655417',0,1,'0x76eA3CB33f89f485811FdEcF073439E9cE9DF6D3'),(2,'driver2','password2','Jane Smith','87654321',800,2,4,1.5,'22.3456,114.7890','22.4567,114.8901',50,0,'0x76eA3CB33f89f485811FdEcF073439E9cE9DF6D3');
/*!40000 ALTER TABLE `driver` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `p2p_package`
--

DROP TABLE IF EXISTS `p2p_package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `package_id` (`package_id`),
  KEY `package_sender_name` (`package_sender_name`),
  KEY `package_recipient_name` (`package_recipient_name`),
  KEY `responsible_driver_name` (`responsible_driver_name`),
  CONSTRAINT `p2p_package_ibfk_1` FOREIGN KEY (`package_sender_name`) REFERENCES `client` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `p2p_package`
--

LOCK TABLES `p2p_package` WRITE;
/*!40000 ALTER TABLE `p2p_package` DISABLE KEYS */;
INSERT INTO `p2p_package` VALUES (1,'p2p001','Small package',1.5,0.2,0.3,0.2,'client1','client2','Pickup Location A','22.4736, 114.0600','Destination B','22.4307, 114.1039',0,NULL,'23:59','2024-03-09 13:48:28'),(2,'p2p002','Medium package',3,0.4,0.6,0.4,'client2','client1','Pickup Location C','22.3666, 114.0705','Destination D','22.3687, 114.0599',0,NULL,'23:58','2024-03-09 13:48:28'),(3,'p2p003','Small package',1.5,1,1,1,'client2','client1','Pickup Location C','22.4298, 114.2422','Destination B','22.3785, 114.2666',0,NULL,'23:59','2024-03-09 13:48:28');
/*!40000 ALTER TABLE `p2p_package` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `points`
--

DROP TABLE IF EXISTS `points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `points` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `coordinate` varchar(255) DEFAULT NULL,
  `position` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `username` (`username`),
  CONSTRAINT `points_ibfk_1` FOREIGN KEY (`username`) REFERENCES `driver` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=304 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `points`
--

LOCK TABLES `points` WRITE;
/*!40000 ALTER TABLE `points` DISABLE KEYS */;
/*!40000 ALTER TABLE `points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `w2p_package`
--

DROP TABLE IF EXISTS `w2p_package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `package_id` (`package_id`),
  KEY `package_recipient_name` (`package_recipient_name`),
  KEY `responsible_driver_name` (`responsible_driver_name`),
  CONSTRAINT `w2p_package_ibfk_1` FOREIGN KEY (`package_recipient_name`) REFERENCES `client` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `w2p_package`
--

LOCK TABLES `w2p_package` WRITE;
/*!40000 ALTER TABLE `w2p_package` DISABLE KEYS */;
INSERT INTO `w2p_package` VALUES (1,'w2p001','Large package',10,1,1.5,1,'client1','Pickup Location E','22.3728, 114.1170','Destination F','22.3382, 114.1476',0,NULL,'04:56','2024-03-09 13:49:00');
/*!40000 ALTER TABLE `w2p_package` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-04-28  8:32:10
