package org.cityu.lmsbackend.utils;

import lombok.Data;

@Data
public class TransferRequest {
    String sender_wallet_address;
    String sender_private_key;
    String recipient_wallet_address;
    Double amount;
}