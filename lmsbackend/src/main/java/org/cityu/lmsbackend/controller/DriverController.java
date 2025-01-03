package org.cityu.lmsbackend.controller;

import java.nio.DoubleBuffer;
import java.util.ArrayList;
import java.util.Arrays;

import java.util.List;

import cn.dev33.satoken.util.SaResult;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import org.cityu.lmsbackend.mapper.InfrastructureServiceMapper;
import org.cityu.lmsbackend.model.Client;
import org.cityu.lmsbackend.model.Deliverer;
import org.cityu.lmsbackend.model.P2PPackage;
import org.cityu.lmsbackend.service.DriverService;
import org.cityu.lmsbackend.utils.*;
import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.Persistent;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import cn.dev33.satoken.annotation.SaCheckRole;

//@SaCheckRole("DRIVER")
@RestController
@CrossOrigin
@RequestMapping("/api/v1/driver/")
public class DriverController {
    @Autowired
    private DriverService driverService;

    @Autowired
    private InfrastructureServiceMapper infrastructureServiceMapper;

    @PostMapping("record")
    public synchronized String getRecord(@RequestBody PackageGetRequestData requestData) throws JsonProcessingException {
        System.out.println("Get packages invoked.");
        String username = requestData.getUsername();
        int warehouse = requestData.getWarehouse();
        return driverService.getDeliveryRecord(username);
    }

    @PostMapping("package")
    public synchronized String parseGetUndeliveredPackage(@RequestBody PackageGetRequestData requestData) throws JsonProcessingException {
        System.out.println("Get packages invoked.");
        String username = requestData.getUsername();
        int warehouse = requestData.getWarehouse();
        return getUndeliveredPackage(username, warehouse);
    }

    @PostMapping("user-info")
    public synchronized String parseUserInfo(@RequestBody GetDriverInfoData requestData) throws JsonProcessingException {
        String username = requestData.getUsername();
        return driverService.getDriver(username);
    }

    @PostMapping("pid")
    public String updatePid(@RequestBody TransactionHash requestData) {
        infrastructureServiceMapper.addDriverReferenceHashWithPackageID(requestData.getPackageId(), requestData.getHash());
        return new Gson().toJson(requestData.getHash());
    }

    @PostMapping("logout")
    public synchronized void logout(@RequestBody GetDriverInfoData requestData) {
        String username = requestData.getUsername();
        driverService.offline(username);
    }

    @PutMapping("update-position")
    public HttpStatus updatePosition(@RequestBody GetDriverPositionInfoData requestData) throws JsonProcessingException {
        String username = requestData.getUsername();
        String currentCoordinate = requestData.getCurrentCoordinate();
        String lastCoordinate = requestData.getLastCoordinate();
        Double updateTimeInterval = requestData.getUpdateTimeInterval();
        return updatePosition(username, currentCoordinate, lastCoordinate, updateTimeInterval);
    }

    public HttpStatus updatePosition(String username, String currentCoordinate, String lastCoordinate, Double updateTimeInterval) {
        System.out.println("updatePosition invoked.");
        driverService.updatePosition(username, currentCoordinate, lastCoordinate, updateTimeInterval);
        return HttpStatus.ACCEPTED;
    }
    

    public synchronized String getUndeliveredPackage(
            @RequestParam(name = "username") String username,
            @RequestParam(name = "warehouse") int warehousePresent) throws JsonProcessingException { // 0 - p2p delivery, not 0 - w2p delivery
    	return driverService.getPackage(username, warehousePresent);	
    }

    @PostMapping("change-driver-profile")
    public HttpStatus changeDriverProfile(@RequestBody Deliverer clientRegistrationForm) {
        try {
            String username = clientRegistrationForm.getUsername();

            String password = clientRegistrationForm.getPassword();
            String nickname = clientRegistrationForm.getNickname();
            String eight_digit_hk_phone_number = clientRegistrationForm.getEight_digit_hk_phone_number();
            Double capacity = clientRegistrationForm.getVehicle_capacity_in_kg();
            Double length = clientRegistrationForm.getContainer_length();
            Double width = clientRegistrationForm.getContainer_width();
            Double height = clientRegistrationForm.getContainer_height();
            String ca = clientRegistrationForm.getCryptowallet_address();

            infrastructureServiceMapper.changeDriverProfile(username, password, nickname, eight_digit_hk_phone_number, capacity, height, length, width, ca);
            return HttpStatus.OK;
        } catch (IllegalStateException e) {
            return HttpStatus.CONFLICT;
        } catch (Error e) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }

