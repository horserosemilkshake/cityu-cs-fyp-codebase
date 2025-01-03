package org.cityu.lmsbackend.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.cityu.lmsbackend.mapper.InfrastructureServiceMapper;
import org.cityu.lmsbackend.mapper.PackageAlteringMapper;
import org.cityu.lmsbackend.model.Client;
import org.cityu.lmsbackend.model.Deliverer;
import org.cityu.lmsbackend.model.P2PPackage;
import org.cityu.lmsbackend.model.W2PPackage;
import org.cityu.lmsbackend.service.ClientService;
import org.cityu.lmsbackend.service.DriverService;
import org.cityu.lmsbackend.utils.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Type;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.util.*;

//@SaCheckRole("RECIPIENT")
@RestController
@CrossOrigin
@RequestMapping("/api/v1/client/")
public class ClientController {
    @Autowired
    private ClientService clientService;

    @Autowired
    private DriverService driverService;

    @Autowired
    private InfrastructureServiceMapper infrastructureServiceMapper;

    @Autowired
    private PackageAlteringMapper packageAlteringMapper;

    @PostMapping("package")
    public List<Object> getAllPackagesByRecipientUserName(@RequestBody GetDriverInfoData requestData) {
        String userName = requestData.getUsername();
        List<Object> listOfPackage = new ArrayList<>();
        listOfPackage.addAll(clientService.getAllP2PPackageByRecipientUserName(userName));
        listOfPackage.addAll(clientService.getAllW2PPackageByRecipientUserName(userName));
        return listOfPackage;
    }

    @PostMapping("outgoing-package")
    public List<Object> getAllPackagesBySenderUserName(@RequestBody GetDriverInfoData requestData) {
        String userName = requestData.getUsername();
        return new ArrayList<>(clientService.getAllP2PPackageBySenderUserName(userName));
    }

    @PostMapping("pid")
    public String updatePid(@RequestBody TransactionHash requestData) {
        infrastructureServiceMapper.addClientReferenceHashWithPackageID(requestData.getPackageId(), requestData.getHash());
        return new Gson().toJson(requestData.getHash());
    }

    @PostMapping("change-user-profile")
    public HttpStatus changeUserProfile(@RequestBody Client clientRegistrationForm) {
        try {
            String username = clientRegistrationForm.getUsername();
            String password = clientRegistrationForm.getPassword();
            String nickname = clientRegistrationForm.getNickname();
            String eight_digit_hk_phone_number = clientRegistrationForm.getEight_digit_hk_phone_number();

            Client oldClient = infrastructureServiceMapper.selectClientByName(username);
            String ca = "";
            String cpk = "";
            if (oldClient.getCryptowallet_address().equalsIgnoreCase(clientRegistrationForm.getCryptowallet_address())) {
                ca = oldClient.getCryptowallet_address();
                cpk = oldClient.getCryptowallet_private_key();
            } else {
                ca = clientRegistrationForm.getCryptowallet_address();
                cpk = new String(Base64.getEncoder().encode(clientRegistrationForm.getCryptowallet_private_key().getBytes(StandardCharsets.UTF_8)), StandardCharsets.UTF_8);
            }

            infrastructureServiceMapper.changeClientProfile(username, password, nickname, eight_digit_hk_phone_number, ca, cpk);
            return HttpStatus.OK;
        } catch (IllegalStateException e) {
            return HttpStatus.CONFLICT;
        } catch (Error e) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }

    @PostMapping("register")
    public HttpStatus registerNewUser(@RequestBody Client clientRegistrationForm) {
        try {
            String username = clientRegistrationForm.getUsername();
            List<Client> allUsernames = infrastructureServiceMapper.selectAllFromClient();
            for (Client client : allUsernames) {
                if (client.getUsername().equals(username)) {
                    throw new IllegalStateException("Same username");
                }
            }

            String password = clientRegistrationForm.getPassword();
            String nickname = clientRegistrationForm.getNickname();
            String eight_digit_hk_phone_number = clientRegistrationForm.getEight_digit_hk_phone_number();
            String ca = clientRegistrationForm.getCryptowallet_address();
            String cpk = new String(Base64.getEncoder().encode(clientRegistrationForm.getCryptowallet_private_key().getBytes(StandardCharsets.UTF_8)), StandardCharsets.UTF_8);

            infrastructureServiceMapper.insertClient(username, password, nickname, eight_digit_hk_phone_number, ca, cpk);
            return HttpStatus.OK;
        } catch (IllegalStateException e) {
            return HttpStatus.CONFLICT;
        } catch (Error e) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }

