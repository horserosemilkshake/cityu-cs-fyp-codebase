package org.cityu.lmsbackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.cityu.lmsbackend.mapper.InfrastructureServiceMapper;
import org.cityu.lmsbackend.model.Client;
import org.cityu.lmsbackend.model.Deliverer;
import org.cityu.lmsbackend.model.P2PPackage;
import org.cityu.lmsbackend.model.W2PPackage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {
    private InfrastructureServiceMapper infrastructureServiceMapper;

    @Autowired
    public void setInfrastructureServiceMapper(InfrastructureServiceMapper infrastructureServiceMapper) {
        this.infrastructureServiceMapper = infrastructureServiceMapper;
    }

    public List<W2PPackage> getAllW2PPackageBySenderUserName(String username) {
        return infrastructureServiceMapper.selectAllW2PPackageGivenUniqueSenderUserName(username);
    }

    public List<P2PPackage> getAllP2PPackageBySenderUserName(String username) {
        return infrastructureServiceMapper.selectAllP2PPackageGivenUniqueSenderUserName(username);
    }

    public List<W2PPackage> getAllW2PPackageByRecipientUserName(String username) {
        return infrastructureServiceMapper.selectAllW2PPackageGivenUniqueRecipientUserName(username);
    }

    public List<P2PPackage> getAllP2PPackageByRecipientUserName(String username) {
        return infrastructureServiceMapper.selectAllP2PPackageGivenUniqueRecipientUserName(username);
    }

    public Deliverer getResponsibleDelivererByDelivererUserName(String username) {
        return infrastructureServiceMapper.selectDriverByName(username);
    }

    public String getClientByUserName(String username) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        Client c = infrastructureServiceMapper.selectClientByName(username);
//        c.setPassword("");
//        c.setCryptowallet_private_key("");
        return objectMapper.writeValueAsString(c);
    }

    public String getClientTransactionHashWithPackageID(String packageID) {
        System.out.println("getClientTransactionHashWithPackageID invoked with " + packageID);
        String id = "";
        try {
            id = infrastructureServiceMapper.selectClientReferenceHashWithPackageID(packageID);
        } catch (Exception e) {
            id = "Error";
        }
        System.out.println("TRD: " + id);
        return id;
    }
}
