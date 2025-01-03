CREATE DATABASE IF NOT EXISTS fypdb;

USE fypdb;

CREATE TABLE IF NOT EXISTS driver (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    nickname VARCHAR(255),
    eight_digit_hk_phone_number VARCHAR(255) UNIQUE,
    vehicle_capacity_in_kg DOUBLE DEFAULT 0.0,
    container_height DOUBLE DEFAULT 0.0,
    container_length DOUBLE DEFAULT 0.0,
    container_width DOUBLE DEFAULT 0.0,
    current_coordinate VARCHAR(255),
    last_coordinate VARCHAR(255),
    speed DOUBLE DEFAULT 0.0,
    ready BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS client (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    nickname VARCHAR(255),
    eight_digit_hk_phone_number VARCHAR(255) UNIQUE
);

CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS p2p_package (
    id INT AUTO_INCREMENT PRIMARY KEY,
    package_id VARCHAR(255) UNIQUE,
    package_description VARCHAR(255),
    package_weight_in_kg DOUBLE,
    package_height DOUBLE DEFAULT 0.0,
    package_length DOUBLE DEFAULT 0.0,
    package_width DOUBLE DEFAULT 0.0,
    package_sender_name VARCHAR(255),
    package_recipient_name VARCHAR(255),
    package_pickup_location VARCHAR(255),
    package_pickup_coordinate VARCHAR(255),
    package_destination VARCHAR(255),
    package_destination_coordinate VARCHAR(255),
    finished BOOLEAN DEFAULT false,
    responsible_driver_name VARCHAR(255),
    FOREIGN KEY (package_sender_name) REFERENCES client(username),
    FOREIGN KEY (package_recipient_name) REFERENCES client(username),
    FOREIGN KEY (responsible_driver_name) REFERENCES driver(username)
);

CREATE TABLE IF NOT EXISTS w2p_package (
    id INT AUTO_INCREMENT PRIMARY KEY,
    package_id VARCHAR(255) UNIQUE,
    package_description VARCHAR(255),
    package_weight_in_kg DOUBLE,
    package_height DOUBLE DEFAULT 0.0,
    package_length DOUBLE DEFAULT 0.0,
    package_width DOUBLE DEFAULT 0.0,
    package_recipient_name VARCHAR(255),
    package_pickup_location VARCHAR(255),
    package_pickup_coordinate VARCHAR(255),
    package_destination VARCHAR(255),
    package_destination_coordinate VARCHAR(255),
    finished BOOLEAN DEFAULT false,
    responsible_driver_name VARCHAR(255),
    FOREIGN KEY (package_recipient_name) REFERENCES client(username),
    FOREIGN KEY (responsible_driver_name) REFERENCES driver(username)
);


INSERT INTO admin (username, password)
VALUES 
    ('root', 'root');

INSERT INTO driver (username, password, nickname, eight_digit_hk_phone_number, vehicle_capacity_in_kg, container_height, container_length, container_width, current_coordinate, last_coordinate, speed, ready)
VALUES 
    ('driver1', 'password1', 'John Doe', '12345678', 1000.0, 2.5, 5.0, 2.0, '22.1234,114.5678', '22.2345,114.6789', 60.0, true),
    ('driver2', 'password2', 'Jane Smith', '87654321', 800.0, 2.0, 4.0, 1.5, '22.3456,114.7890', '22.4567,114.8901', 50.0, false);

INSERT INTO client (username, password, nickname, eight_digit_hk_phone_number)
VALUES 
    ('client1', 'password1', 'Alice Johnson', '11111111'),
    ('client2', 'password2', 'Bob Williams', '22222222');

INSERT INTO p2p_package (package_id, package_description, package_weight_in_kg, package_height, package_length, package_width, package_sender_name, package_recipient_name, package_pickup_location, package_pickup_coordinate, package_destination, package_destination_coordinate, finished, responsible_driver_name)
VALUES 
    ('p2p001', 'Small package', 1.5, 0.2, 0.3, 0.2, 'client1', 'client2', 'Pickup Location A', '22.1111,114.2222', 'Destination B', '22.3333,114.4444', false, NULL),
    ('p2p002', 'Medium package', 3.0, 0.4, 0.6, 0.4, 'client2', 'client1', 'Pickup Location C', '22.5555,114.6666', 'Destination D', '22.7777,114.8888', true, 'driver1');


INSERT INTO w2p_package (package_id, package_description, package_weight_in_kg, package_height, package_length, package_width, package_recipient_name, package_pickup_location, package_pickup_coordinate, package_destination, package_destination_coordinate, finished, responsible_driver_name)
VALUES 
    ('w2p001', 'Large package', 10.0, 1.0, 1.5, 1.0, 'client1', 'Pickup Location E', '22.9999,114.0000', 'Destination F', '22.1111,114.2222', false, NULL);

