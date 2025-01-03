package org.cityu.lmsbackend.utils;

import lombok.*;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageFormData {
    private String packageId;
    private String packageDescription;
    private double packageWeight;
    private double packageHeight;
    private double packageLength;
    private double packageWidth;
    private String senderName;
    private String recipientName;
    private String pickupLocation;
    private String pickupCoordinate;
    private String destination;
    private String destinationCoordinate;
    private String deadline;
    private Timestamp time;
    private int warehousePresent;
    private String image;
}
