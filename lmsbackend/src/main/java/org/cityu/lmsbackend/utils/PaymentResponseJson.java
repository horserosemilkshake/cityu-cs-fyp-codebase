package org.cityu.lmsbackend.utils;

import lombok.Data;

@Data
public class PaymentResponseJson {
    private String message;
    private double sender_account_balance;
    private double recipient_account_balance;
    private String reference_hash;
}
