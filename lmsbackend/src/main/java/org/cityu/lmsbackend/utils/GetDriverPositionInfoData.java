package org.cityu.lmsbackend.utils;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetDriverPositionInfoData {
    private String username;

    public String getCurrentCoordinate() {
        return currentCoordinate;
    }

    public void setCurrentCoordinate(String currentCoordinate) {
        this.currentCoordinate = currentCoordinate;
    }

    private String currentCoordinate;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getLastCoordinate() {
        return lastCoordinate;
    }

    public void setLastCoordinate(String lastCoordinate) {
        this.lastCoordinate = lastCoordinate;
    }

    private String lastCoordinate;

    public Double getUpdateTimeInterval() {
        return updateTimeInterval;
    }

    public void setUpdateTimeInterval(Double updateTimeInterval) {
        this.updateTimeInterval = updateTimeInterval;
    }

    private Double updateTimeInterval;
}
