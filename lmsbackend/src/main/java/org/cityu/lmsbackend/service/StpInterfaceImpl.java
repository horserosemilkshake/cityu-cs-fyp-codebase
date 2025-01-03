package org.cityu.lmsbackend.service;

import cn.dev33.satoken.stp.StpInterface;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class StpInterfaceImpl implements StpInterface {
    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        List<String> role = new ArrayList<String>();
        if (loginId != null) {
            role.addAll(Arrays.asList(StpUtil.getTokenInfo().loginId.toString().split(":")));
        }
        return role;
    }

    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        List<String> permission = new ArrayList<>();
        return permission;
    }
}