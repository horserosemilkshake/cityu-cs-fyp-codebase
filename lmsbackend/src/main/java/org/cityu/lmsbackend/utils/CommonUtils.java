package org.cityu.lmsbackend.utils;

import org.cityu.lmsbackend.model.P2PPackage;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

public abstract class CommonUtils {
    public static String key = "ThisIsA128BitKey";
    public static String iv = "ThisIsA128BitIV";
    public static Double obtainDistanceGivenTwoCoordinates(String coordinateA, String coordinateB) {
        String LatA = coordinateA.split(",")[0];
        String LonA = coordinateA.split(",")[1];
        String LatB = coordinateB.split(",")[0];
        String LonB = coordinateB.split(",")[1];

        RestTemplate restTemplate = new RestTemplate();

        JSONObject jsonObject = new JSONObject();

        try {
            ResponseEntity<String> distanceRes = restTemplate.getForEntity(
                    "http://router.project-osrm.org/route/v1/driving/" + LonA + "," + LatA + ";" + LonB + "," + LatB + "?steps=false"
                    , String.class);
            if (!distanceRes.getStatusCode().is2xxSuccessful()) {
                throw new HttpServerErrorException(distanceRes.getStatusCode());
            } else {
                jsonObject = new JSONObject(distanceRes.getBody());
            }
        } catch (Exception e) {
            //TODO: Use Homemade one
            return estimateDistanceGivenTwoCoordinates(LonA + "," + LatA, LonB + "," + LatB);
        }

        return Double.valueOf(jsonObject.getJSONArray("routes").getJSONObject(0).get("distance").toString());
    }

    public static Double estimateDistanceGivenTwoCoordinates(String coordinateA, String coordinateB) {
        Double LatA = Double.valueOf(coordinateA.split(",")[0]);
        Double LonA = Double.valueOf(coordinateA.split(",")[1]);
        Double LatB = Double.valueOf(coordinateB.split(",")[0]);
        Double LonB = Double.valueOf(coordinateB.split(",")[1]);
        return calculateDistance(LatA, LonA, LatB, LonB);
    }

    public static double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        final int EARTH_RADIUS = 6371; // Radius of the earth in kilometers

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c * 1000; // Distance in m
    }

    public static byte[] blobToByteArray(Blob blob) throws SQLException, IOException {
        try (InputStream inputStream = blob.getBinaryStream();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            return outputStream.toByteArray();
        }
    }

    public static Blob byteArrayToBlob(byte[] bytes) {
        try {
            ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            // Create a Blob from the ByteArrayInputStream
            Blob blob = Blob.class.cast(bais.transferTo(baos));

            return blob;
        } catch (IOException e) {
            throw new RuntimeException("Error converting byte[] to Blob", e);
        }
    }

//    public static String encryptAES128(String plainText, String key, String iv) {
//        try {
//            // Prepare the key and initialization vector
//            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "AES");
//            IvParameterSpec ivParameterSpec = new IvParameterSpec(iv.getBytes());
//
//            // Create the AES cipher
//            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
//            cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivParameterSpec);
//
//            // Encrypt the text
//            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes());
//            return Base64.getEncoder().encodeToString(encryptedBytes);
//        } catch (Exception e) {
//            e.printStackTrace();
//            return null;
//        }
//    }
//
//    public static String decryptAES(String ciphertext, String keyString) {
//        try {
//            // Create the AES cipher
//            Cipher cipher = Cipher.getInstance("AES");
//
//            // Convert the key string to a byte array
//            byte[] key = keyString.getBytes();
//
//            // Create the secret key
//            Key secretKey = new SecretKeySpec(key, "AES");
//
//            // Initialize the cipher for decryption (without IV)
//            cipher.init(Cipher.DECRYPT_MODE, secretKey);
//
//            // Decode the ciphertext from Base64
//            byte[] ciphertextBytes = Base64.getDecoder().decode(ciphertext);
//
//            // Decrypt the ciphertext
//            byte[] plaintext = cipher.doFinal(ciphertextBytes);
//
//            // Return the decrypted plaintext as a string
//            return new String(plaintext);
//        } catch (Exception e) {
//            e.printStackTrace();
//            return null;
//        }
//    }

//    public static List<P2PPackage> wrapAllPackagesToDesignatedSizes(List<P2PPackage> p2PPackageList) {
//        List<P2PPackage> newList = new ArrayList<>();
//        for (P2PPackage pPackage : p2PPackageList) {
//            Double realPackageSize = pPackage.getPackage_length() * pPackage.getPackage_width() * pPackage.getPackage_height();
//            assert realPackageSize > 0.0 && realPackageSize <= 636 * 536 * 372;
//            if (realPackageSize <= 192 * 142 * 84) {
//                pPackage.setPackage_length(192.0);
//                pPackage.setPackage_width(142.0);
//                pPackage.setPackage_height(84.0);
//            } else if (realPackageSize <= 242 * 192 * 164) {
//                pPackage.setPackage_length(242.0);
//                pPackage.setPackage_width(192.0);
//                pPackage.setPackage_height(164.0);
//            } else if (realPackageSize <= 286 * 236 * 172) {
//                pPackage.setPackage_length(286.0);
//                pPackage.setPackage_width(236.0);
//                pPackage.setPackage_height(172.0);
//            } else if (realPackageSize <= 346 * 156 * 232) {
//                pPackage.setPackage_length(346.0);
//                pPackage.setPackage_width(156.0);
//                pPackage.setPackage_height(232.0);
//            } else if (realPackageSize <= 346 * 286 * 222) {
//                pPackage.setPackage_length(346.0);
//                pPackage.setPackage_width(286.0);
//                pPackage.setPackage_height(222.0);
//            } else if (realPackageSize <= 386 * 316 * 192) {
//                pPackage.setPackage_length(386.0);
//                pPackage.setPackage_width(316.0);
//                pPackage.setPackage_height(192.0);
//            } else if (realPackageSize <= 536 * 386 * 372) {
//                pPackage.setPackage_length(536.0);
//                pPackage.setPackage_width(386.0);
//                pPackage.setPackage_height(372.0);
//            } else {
//                pPackage.setPackage_length(636.0);
//                pPackage.setPackage_width(536.0);
//                pPackage.setPackage_height(372.0);
//            }
//            newList.add(pPackage);
//        }
//        return newList;
//    }
}
