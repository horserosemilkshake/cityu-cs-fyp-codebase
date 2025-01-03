package org.cityu.lmsbackend.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.cityu.lmsbackend.mapper.InfrastructureServiceMapper;
import org.cityu.lmsbackend.model.Client;
import org.cityu.lmsbackend.model.Deliverer;
import org.cityu.lmsbackend.model.P2PPackage;
import org.cityu.lmsbackend.model.W2PPackage;
import org.cityu.lmsbackend.service.AdminService;
import org.cityu.lmsbackend.utils.DeleteRequestData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@SaCheckRole("ADMIN")
@RestController
@CrossOrigin
@RequestMapping("/api/v1/admin/")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private InfrastructureServiceMapper infrastructureServiceMapper;

    @PostMapping("admin-info")
    public synchronized String getAdmin() throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        Client c = infrastructureServiceMapper.selectAdmin();
//        c.setPassword("");
//        c.setCryptowallet_private_key("");
        return objectMapper.writeValueAsString(c);
    }

    @PostMapping("get-all-driver")
    public List<Deliverer> getAllDriver() {
        return adminService.getAllDriver();
    }

    @PostMapping("get-all-client")
    public List<Client> getAllClient() {
        return adminService.getAllClient();
    }

    @PostMapping("get-all-p2p")
    public List<P2PPackage> getAllP2P() {
        System.out.println("getAllP2P invoked");
        return infrastructureServiceMapper.selectAllP2PPackages();
    }

    @PostMapping("get-all-w2p")
    public List<W2PPackage> getAllW2P() {
        System.out.println("getAllW2P invoked");
        return infrastructureServiceMapper.selectAllW2PPackages();
    }

    @PostMapping("delete-account")
    public HttpStatus deleteAccount(@RequestBody DeleteRequestData deleteRequestData) {
        try {
            if (infrastructureServiceMapper.selectDriverByName(deleteRequestData.getUsername()) == null && infrastructureServiceMapper.selectClientByName(deleteRequestData.getUsername()) == null) {
                throw new IllegalStateException("User not exist.");
            }
            if (deleteRequestData.getRole().equalsIgnoreCase("DRIVER") || deleteRequestData.getRole().equalsIgnoreCase("DELIVERER")) {
                infrastructureServiceMapper.deleteDriverGivenUniqueUserName(deleteRequestData.getUsername());
            } else if (deleteRequestData.getRole().equalsIgnoreCase("CLIENT") || deleteRequestData.getRole().equalsIgnoreCase("RECIPIENT")) {
                infrastructureServiceMapper.deleteClientGivenUniqueUserName(deleteRequestData.getUsername());
            } else {
                throw new IllegalStateException("Role not exist");
            }
            return HttpStatus.OK;
        } catch (Exception e) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }

}
