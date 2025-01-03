//package org.cityu.lmsbackend.utils;
//
//import org.cityu.lmsbackend.mapper.InfrastructureServiceMapper;
//import org.cityu.lmsbackend.model.Deliverer;
//import org.cityu.lmsbackend.model.P2PPackage;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Component;
//
//import java.lang.annotation.Documented;
//import java.util.*;
//
//@Component
//public class P2PRoutePlanningUtils {
//    @Autowired
//    private InfrastructureServiceMapper infrastructureServiceMapper;
//
//    private static final Logger logger = LoggerFactory.getLogger(P2PRoutePlanningUtils.class);
//
//    @Deprecated
//    private Boolean pointInsideCircle(String center, Double radius, String point) {
//        return CommonUtils.estimateDistanceGivenTwoCoordinates(center, point) <= radius;
//    }
//
////    public List<P2PPackage> findNPackagesWithNearestPickupAndDeliveryPoint(Deliverer driver, Integer numberOfPackages) {
////        if (numberOfPackages <= 0) {
////            return new ArrayList<>();
////        }
////
////        List<P2PPackage> undeliveredPackage = infrastructureServiceMapper.selectAllP2PPackageWithNoDeliverer();
////        logger.debug(undeliveredPackage.toString());
////        undeliveredPackage.sort(Comparator.comparingDouble(o -> Math.max(
////                CommonUtils.estimateDistanceGivenTwoCoordinates(driver.getCurrent_coordinate(), o.getPackage_pickup_coordinate()),
////                CommonUtils.estimateDistanceGivenTwoCoordinates(driver.getCurrent_coordinate(), o.getPackage_destination_coordinate())
////        )));
////        logger.debug(undeliveredPackage.toString());
////        undeliveredPackage = CommonUtils.wrapAllPackagesToDesignatedSizes(undeliveredPackage);
////        logger.debug(undeliveredPackage.toString());
////
////        List<P2PPackage> arrangement = new ArrayList<>();
////
////        Stack<P2PPackage> stack = new Stack<>();
////        Stack<Stack<P2PPackage>> stacks = new Stack<>();
////
////        for (int d = 0; d < undeliveredPackage.size(); d++) {
////            int i = 0, j = 0, l = undeliveredPackage.size();
////            stack = new Stack<>();
////            stack.push(undeliveredPackage.get(i));
////
////
////        }
////
////        return null;
////    }
//}
