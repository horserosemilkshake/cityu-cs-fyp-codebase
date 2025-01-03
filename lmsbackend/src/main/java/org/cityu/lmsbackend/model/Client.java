package org.cityu.lmsbackend.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;

import java.io.Serializable;

@Data
@JsonSerialize
@JsonDeserialize
public class Client implements Serializable {
    private Integer id;
    public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getNickname() {
		return nickname;
	}
	public void setNickname(String nickname) {
		this.nickname = nickname;
	}
	public String getEight_digit_hk_phone_number() {
		return eight_digit_hk_phone_number;
	}
	public void setEight_digit_hk_phone_number(String eight_digit_hk_phone_number) {
		this.eight_digit_hk_phone_number = eight_digit_hk_phone_number;
	}
	public String getCryptowallet_address() {
		return cryptowallet_address;
	}
	public void setCryptowallet_address(String cryptowallet_address) {
		this.cryptowallet_address = cryptowallet_address;
	}
	public String getCryptowallet_private_key() {
		return cryptowallet_private_key;
	}
	public void setCryptowallet_private_key(String cryptowallet_private_key) {
		this.cryptowallet_private_key = cryptowallet_private_key;
	}
	private String username;
    private String password;
    private String nickname;
    private String eight_digit_hk_phone_number;
    private String cryptowallet_address;
    private String cryptowallet_private_key;
}