    @PostMapping("register")
    public HttpStatus registerNewUser(@RequestBody Deliverer clientRegistrationForm) {
        try {
            String username = clientRegistrationForm.getUsername().trim().replaceAll("[^a-zA-Z0-9]", "");
            List<Client> allUsernames = infrastructureServiceMapper.selectAllFromClient();
            for (Client client : allUsernames) {
                if (client.getUsername().equals(username)) {
                    throw new IllegalStateException("Same username");
                }
            }

            String password = clientRegistrationForm.getPassword().trim().replaceAll("[^a-zA-Z0-9]", "");
            String nickname = clientRegistrationForm.getNickname().trim().replaceAll("[^a-zA-Z0-9]", "");
            String eight_digit_hk_phone_number = clientRegistrationForm.getEight_digit_hk_phone_number().trim().replaceAll("[^a-zA-Z0-9]", "");
            Double capacity = clientRegistrationForm.getVehicle_capacity_in_kg();
            Double length = clientRegistrationForm.getContainer_length();
            Double width = clientRegistrationForm.getContainer_width();
            Double height = clientRegistrationForm.getContainer_height();
            String currentCoordinate = clientRegistrationForm.getCurrent_coordinate();
            String lastCoordinate = clientRegistrationForm.getLast_coordinate();
            Double speed = clientRegistrationForm.getSpeed();
            Boolean ready = clientRegistrationForm.getReady();
            String ca = clientRegistrationForm.getCryptowallet_address();

            infrastructureServiceMapper.insertDriver(username, password, nickname, eight_digit_hk_phone_number, capacity, height, length, width, currentCoordinate, lastCoordinate, speed, ready, ca);
            return HttpStatus.OK;
        } catch (IllegalStateException e) {
            return HttpStatus.CONFLICT;
        } catch (Error e) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }

    @PostMapping("transaction-reference-hash")
    public synchronized String trh (@RequestBody GetTRD pID) {
        System.out.println("trh invoked.");
        String pid = pID.getpID();
        return driverService.getDriverTransactionHashWithPackageID(pid);
    }

    @PutMapping("package")
    public synchronized ResponseEntity<String> occupyPackage(@RequestBody GetDriverSelectedPackageData requestData) throws JsonProcessingException {
        System.out.println("occupyPackage invoked.");
        String username = requestData.getUsername();
        List<String> packageIds = requestData.getPackageIds();
        int warehousePresent = requestData.getWarehousePresent();
        System.out.println(username);
        System.out.println(packageIds);
        System.out.println(warehousePresent);
        ResponseEntity<String> output = driverService.occupyPackage(username, packageIds, warehousePresent);
        System.out.println(output.toString());
        return output;
    }

    @DeleteMapping("pickup")
    public synchronized HttpStatus pickupPackage(@RequestBody GetDriverReleasePackageData requestData) throws JsonProcessingException {
        String username = requestData.getUsername();
        String packageId = requestData.getPackageId();
        int warehousePresent = requestData.getWarehousePresent();
        return driverService.pickupPackage(username, packageId, warehousePresent);
    }

    @DeleteMapping("package")
    public synchronized HttpStatus releasePackage(@RequestBody GetDriverReleasePackageData requestData) throws JsonProcessingException {
        String username = requestData.getUsername();
        String packageId = requestData.getPackageId();
        int warehousePresent = requestData.getWarehousePresent();
        return driverService.releasePackage(username, packageId, warehousePresent);
    }

    @PostMapping("path")
    public synchronized HttpStatus setPath(@RequestBody GetDriverPath requestData){
        String username = requestData.getUsername();
        List<String> path = new ArrayList<>();
        for (List<Double> foo : requestData.getPath()) {
            path.add(String.valueOf(foo.get(0)) + "," + String.valueOf(foo.get(1)));
        }
        return driverService.setPath(username, path);
    }

    @DeleteMapping("path")
    public synchronized HttpStatus releasePath(@RequestBody GetDriverPath requestData){
        String username = requestData.getUsername();
        List<String> path = new ArrayList<>();
        for (List<Double> foo : requestData.getPath()) {
            path.add(String.valueOf(foo.get(0)) + "," + String.valueOf(foo.get(1)));
        }
        return driverService.releaseLocation(username, path);
    }
}
