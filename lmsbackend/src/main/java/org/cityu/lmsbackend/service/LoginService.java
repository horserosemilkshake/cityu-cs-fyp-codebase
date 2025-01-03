package org.cityu.lmsbackend.service;

import cn.dev33.satoken.session.SaSession;
import lombok.Data;
import org.cityu.lmsbackend.utils.CommonUtils;
import org.cityu.lmsbackend.utils.PaymentResponseJson;
import org.cityu.lmsbackend.utils.TransferRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.cityu.lmsbackend.mapper.DriverAlteringMapper;
import org.cityu.lmsbackend.mapper.InfrastructureServiceMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.ConnectException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Objects;

@Service
public class LoginService {

    private InfrastructureServiceMapper infrastructureServiceMapper;

    @Autowired
    public void setInfrastructureServiceMapper(InfrastructureServiceMapper infrastructureServiceMapper) {
        this.infrastructureServiceMapper = infrastructureServiceMapper;
    }

    @Autowired
    private StpInterfaceImpl stpInterface;

    @Autowired
    private DriverAlteringMapper driverAlteringMapper;

    public SaResult performLogin(
            String username,
            String password,
            String roleString
    ) {
        String queryPassword = null;

        if ("DRIVER".equals(roleString)){
            queryPassword = infrastructureServiceMapper.selectDriverPasswordGivenUniqueUserName(username);
            System.out.println(queryPassword);
        } else if ("RECIPIENT".equals(roleString)) {
            queryPassword = infrastructureServiceMapper.selectClientPasswordGivenUniqueUserName(username);
        } else if ("ADMIN".equals(roleString)) {
            queryPassword = infrastructureServiceMapper.selectAdminPasswordGivenUniqueUserName(username);
        }

        if (queryPassword != null && queryPassword.equals(password)) {
            String loginID = roleString
                    .concat(":")
                    .concat(username);
            StpUtil.login(loginID);

            if ("DRIVER".equals(roleString)) {
                driverAlteringMapper.updateOnline(username);
            }

            System.out.println(StpUtil.getRoleList());
            System.out.println(StpUtil.getPermissionList());
            return SaResult.ok("Login successful.");
        }
        return SaResult.error("Login failed.");
    }

    public SaResult isLogin() {
        return SaResult.ok("Current session logged in: " + StpUtil.isLogin());
    }

    public SaResult tokenInfo() {
        return SaResult.data(StpUtil.getTokenInfo());
    }

    public List<String> getRoles() {
        return stpInterface.getRoleList(StpUtil.getTokenInfo().loginId, "");
    }

    public List<String> getPermissions() {
        return StpUtil.getPermissionList();
    }

    public SaSession getSessionInfo() {
        return StpUtil.getSession();
    }

    public SaResult logout() {
        StpUtil.logout();
        return SaResult.ok();
    }

    public String performTransaction(String packageID, String payerName, String receiverName, String payerRole, String receiverRole, Double amount) {
        TransferRequest t = new TransferRequest();
        String payerWalletAddress = "";
        String receiverWalletAddress = "";
        String payerWalletKey = "";
        try {
            // Either client / admin pays
            payerWalletAddress = (!payerRole.equalsIgnoreCase("ADMIN")) ? infrastructureServiceMapper.selectClientByName(payerName).getCryptowallet_address() : infrastructureServiceMapper.selectAdmin().getCryptowallet_address();
            // Either admin / driver receives
            receiverWalletAddress = (receiverRole.equalsIgnoreCase("DRIVER") || receiverRole.equalsIgnoreCase("DELIVERER")) ? infrastructureServiceMapper.selectDriverByName(receiverName).getCryptowallet_address() : infrastructureServiceMapper.selectAdmin().getCryptowallet_address();
            payerWalletKey = (!payerRole.equalsIgnoreCase("ADMIN")) ? infrastructureServiceMapper.selectClientByName(payerName).getCryptowallet_private_key() : infrastructureServiceMapper.selectAdmin().getCryptowallet_private_key();
            payerWalletKey = new String(Base64.getDecoder().decode(payerWalletKey), StandardCharsets.UTF_8);
        } catch (Error e) {
            return "Error in fetching payment data";
        }

        t.setSender_wallet_address(payerWalletAddress);
        t.setSender_private_key(payerWalletKey);
        t.setRecipient_wallet_address(receiverWalletAddress);
        t.setAmount(amount);
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<TransferRequest> httpEntity = new HttpEntity<>(t, headers);

        ResponseEntity<PaymentResponseJson> res = null;

        try {
            res = restTemplate.postForEntity(
                    "http://localhost:1234/transfer", httpEntity, PaymentResponseJson.class);
        } catch (RestClientException e) {
            res = restTemplate.postForEntity(
                    "http://47.238.184.88:1234/transfer", httpEntity, PaymentResponseJson.class);
        }



        if (!Objects.requireNonNull(res.getBody()).getMessage().isEmpty() && !Objects.requireNonNull(res.getBody()).getReference_hash().isEmpty()) {
            String referenceHash = Objects.requireNonNull(res.getBody()).getReference_hash();
            if (payerRole.equalsIgnoreCase("CLIENT")) {
                infrastructureServiceMapper.addClientReferenceHashWithPackageID(packageID, referenceHash);
            } else {
                infrastructureServiceMapper.addDriverReferenceHashWithPackageID(packageID, referenceHash);
            }
            return referenceHash;
        } else
            return "Error";
    }
}
