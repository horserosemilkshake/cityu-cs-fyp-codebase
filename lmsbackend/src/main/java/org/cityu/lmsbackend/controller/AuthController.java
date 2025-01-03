package org.cityu.lmsbackend.controller;

import cn.dev33.satoken.session.SaSession;
import cn.dev33.satoken.session.TokenSign;
import com.google.gson.Gson;
import org.cityu.lmsbackend.mapper.InfrastructureServiceMapper;
import org.cityu.lmsbackend.service.LoginService;
import org.cityu.lmsbackend.utils.LoginRequestData;
import org.cityu.lmsbackend.utils.TransactionRequestData;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/v1/auth/")
public class AuthController {
    @Autowired
    private LoginService loginService;

    @Autowired

    InfrastructureServiceMapper infrastructureServiceMapper;

    @PostMapping("address")
    public String parseAddress(@RequestBody LoginRequestData requestData){
        System.out.println("Find crypto wallet address triggered.");
        String username = requestData.getUsername();
        String role = requestData.getRole();
        String address = null;

        if ("DRIVER".equals(role)){
            address = infrastructureServiceMapper.selectDriverAddressGivenUniqueUserName(username);
        } else if ("RECIPIENT".equals(role)) {
            address = infrastructureServiceMapper.selectClientAddressGivenUniqueUserName(username);
        } else if ("ADMIN".equals(role)) {
            address = infrastructureServiceMapper.selectAdminAddressGivenUniqueUserName(username);
        }

        System.out.println("Address: " + address);

        return new Gson().toJson((address));
    }

    @PostMapping("login")
    public SaResult parseLogin(@RequestBody LoginRequestData requestData){
        System.out.println("Auth triggered.");
    	String username = requestData.getUsername();
        String password = requestData.getPassword();
        String role = requestData.getRole();
        username = username.trim().replaceAll("[^a-zA-Z0-9]", "");
        password = password.trim().replaceAll("[^a-zA-Z0-9]", "");
        role = role.trim().replaceAll("[^a-zA-Z0-9]", "");
        return loginService.performLogin(username, password, role);
    }

    @PostMapping("transfer")
    public String transfer(@RequestBody TransactionRequestData transactionRequestData) {
        String packageID = transactionRequestData.getPackageID();
        String payerName = transactionRequestData.getPayerName();
        String receiverName = transactionRequestData.getReceiverName();
        String payerRole = transactionRequestData.getPayerRole();
        String receiverRole = transactionRequestData.getReceiverRole();
        Double amount = transactionRequestData.getAmount();
        String status = loginService.performTransaction(packageID, payerName, receiverName, payerRole, receiverRole, amount);
        System.out.println(status);
        return status;
    }

    @GetMapping("logged-in")
    public SaResult isLogin() {
        return loginService.isLogin();
    }

    @GetMapping("token-info")
    public SaResult tokenInfo() {
        return loginService.tokenInfo();
    }

    @GetMapping("session-info")
    public SaSession sessionInfo() {
        return loginService.getSessionInfo();
    }


    @GetMapping("get-all-sessions")
    public List<String> getAllSessions() {
        List<String> sessionIdList = StpUtil.searchSessionId("", 0, -1, false);

        for (String sessionId : sessionIdList) {
            SaSession session = StpUtil.getSessionBySessionId(sessionId);
            List<TokenSign> tokenSignList = session.getTokenSignList();
            System.out.println("Session id: " + sessionId + ", is currently on " + tokenSignList.size() + " devices");
        }
        return sessionIdList;
    }

    @GetMapping("get-roles")
    public List<String> getRoles() {
        return loginService.getRoles();
    }

    @GetMapping("get-permissions")
    public List<String> getPermissions() {
        return loginService.getPermissions();
    }

    @DeleteMapping("logout")
    public SaResult logout() {
        return loginService.logout();
    }
}
