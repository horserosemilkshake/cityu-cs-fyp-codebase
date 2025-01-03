package org.cityu.lmsbackend.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class KMeansClustering {
    public static List<List<String>> kMeans(List<String> points, int numClusters) {
        List<List<String>> clusters = new ArrayList<>();

        // Initialize centroids
        System.out.print(points);
        if (points.isEmpty()) {
            return clusters;
        }

        List<String> centroids = new ArrayList<>();
        for (int i = 0; i < numClusters; i++) {
            centroids.add(points.get(i));
        }

        // Assign points to clusters
        Map<String, List<String>> assignment = new HashMap<>();
        for (int i = 0; i < points.size(); i++) {
            String point = points.get(i);
            String centroid = findNearestCentroid(point, centroids);
            if (!assignment.containsKey(centroid)) {
                assignment.put(centroid, new ArrayList<>());
            }
            assignment.get(centroid).add(point);
        }

        // Update centroids
        while (true) {
            List<String> newCentroids = new ArrayList<>();
            for (String centroid : assignment.keySet()) {
                List<String> clusterPoints = assignment.get(centroid);
                String newCentroid = calculateCentroid(clusterPoints);
                newCentroids.add(newCentroid);
            }

            if (newCentroids.equals(centroids)) {
                break;
            }

            centroids = newCentroids;

            // Reassign points to clusters
            assignment.clear();
            for (int i = 0; i < points.size(); i++) {
                String point = points.get(i);
                String centroid = findNearestCentroid(point, centroids);
                if (!assignment.containsKey(centroid)) {
                    assignment.put(centroid, new ArrayList<>());
                }
                assignment.get(centroid).add(point);
            }
        }

        // Collect final clusters
        clusters.addAll(assignment.values());

        return clusters;
    }

    public static String findNearestCentroid(String point, List<String> centroids) {
        double minDistance = Double.MAX_VALUE;
        String nearestCentroid = null;
        for (String centroid : centroids) {
            double distance = calculateEuclideanDistance(point, centroid);
            if (distance < minDistance) {
                minDistance = distance;
                nearestCentroid = centroid;
            }
        }
        return nearestCentroid;
    }

    public static double calculateEuclideanDistance(String point1, String point2) {
        String[] coordinates1 = point1.split(",");
        String[] coordinates2 = point2.split(",");
        double x1 = Double.parseDouble(coordinates1[0]);
        double y1 = Double.parseDouble(coordinates1[1]);
        double x2 = Double.parseDouble(coordinates2[0]);
        double y2 = Double.parseDouble(coordinates2[1]);
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    public static String calculateCentroid(List<String> points) {
        double sumX = 0;
        double sumY = 0;
        for (String point : points) {
            String[] coordinates = point.split(",");
            double x = Double.parseDouble(coordinates[0]);
            double y = Double.parseDouble(coordinates[1]);
            sumX += x;
            sumY += y;
        }
        double centroidX = sumX / points.size();
        double centroidY = sumY / points.size();
        return centroidX + "," + centroidY;
    }

//    public static void main(String[] args) {
//        // Example usage
//        List<String> points = new ArrayList<>();
//        points.add("1,1");
//        points.add("1,2");
//        points.add("2,2");
//        points.add("5,5");
//        points.add("6,6");
//        points.add("7,7");
//        int numClusters = 2;
//
//        List<List<String>> clusters = kMeans(points, numClusters);
//        for (int i = 0; i < clusters.size(); i++) {
//            System.out.println("Cluster " + (i + 1) + ": " + clusters.get(i));
//            String centroid = calculateCentroid(clusters.get(i));
//            System.out.println("Centroid: " + centroid);
//        }
//    }
}