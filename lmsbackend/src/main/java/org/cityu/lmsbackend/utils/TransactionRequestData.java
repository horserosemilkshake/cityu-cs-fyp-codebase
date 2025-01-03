package org.cityu.lmsbackend.utils;

import lombok.Data;

@Data
public class TransactionRequestData {
    private String packageID;
    private String payerName;
    private String receiverName;
    private String payerRole;
    private String receiverRole;
    private Double amount;
}
