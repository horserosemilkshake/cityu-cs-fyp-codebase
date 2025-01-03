package org.cityu.lmsbackend.mapper;

import org.apache.ibatis.annotations.*;
import org.cityu.lmsbackend.model.Client;
import org.cityu.lmsbackend.model.Deliverer;
import org.cityu.lmsbackend.model.P2PPackage;
import org.cityu.lmsbackend.model.W2PPackage;

import java.util.List;

@Mapper
public interface InfrastructureServiceMapper {
    // Account Management
    @Select("SELECT password FROM fypdb.driver WHERE username=#{username}")
    String selectDriverPasswordGivenUniqueUserName(String username);

    @Select("DELETE FROM fypdb.driver WHERE username=#{username}")
    void deleteDriverGivenUniqueUserName(String username);

    @Select("DELETE FROM fypdb.client WHERE username=#{username}")
    void deleteClientGivenUniqueUserName(String username);

    @Select("SELECT password FROM fypdb.client WHERE username=#{username}")
    String selectClientPasswordGivenUniqueUserName(String username);

    @Select("SELECT password FROM fypdb.admin WHERE username=#{username}")
    String selectAdminPasswordGivenUniqueUserName(String username);

    @Select("SELECT * FROM fypdb.driver")
    List<Deliverer> selectAllFromDriver();

    @Select("SELECT * FROM fypdb.client")
    List<Client> selectAllFromClient();

    @Select("SELECT * FROM fypdb.driver WHERE username=#{username}")
    Deliverer selectDriverByName(String username);

    @Select("SELECT * FROM fypdb.client WHERE username=#{username}")
    Client selectClientByName(String username);

    @Select("SELECT * FROM fypdb.admin LIMIT 1")
    Client selectAdmin();

    // Package Management
    @Select("SELECT * FROM fypdb.p2p_package")
    List<P2PPackage> selectAllP2PPackages();

    @Select("SELECT * FROM fypdb.w2p_package")
    List<W2PPackage> selectAllW2PPackages();

    @Select("SELECT * FROM fypdb.p2p_package WHERE package_id=#{packageId}")
    P2PPackage selectP2PPackageGivenUniquePackageId(String packageId);

    @Select("SELECT * FROM fypdb.w2p_package WHERE package_id=#{packageId}")
    W2PPackage selectW2PPackageGivenUniquePackageId(String packageId);

    @Select("SELECT * FROM fypdb.p2p_package WHERE responsible_driver_name=#{username}")
    List<P2PPackage> selectAllP2PPackageGivenUniqueDriverUserName(String username);

    @Select("SELECT * FROM fypdb.p2p_package WHERE package_recipient_name=#{username}")
    List<P2PPackage> selectAllP2PPackageGivenUniqueRecipientUserName(String username);

    @Select("SELECT * FROM fypdb.p2p_package WHERE package_sender_name=#{username}")
    List<P2PPackage> selectAllP2PPackageGivenUniqueSenderUserName(String username);

    @Select("SELECT * FROM fypdb.w2p_package WHERE package_sender_name=#{username}")
    List<W2PPackage> selectAllW2PPackageGivenUniqueSenderUserName(String username);

    @Select("SELECT * FROM fypdb.w2p_package WHERE responsible_driver_name=#{username}")
    List<W2PPackage> selectAllW2PPackageGivenUniqueDriverUserName(String username);

    @Select("SELECT * FROM fypdb.w2p_package WHERE package_recipient_name=#{username}")
    List<W2PPackage> selectAllW2PPackageGivenUniqueRecipientUserName(String username);

    @Select("SELECT * FROM fypdb.p2p_package WHERE responsible_driver_name IS NULL")
    List<P2PPackage> selectAllP2PPackageWithNoDeliverer();

    @Select("SELECT * FROM fypdb.w2p_package WHERE responsible_driver_name IS NULL")
    List<W2PPackage> selectAllW2PPackageWithNoDeliverer();

    @Select("SELECT * FROM fypdb.p2p_package WHERE responsible_driver_name IS NOT NULL AND finished=FALSE")
    List<P2PPackage> selectAllP2PPackageThatHasDelivererButNotFinished();

