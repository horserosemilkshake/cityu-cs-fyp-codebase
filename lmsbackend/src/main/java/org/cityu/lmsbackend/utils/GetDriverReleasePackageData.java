package org.cityu.lmsbackend.utils;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetDriverReleasePackageData {
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    String username;

    public String getPackageId() {
        return packageId;
    }

    public void setPackageId(String packageId) {
        this.packageId = packageId;
    }

    String packageId;

    public int getWarehousePresent() {
        return warehousePresent;
    }

    public void setWarehousePresent(int warehousePresent) {
        this.warehousePresent = warehousePresent;
    }

    int warehousePresent;
}
