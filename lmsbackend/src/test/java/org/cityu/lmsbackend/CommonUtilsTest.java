package org.cityu.lmsbackend;

import org.cityu.lmsbackend.utils.CommonUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class CommonUtilsTest {
    @Test
    @DisplayName("Should Access Distance Calculation Module")
    void testDistance() {
        Double expectedDistance = 1886.8;
        assertEquals(expectedDistance, CommonUtils.obtainDistanceGivenTwoCoordinates("52.517037,13.388860", "52.529407,13.397634"));
    }

    @Test
    @DisplayName("Should Access Distance Calculation Module - Exception - Invoke Estimation Module")
    void testDistanceException() {
        Double expectedDistance = 5.0;
        assertEquals(expectedDistance, CommonUtils.obtainDistanceGivenTwoCoordinates("0,0", "3,4"));
    }


    @Test
    @DisplayName("Should Access Distance Estimation Module")
    void testEstimateDistance() {
        Double expectedDistance = 5.0;
        assertEquals(expectedDistance, CommonUtils.estimateDistanceGivenTwoCoordinates("0,0", "3,4"));
    }
}
