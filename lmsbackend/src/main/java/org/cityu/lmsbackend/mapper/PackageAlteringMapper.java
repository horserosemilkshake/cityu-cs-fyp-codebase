package org.cityu.lmsbackend.mapper;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;
import org.cityu.lmsbackend.model.P2PPackage;
import org.cityu.lmsbackend.model.W2PPackage;

@Mapper
public interface PackageAlteringMapper {
    @Insert("INSERT INTO p2p_package \n" +
            "(" +
            "`package_id`,\n" +
            "`package_description`,\n" +
            "`package_weight_in_kg`,\n" +
            "`package_height`,\n" +
            "`package_length`,\n" +
            "`package_width`,\n" +
            "`package_sender_name`,\n" +
            "`package_recipient_name`,\n" +
            "`package_pickup_location`,\n" +
            "`package_pickup_coordinate`,\n" +
            "`package_destination`,\n" +
            "`package_destination_coordinate`,\n" +
            "`finished`,\n" +
            "`responsible_driver_name`,\n" +
            "`deadline`,\n" +
            "`time`,\n" +
            "`picked_up`," +
            "`image`)\n" +
            "VALUES\n" +
            "(" +
            "#{package_id},\n" +

            "#{package_description},\n" +
            "#{package_weight_in_kg},\n" +
            "#{package_height},\n" +
            "#{package_length},\n" +
            "#{package_width},\n" +
            "#{package_sender_name},\n" +
            "#{package_recipient_name},\n" +
            "#{package_pickup_location},\n" +
            "#{package_pickup_coordinate},\n" +
            "#{package_destination},\n" +
            "#{package_destination_coordinate},\n" +
            "#{finished},\n" +
            "#{responsible_driver_name},\n" +
            "#{deadline}," +
            "#{time}," +
            "0," +
            "#{image});\n")
    public void insertP2PPackage(P2PPackage pPackage);

    @Insert("INSERT INTO w2p_package \n" +
            "(" +
            "`package_id`,\n" +
            "`package_description`,\n" +
            "`package_weight_in_kg`,\n" +
            "`package_height`,\n" +
            "`package_length`,\n" +
            "`package_width`,\n" +
            "`package_recipient_name`,\n" +
            "`package_pickup_location`,\n" +
            "`package_pickup_coordinate`,\n" +
            "`package_destination`,\n" +
            "`package_destination_coordinate`,\n" +
            "`finished`,\n" +
            "`responsible_driver_name`,\n" +
            "`deadline`,\n" +
            "`time`," +
            "`picked_up`," +
            "`image`)\n" +
            "VALUES\n" +
            "(" +
            "#{package_id},\n" +
            "#{package_description},\n" +
            "#{package_weight_in_kg},\n" +
            "#{package_height},\n" +
            "#{package_length},\n" +
            "#{package_width},\n" +
            "#{package_recipient_name},\n" +
            "#{package_pickup_location},\n" +
            "#{package_pickup_coordinate},\n" +
            "#{package_destination},\n" +
            "#{package_destination_coordinate},\n" +
            "#{finished},\n" +
            "#{responsible_driver_name},\n" +
            "#{deadline}," +
            "#{time}," +
            "0," +
            "#{image});\n")
    public void insertW2PPackage(W2PPackage pPackage);
    
    @Update("UPDATE p2p_package SET `responsible_driver_name` = #{delivererName} WHERE (`package_id` = #{packageId});")
    public void updateP2PPackageResponsibleDeliverer(String packageId, String delivererName);
    
    @Update("UPDATE w2p_package SET `responsible_driver_name` = #{delivererName} WHERE (`package_id` = #{packageId});")
    public void updateW2PPackageResponsibleDeliverer(String packageId, String delivererName);
    
    @Update("UPDATE p2p_package SET `finished` = '1' WHERE (`package_id` = #{packageId});")
    public void updateP2PPackageCompleteSuccessfullyy(String packageId, String delivererName);
    
    @Update("UPDATE w2p_package SET `finished` = '1' WHERE (`package_id` = #{packageId});")
    public void updateW2PPackageCompleteSuccessfullyy(String packageId, String delivererName);

    @Update("UPDATE p2p_package SET `picked_up` = '1' WHERE (`package_id` = #{packageId});")
    void updateP2PPackagePickedUpSuccessfully(String packageId, String username);

    @Update("UPDATE w2p_package SET `finished` = '1' WHERE (`package_id` = #{packageId});")
    void updateW2PPackagePickedUpSuccessfully(String packageId, String username);
}
