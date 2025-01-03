package org.cityu.lmsbackend.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;
import org.apache.ibatis.annotations.Many;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;

import java.io.Serializable;
import java.util.List;

@Data
@JsonSerialize
@JsonDeserialize
public class Deliverer implements Serializable {
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
	public Double getVehicle_capacity_in_kg() {
		return vehicle_capacity_in_kg;
	}
	public void setVehicle_capacity_in_kg(Double vehicle_capacity_in_kg) {
		this.vehicle_capacity_in_kg = vehicle_capacity_in_kg;
	}
	public Double getContainer_height() {
		return container_height;
	}
	public void setContainer_height(Double container_height) {
		this.container_height = container_height;
	}
	public Double getContainer_length() {
		return container_length;
	}
	public void setContainer_length(Double container_length) {
		this.container_length = container_length;
	}
	public Double getContainer_width() {
		return container_width;
	}
	public void setContainer_width(Double container_width) {
		this.container_width = container_width;
	}
	public String getCurrent_coordinate() {
		return current_coordinate;
	}
	public void setCurrent_coordinate(String current_coordinate) {
		this.current_coordinate = current_coordinate;
	}
	public String getLast_coordinate() {
		return last_coordinate;
	}
	public void setLast_coordinate(String last_coordinate) {
		this.last_coordinate = last_coordinate;
	}
	public Double getSpeed() {
		return speed;
	}
	public void setSpeed(Double speed) {
		this.speed = speed;
	}
	public Boolean getReady() {
		return ready;
	}
	public void setReady(Boolean ready) {
		this.ready = ready;
	}
	private Integer id;
    private String username;
    private String password;
    private String nickname;
    private String eight_digit_hk_phone_number;
    private Double vehicle_capacity_in_kg;
    private Double container_height;
    private Double container_length;
    private Double container_width;
    private String current_coordinate;
    private String last_coordinate;
    private Double speed;
    private Boolean ready;
    private String cryptowallet_address;
	public String getCryptowallet_address() {
		return cryptowallet_address;
	}
	public void setCryptowallet_address(String cryptowallet_address) {
		this.cryptowallet_address = cryptowallet_address;
	}
}