    @Select("SELECT * FROM fypdb.w2p_package WHERE responsible_driver_name IS NOT NULL AND finished=FALSE")
    List<W2PPackage> selectAllW2PPackageThatHasDelivererButNotFinished();

    @Delete("DELETE FROM fypdb.points WHERE username=#{username}")
    void removePathGivenUniqueUserName(String username);

    @Select("SELECT coordinate FROM fypdb.points WHERE username=#{username}")
    String selectPathGivenUniqueUserName(String username);

    @Select("INSERT INTO fypdb.points (username, coordinate, position) VALUES (#{username}, #{coordinate}, #{index})")
    void insertCoordinateInARouteGivenUniqueUserName(String username, String coordinate, int index);

    @Insert("INSERT INTO fypdb.driver (username, password, nickname, eight_digit_hk_phone_number, vehicle_capacity_in_kg, container_height, container_length, container_width, current_coordinate, last_coordinate, speed, ready, cryptowallet_address) VALUES (#{u}, #{p}, #{n}, #{e}, #{k}, #{h}, #{l}, #{w},#{cc}, #{lc}, #{s}, #{r}, #{ca})")
    void insertDriver(String u, String p, String n, String e, Double k, Double h, Double l, Double w, String cc, String lc, Double s, Boolean r, String ca);

    @Update("UPDATE fypdb.client\n" +
            "   SET password = #{p},\n" +
            "       nickname = #{n},\n" +
            "       eight_digit_hk_phone_number = #{e},\n" +
            "       cryptowallet_address = #{ca},\n" +
            "       cryptowallet_private_key = #{cpk}\n" +
            " WHERE username = #{u};")
    void changeClientProfile(String u, String p, String n, String e, String ca, String cpk);

    @Insert("INSERT INTO fypdb.client (username, password, nickname, eight_digit_hk_phone_number, cryptowallet_address, cryptowallet_private_key) VALUES (#{u}, #{p}, #{n}, #{e}, #{ca}, #{cpk})")
    void insertClient(String u, String p, String n, String e, String ca, String cpk);

    @Select("DELETE FROM fypdb.points WHERE username = #{username} AND coordinate = #{coordinate}")
    void deleteCoordinateInARouteGivenUniqueUserName(String username, String coordinate);

    @Insert("INSERT INTO fypdb.references (package_id, client_side_reference_hash, driver_side_reference_hash) VALUES (#{packageID}, #{referenceHash}, null);")
    void addClientReferenceHashWithPackageID(String packageID, String referenceHash);

    @Insert("INSERT INTO fypdb.references (package_id, client_side_reference_hash, driver_side_reference_hash) VALUES (#{packageID}, null, #{referenceHash});")
    void addDriverReferenceHashWithPackageID(String packageID, String referenceHash);

    @Select("SELECT client_side_reference_hash FROM fypdb.references WHERE package_id=#{packageID} AND driver_side_reference_hash IS NULL")
    String selectClientReferenceHashWithPackageID(String packageID);

    @Select("SELECT driver_side_reference_hash FROM fypdb.references WHERE package_id=#{packageID} AND client_side_reference_hash IS NULL")
    String selectDriverReferenceHashWithPackageID(String packageID);

    @Update("UPDATE fypdb.driver\n" +
            "   SET password = #{password},\n" +
            "       nickname = #{nickname},\n" +
            "       eight_digit_hk_phone_number = #{eightDigitHkPhoneNumber},\n" +
            "       vehicle_capacity_in_kg = #{capacity},\n" +
            "       container_height = #{height},\n" +
            "       container_length = #{length},\n" +
            "       container_width = #{width},\n" +
            "       cryptowallet_address = #{ca}\n" +
            " WHERE username = #{username};")
    void changeDriverProfile(String username, String password, String nickname, String eightDigitHkPhoneNumber, Double capacity, Double height, Double length, Double width, String ca);

    @Select("SELECT cryptowallet_address FROM fypdb.driver WHERE username=#{username}")
    String selectDriverAddressGivenUniqueUserName(String username);

    @Select("SELECT cryptowallet_address FROM fypdb.client WHERE username=#{username}")
    String selectClientAddressGivenUniqueUserName(String username);
    @Select("SELECT cryptowallet_address FROM fypdb.admin WHERE username=#{username}")
    String selectAdminAddressGivenUniqueUserName(String username);
}
