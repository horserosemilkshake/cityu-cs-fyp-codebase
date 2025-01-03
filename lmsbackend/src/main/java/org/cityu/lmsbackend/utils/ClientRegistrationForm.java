package org.cityu.lmsbackend.utils;

import lombok.Data;

@Data
public class ClientRegistrationForm {
    public String username;
    public String password;
    public String nickname;
    public String phone;
    public String cryptowallet_address;
    public String cryptowallet_key;
}
