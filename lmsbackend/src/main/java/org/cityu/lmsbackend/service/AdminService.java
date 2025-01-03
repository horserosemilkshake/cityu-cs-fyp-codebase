package org.cityu.lmsbackend.service;

import org.cityu.lmsbackend.mapper.InfrastructureServiceMapper;
import org.cityu.lmsbackend.model.Client;
import org.cityu.lmsbackend.model.Deliverer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {
    private InfrastructureServiceMapper infrastructureServiceMapper;

    @Autowired
    public void setInfrastructureServiceMapper(InfrastructureServiceMapper infrastructureServiceMapper) {
        this.infrastructureServiceMapper = infrastructureServiceMapper;
    }

    public List<Deliverer> getAllDriver() {
        return infrastructureServiceMapper.selectAllFromDriver();
    }

    public List<Client> getAllClient() {
        return infrastructureServiceMapper.selectAllFromClient();
    }
}
