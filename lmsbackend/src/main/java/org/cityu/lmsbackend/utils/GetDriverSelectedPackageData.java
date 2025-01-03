package org.cityu.lmsbackend.utils;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetDriverSelectedPackageData {
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    String username;

    public List<String> getPackageIds() {
        return packageIds;
    }

    public void setPackageIds(List<String> packageIds) {
        this.packageIds = packageIds;
    }

    List<String> packageIds;

    public int getWarehousePresent() {
        return warehousePresent;
    }

    public void setWarehousePresent(int warehousePresent) {
        this.warehousePresent = warehousePresent;
    }

    int warehousePresent;
}
