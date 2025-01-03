package org.cityu.lmsbackend.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;
import org.cityu.lmsbackend.model.Deliverer;

@Mapper
public interface DriverAlteringMapper {
    @Update("UPDATE driver SET current_coordinate=#{current_coordinate}, last_coordinate=#{last_coordinate}, speed=#{speed} WHERE username=#{username}")
    public void updateDriverPositionAndVelocity(Deliverer deliverer);

    @Update("UPDATE driver SET ready=1, speed=0 WHERE username=#{username}")
    public void updateOnline(String username);

    @Update("UPDATE driver SET ready=0, speed=0 WHERE username=#{username}")
    public void updateOffline(String username);
}