    @PutMapping("package")
    public HttpStatus addP2PPackage(@RequestBody PackageFormData requestData) {
        try {
            System.out.println(requestData);

            if (requestData.getPackageLength() < 0 || requestData.getPackageWidth() < 0 || requestData.getPackageHeight() < 0 || requestData.getPackageWeight() < 0) {
                throw new IllegalStateException("Invalid dimensions");
            }

            if (requestData.getWarehousePresent() != 0 && requestData.getWarehousePresent() != 1) {
                throw new IllegalStateException("Invalid warehouse state");
            }

            if (requestData.getWarehousePresent() == 1) {
                requestData.setPackageDescription(requestData.getPackageDescription().replaceAll("['\"\\\\]", "\\\\$0"));
                W2PPackage foo = new W2PPackage(
                        "",
                        requestData.getPackageId(),
                        requestData.getPackageDescription(),
                        requestData.getPackageWeight(),
                        requestData.getPackageHeight(),
                        requestData.getPackageLength(),
                        requestData.getPackageWidth(),
                        requestData.getRecipientName(),
                        requestData.getPickupLocation(),
                        requestData.getPickupCoordinate(),
                        requestData.getDestination(),
                        requestData.getDestinationCoordinate(),
                        false,
                        null,
                        requestData.getDeadline(),
                        new Timestamp(System.currentTimeMillis()),
                        false,
                        requestData.getImage()
                );
                packageAlteringMapper.insertW2PPackage(foo);
            } else {
                requestData.setPackageDescription(requestData.getPackageDescription().replaceAll("['\"\\\\]", "\\\\$0"));
                P2PPackage foo = new P2PPackage(
                        "",
                        requestData.getPackageId(),
                        requestData.getPackageDescription(),
                        requestData.getPackageWeight(),
                        requestData.getPackageHeight(),
                        requestData.getPackageLength(),
                        requestData.getPackageWidth(),
                        requestData.getSenderName(),
                        requestData.getRecipientName(),
                        requestData.getPickupLocation(),
                        requestData.getPickupCoordinate(),
                        requestData.getDestination(),
                        requestData.getDestinationCoordinate(),
                        false,
                        null,
                        requestData.getDeadline(),
                        new Timestamp(System.currentTimeMillis()),
                        false,
                        requestData.getImage()
                );
                packageAlteringMapper.insertP2PPackage(foo);
            }
        } catch (Exception e) {
            System.out.println(e.toString());
            return HttpStatus.CONFLICT;
        }
        return HttpStatus.ACCEPTED;
    }

    @PostMapping("transaction-reference-hash")
    public synchronized String trh (@RequestBody GetTRD pID) {
        String pid = pID.getpID();
        System.out.println("trh invoked with " + pid);
        return clientService.getClientTransactionHashWithPackageID(pid);
    }

    @PostMapping("user-info")
    public synchronized String parseUserInfo(@RequestBody GetDriverInfoData requestData) throws JsonProcessingException {
        String username = requestData.getUsername();
        return clientService.getClientByUserName(username);
    }

    @PostMapping("get-all-responsible-drivers-info-by-recipient-username")
    public Map<String, Map<String, String>> getAllResponsibleDriversInfoByRecipientUserName(@RequestBody GetDriverInfoData requestData) {
        String userName = requestData.getUsername();
        Map<String, Map<String, String>> query = new HashMap<>();
        Gson gson = new Gson();
        Type listType = new TypeToken<ArrayList<String>>(){}.getType();

        for (P2PPackage p : clientService.getAllP2PPackageByRecipientUserName(userName)) {
            if (p.getResponsible_driver_name() == null) {
                continue;
            }
            Deliverer driver = clientService.getResponsibleDelivererByDelivererUserName(p.getResponsible_driver_name());
            if (driver == null) {
                query.put("No Driver Yet", new HashMap<String, String>() {{
                    put("coordinate", "");
                    put("route", "");
                    put("speed", "0");
                    put("distance", "0");
                }});
                return query;
            }

            List<String> driverPath = gson.fromJson(infrastructureServiceMapper.selectPathGivenUniqueUserName(driver.getUsername()), listType);
            String delivererCurrentCoordinate = driver.getCurrent_coordinate();
            driverPath.add(0, delivererCurrentCoordinate);
            String deliveryLocation = p.getPackage_destination_coordinate();

            int counter = 0;
            double distance = 0;
            if (driverPath.size() == 1) {
                distance = -CommonUtils.obtainDistanceGivenTwoCoordinates(driverPath.get(0), deliveryLocation);
            } else {
                System.out.println(driverPath.size());
                for (int i = 0; i < driverPath.size() - 1; i++) {
                    distance += CommonUtils.obtainDistanceGivenTwoCoordinates(driverPath.get(i), driverPath.get(i + 1));
                }
            }

            double finalDistance = distance;

            query.put(driver.getUsername(), new HashMap<String, String>() {{
                put("coordinate", driver.getCurrent_coordinate());
                put("route", driverPath.toString());
                put("speed", driver.getSpeed().toString());
                put("distance", String.valueOf(finalDistance));
            }});
        }

        for (W2PPackage p : clientService.getAllW2PPackageByRecipientUserName(userName)) {
            if (p.getResponsible_driver_name() == null) {
                continue;
            }
            Deliverer driver = clientService.getResponsibleDelivererByDelivererUserName(p.getResponsible_driver_name());

            List<String> driverPath = gson.fromJson(infrastructureServiceMapper.selectPathGivenUniqueUserName(driver.getUsername()), listType);
            String delivererCurrentCoordinate = driver.getCurrent_coordinate();
            driverPath.add(0, delivererCurrentCoordinate);
            String deliveryLocation = p.getPackage_destination_coordinate();

            int counter = 0;
            double distance = 0;
            if (driverPath.size() == 1) {
                distance = -CommonUtils.obtainDistanceGivenTwoCoordinates(driverPath.get(0), deliveryLocation);
            } else {
                System.out.println(driverPath.size());
                for (int i = 0; i < driverPath.size() - 1; i++) {
                    distance += CommonUtils.obtainDistanceGivenTwoCoordinates(driverPath.get(i), driverPath.get(i + 1));
                }
            }

            double finalDistance = distance;
            query.put(driver.getUsername(), new HashMap<String, String>() {{
                put("coordinate", driver.getCurrent_coordinate());
                put("route", driverPath.toString());
                put("speed", driver.getSpeed().toString());
                put("distance", String.valueOf(finalDistance));
            }});
        }

        return query;
    }
}
