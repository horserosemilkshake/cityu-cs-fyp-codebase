# Dandelion LMS Development and Maintenance Manual

## Introduction

The Dandelion LMS is a comprehensive software system that manages the pickup and delivery of packages in the real world. It consists of three main applications:

1. **Recipient Application**: A React TypeScript application used by package recipients to track their orders and manage delivery preferences.
2. **Administrator Application**: A React TypeScript application used by system administrators to monitor and manage the overall package delivery process.
3. **Deliverer Application**: A React Native application used by delivery personnel to receive and update delivery information on the go.

These applications exchange information with a Spring Boot backend and a Python external service. The external service depends on an OSRM service (a modern C++ routing engine for shortest paths in road networks) running on a docker container, and the Spring Boot backend relies on a MySQL database.

## Components

### Recipient Application
The Recipient Application is a React TypeScript application that allows package recipients to track their orders and manage their delivery preferences. It provides the following features:

- User authentication and authorization
- Order tracking and status updates
- Delivery preference management (e.g., preferred delivery time, location)

### Administrator Application
The Administrator Application is a React TypeScript application that allows system administrators to monitor and manage the overall package delivery process. It provides the following features:

- User management (employees, recipients, etc.)
- Order management and tracking
- Analytics and reporting

### Deliverer Application
The Deliverer Application is a React Native application that allows delivery personnel to receive and update delivery information on the go. It provides the following features:

- Order assignment and tracking
- Route optimization and navigation
- Delivery status updates

### Spring Boot Backend
The Spring Boot backend serves as the central API for the Dandelion LMS applications. It provides the following functionalities:

- User authentication and authorization
- Order management and tracking
- Delivery fleet and driver management
- Integration with the Python external service

### Python External Service
The Python external service is responsible for handling the optimization of delivery routes and schedules. It integrates with the OSRM container to provide the following features:

- Real-time traffic and road condition monitoring
- Route optimization and dispatch
- Delivery schedule and assignment optimization

### OSRM Container
The OSRM (Open Source Routing Machine) container is a self-hosted routing engine that provides efficient route planning and navigation capabilities. It is used by the Python external service to optimize delivery routes.

**_Important: The files of the OSRM Container are NOT in this repository. You should refer to https://gitlab.com/horserosemilkshake/osrm and download it according to the guidelines provided in that repository before proceeding to deployment._**

### MySQL Database
The MySQL database is used by the Spring Boot backend to store all the relevant data, including user information, orders, delivery schedules, and more.

## Deployment (Localhost Testing)

To deploy the Dandelion LMS, follow these steps:

1. **Set up the infrastructure**:
   - Provide the necessary resources pre-requisites (Android emulator/a real android phone with USB debugging enabled, Docker, databases, etc.) to host the various components of the system.
   - Set up the MySQL database and ensure that it is running on port `3306`. Load data using one of the dump sql files in the `dump` folder.

2. **Deploy the Spring Boot Backend, OSRM, and the Python External Service**:
   - Open command line.
   - Make sure that the current directory is `Codebase`.
   - Run `vi docker-compose.yml`. In vi, replace `jdbc:mysql://rm-3ns7zahy68883on2yoo.mysql.rds.aliyuncs.com:3306/` with `jdbc:mysql://localhost:3306/`.
   - **_Important: The files of the OSRM Container are NOT in this repository. You should refer to https://gitlab.com/horserosemilkshake/osrm and download it according to the guidelines provided in that repository before proceeding to deployment._**
   - Run `docker-compose up`.

3. **Build and deploy the front-end applications**:
   - Building the Administrator Application:
       - Ensure that in the `global.ts` of `admin-app`, `mode` is set to `null`. That will force the application to connect to the backend system via localhost.
       - `cd admin-app && npm run start`
   - Building the Recipient Application:
       - Ensure that in the `global.ts` of `recipient-app`, `mode` is set to `null`. That will force the application to connect to the backend system via localhost.
       - `cd recipient-app && npm run start`
   - Building the Deliverer Application:
       - Ensure that in the `global.ts` of `dandelion-lms-frontend-driver-app`, `mode` is set to `null`. That will force the application to connect to the backend system via localhost.
       - `cd dandelion-lms-frontend-driver-app && npm run start`
   - Troubleshooting:
       - If any of these builds failed, it is possible that you have not installed the proper packages for the application to run on your device. 
           - Solution: Run `npm i` in the project folder of the project that failed building.

## Deployment (Release)

1. **Set up the infrastructure**:
   - Same but this repository needs to be copied to the chosen online cloud server first. The service provider should get all the pre-requisites configured.
   - Set up the MySQL database and ensure that it is running on port `3306`. The database can be configured using a similar manner, perferably in a seperate server if resources allow.

2. **Deploy the Spring Boot Backend, OSRM, and the Python External Service**:
   - Open command line on the cloud server.
   - Make sure that the current directory is `Codebase`.
   - Run `vi docker-compose.yml`. In vi, replace `jdbc:mysql://localhost:3306/` with `jdbc:mysql://rm-3ns7zahy68883on2yoo.mysql.rds.aliyuncs.com:3306/` (or the url to your configured database).
   - **_Important: The files of the OSRM Container are NOT in this repository. You should refer to https://gitlab.com/horserosemilkshake/osrm and download it according to the guidelines provided in that repository before proceeding to deployment._**
   - Run `docker-compose up`.

3. **Build and deploy the front-end applications**:
   - The following steps is done on your local machine, not the cloud server.
   - Building the Administrator Application:
       - Ensure that in the `global.ts` of `admin-app`, `mode` is set to `p` and `productionServerDomain` is set to your cloud server's public ip or domain name. That will force the application to connect to the backend system externally.
       - `cd admin-app && npm run start`
   - Building the Recipient Application:
       - Ensure that in the `global.ts` of `recipient-app`, `mode` is set to `p` and `productionServerDomain` is set to your cloud server's public ip or domain name. That will force the application to connect to the backend system externally.
       - `cd recipient-app && npm run start`
   - Building the Deliverer Application:
       - Ensure that in the `global.ts` of `dandelion-lms-frontend-driver-app`, `mode` is set to `p` and `productionServerDomain` is set to your cloud server's public ip or domain name. That will force the application to connect to the backend system externally.
       - `cd dandelion-lms-frontend-driver-app && npm run start`
   - Troubleshooting:
       - If any of these builds failed, it is possible that you have not installed the proper packages for the application to run on your device. 
           - Solution: Run `npm i` in the project folder of the project that failed building.
       - If any of these builds failed to login even if proper credentials, it is possible that the firewall configuration of your hosting cloud server is not configured properly, banning the front-end applications from sending request to the backend.
           - Solution: Add the IP address of your local machine and android device (if any) to the visit whitelist of your cloud instance.


By following these steps, you can successfully deploy the Dandelion LMS and ensure its smooth operation.