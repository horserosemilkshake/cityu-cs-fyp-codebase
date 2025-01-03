package org.cityu.lmsbackend.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.sql.Timestamp;

@JsonSerialize
@JsonDeserialize
@AllArgsConstructor
@Getter
@Setter
public class W2PPackage implements Serializable {
	private String id;
    private String package_id;
    private String package_description;
    private Double package_weight_in_kg;
    private Double package_height;
    private Double package_length;
    private Double package_width;
    private String package_recipient_name;
    private String package_pickup_location;
    private String package_pickup_coordinate;
    private String package_destination;
    private String package_destination_coordinate;
    private Boolean finished;
    private String responsible_driver_name;
	private String deadline;
    private Timestamp time;
    private Boolean picked_up;
    private String image;
}
