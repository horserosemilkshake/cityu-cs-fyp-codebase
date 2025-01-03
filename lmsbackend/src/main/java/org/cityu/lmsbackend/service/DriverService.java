package org.cityu.lmsbackend.service;

import cn.dev33.satoken.session.SaSession;
import cn.dev33.satoken.session.TokenSign;
import cn.dev33.satoken.stp.StpUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import org.cityu.lmsbackend.mapper.DriverAlteringMapper;
import org.cityu.lmsbackend.mapper.InfrastructureServiceMapper;
import org.cityu.lmsbackend.mapper.PackageAlteringMapper;
import org.cityu.lmsbackend.model.Client;
import org.cityu.lmsbackend.model.Deliverer;
import org.cityu.lmsbackend.model.P2PPackage;
import org.cityu.lmsbackend.model.W2PPackage;
import org.cityu.lmsbackend.utils.CommonUtils;
import org.cityu.lmsbackend.utils.KMeansClustering;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class DriverService {
    private InfrastructureServiceMapper infrastructureServiceMapper;

    @Autowired
    private DriverAlteringMapper driverAlteringMapper;
    
    @Autowired
    private PackageAlteringMapper packageAlteringMapper;

    @Autowired
    public void setInfrastructureServiceMapper(InfrastructureServiceMapper infrastructureServiceMapper) {
        this.infrastructureServiceMapper = infrastructureServiceMapper;
    }

	public String getDriver(String username) throws JsonProcessingException {
		ObjectMapper objectMapper = new ObjectMapper();
		Deliverer d = infrastructureServiceMapper.selectDriverByName(username);
//		d.setPassword(null);
		return objectMapper.writeValueAsString(d);
	}

	@Transactional(rollbackFor = Exception.class)
	public String getDeliveryRecord(String username) throws JsonProcessingException {
		ObjectMapper objectMapper = new ObjectMapper();

		List<Object> a = new ArrayList<>(infrastructureServiceMapper.selectAllP2PPackageGivenUniqueDriverUserName(username));
		List<Object> b = new ArrayList<>(infrastructureServiceMapper.selectAllW2PPackageGivenUniqueDriverUserName(username));
        a.addAll(b);
		return objectMapper.writeValueAsString(a).trim().replace('\uFEFF', ' ');
	}

    @Transactional(rollbackFor = Exception.class)
    public void updatePosition(String userName, String newCoordinate, String lastCoordinate, Double timeInterval) {
        assert !timeInterval.equals(0.0); // minutes
        Deliverer deliverer = infrastructureServiceMapper.selectDriverByName(userName);
        if (deliverer != null) {
            deliverer.setLast_coordinate(lastCoordinate);
            deliverer.setCurrent_coordinate(newCoordinate);
            Double distance = 0.0;
            Double speed = 0.0;
            if (deliverer.getLast_coordinate() != null) {
                distance = CommonUtils.obtainDistanceGivenTwoCoordinates(deliverer.getLast_coordinate(), newCoordinate);    // in meters
                speed = (distance / timeInterval) * 60;
                deliverer.setSpeed(speed);  //  meters per hour
            }
//            updateRelevantClients(userName, newCoordinate, speed);
            driverAlteringMapper.updateDriverPositionAndVelocity(deliverer);
        }
    }

	@Transactional(rollbackFor = Exception.class)
	public void offline(String username) {
		driverAlteringMapper.updateOffline(username);
	}

    public HttpStatus setPath(String username, List<String> coordinate) {
		try {
			Gson gson = new Gson();
			String jsonifiedPath = gson.toJson(coordinate);
			Random random = new Random();
			int randomInt = random.nextInt(1000000) + 1;
			infrastructureServiceMapper.removePathGivenUniqueUserName(username);
			infrastructureServiceMapper.insertCoordinateInARouteGivenUniqueUserName(username, jsonifiedPath, randomInt);
		} catch (Exception e) {
			return HttpStatus.INTERNAL_SERVER_ERROR;
		}
		return HttpStatus.OK;
	}

	public HttpStatus releaseLocation(String username, List<String> coordinate) {
		try {
			for (int i = 0; i < coordinate.size(); i++) {
				infrastructureServiceMapper.deleteCoordinateInARouteGivenUniqueUserName(username, coordinate.get(i));
			}
		} catch (Exception e) {
			return HttpStatus.INTERNAL_SERVER_ERROR;
		}
		return HttpStatus.OK;
	}

    @Transactional
	public ResponseEntity<String> occupyPackage(String username, List<String> packageIds, int present) {
		String message = "";
		HttpStatus status = HttpStatus.OK;
		if (present == 0) {
        	for (String packageId : packageIds) {
            	try {
					P2PPackage p = infrastructureServiceMapper.selectP2PPackageGivenUniquePackageId(packageId);
					if (!(p.getResponsible_driver_name() == null || p.getResponsible_driver_name().isEmpty())) {
						message = "Package " + p.getPackage_id() + " is already occupied.";
						status = HttpStatus.CONFLICT;
						return new ResponseEntity<>(message, status);
					}
					// p.setResponsible_driver_name(username);
					// packageAlteringMapper.updateP2PPackageResponsibleDeliverer(p.getPackage_id(), username);
				} catch (Exception e) {
					message = "Internal server error. Please try again.";
					status = HttpStatus.INTERNAL_SERVER_ERROR;
					return new ResponseEntity<>(message, status);
				}
            }

			for (String packageId : packageIds) {
				try {
					P2PPackage p = infrastructureServiceMapper.selectP2PPackageGivenUniquePackageId(packageId);
					p.setResponsible_driver_name(username);
					packageAlteringMapper.updateP2PPackageResponsibleDeliverer(p.getPackage_id(), username);
				} catch (Exception e) {
					message = "Internal server error. Please try again.";
					status = HttpStatus.INTERNAL_SERVER_ERROR;
					return new ResponseEntity<>(message, status);
				}
			}

        } else {
        	for (String packageId : packageIds) {
            	try {
					W2PPackage p = infrastructureServiceMapper.selectW2PPackageGivenUniquePackageId(packageId);
					if (!(p.getResponsible_driver_name() == null || p.getResponsible_driver_name().isEmpty())) {
						message = "Package " + p.getPackage_id() + " is already occupied.";
						status = HttpStatus.CONFLICT;
						return new ResponseEntity<>(message, status);
					}
					 p.setResponsible_driver_name(username);
					 packageAlteringMapper.updateW2PPackageResponsibleDeliverer(p.getPackage_id(), username);
				} catch (Exception e) {
					message = "Internal server error. Please try again.";
					status = HttpStatus.INTERNAL_SERVER_ERROR;
					return new ResponseEntity<>(message, status);
				}
            }

			for (String packageId : packageIds) {
				try {
					W2PPackage p = infrastructureServiceMapper.selectW2PPackageGivenUniquePackageId(packageId);
					p.setResponsible_driver_name(username);
					packageAlteringMapper.updateW2PPackageResponsibleDeliverer(p.getPackage_id(), username);
				} catch (Exception e) {
					message = "Internal server error. Please try again.";
					status = HttpStatus.INTERNAL_SERVER_ERROR;
					return new ResponseEntity<>(message, status);
				}
			}
        }
		message = "All the selected packages are admitted.";
		return new ResponseEntity<>(message, status);
	}

	public HttpStatus pickupPackage(String username, String packageId, int present) {
		if (present == 0) {
			try {
				P2PPackage p = (P2PPackage) infrastructureServiceMapper.selectP2PPackageGivenUniquePackageId(packageId);
				if (p.getResponsible_driver_name().isEmpty() || p.getFinished()) {
					return HttpStatus.CONFLICT;
				}
				packageAlteringMapper.updateP2PPackagePickedUpSuccessfully(packageId, username);
			} catch (Exception e) {
				return HttpStatus.INTERNAL_SERVER_ERROR;
			}
		} else {
			try {
				W2PPackage p = (W2PPackage) infrastructureServiceMapper.selectW2PPackageGivenUniquePackageId(packageId);
				if (p.getResponsible_driver_name().isEmpty() || p.getFinished()) {
					return HttpStatus.CONFLICT;
				}
				packageAlteringMapper.updateW2PPackagePickedUpSuccessfully(packageId, username);
			} catch (Exception e) {
				return HttpStatus.INTERNAL_SERVER_ERROR;
			}
		}
		return HttpStatus.ACCEPTED;
	}

	public String getDriverTransactionHashWithPackageID(String packageID) {
		System.out.println("getDriverTransactionHashWithPackageID invoked.");
		String id = "";
		try {
			id = infrastructureServiceMapper.selectDriverReferenceHashWithPackageID(packageID);
		} catch (Exception e) {
			id = "Error";
		}
		System.out.println(id);
		return id;
	}

	public HttpStatus releasePackage(String username, String packageId, int present) {
		if (present == 0) {
            	try {
					P2PPackage p = (P2PPackage) infrastructureServiceMapper.selectP2PPackageGivenUniquePackageId(packageId);
					if (p.getResponsible_driver_name().isEmpty() || p.getFinished()) {
						return HttpStatus.CONFLICT;
					}
					packageAlteringMapper.updateP2PPackageCompleteSuccessfullyy(packageId, username);
				} catch (Exception e) {
					return HttpStatus.INTERNAL_SERVER_ERROR;
				}
        } else {
            	try {
					W2PPackage p = (W2PPackage) infrastructureServiceMapper.selectW2PPackageGivenUniquePackageId(packageId);
					if (p.getResponsible_driver_name().isEmpty() || p.getFinished()) {
						return HttpStatus.CONFLICT;
					}
					packageAlteringMapper.updateW2PPackageCompleteSuccessfullyy(packageId, username);
				} catch (Exception e) {
					return HttpStatus.INTERNAL_SERVER_ERROR;
				}
        }
		return HttpStatus.ACCEPTED;
	}

	public String getPackage(String username, int present) throws JsonProcessingException {
		Deliverer deliverer = infrastructureServiceMapper.selectDriverByName(username);
		String currentCoordinate = deliverer.getCurrent_coordinate();
		List<String> clusterPoints = new ArrayList<>();
		List<String> returnList = new ArrayList<>();

		ObjectMapper objectMapper = new ObjectMapper();
		
		if (present == 0) {
			List<P2PPackage> returnObject = new ArrayList<>();
			try {
				List<P2PPackage> pList = infrastructureServiceMapper.selectAllP2PPackageWithNoDeliverer();
				List<Deliverer> deliverersOnline = infrastructureServiceMapper.selectAllFromDriver();
				
				deliverersOnline.removeIf(o -> !o.getReady());
				int numberOfOnlineDeliverer = deliverersOnline.size();
				
				HashMap<String, List<String>> packageDestinationToPackageIDMap = new HashMap<String, List<String>>();
				Set<String> uniqueCoordinates = new HashSet<>();
				for (P2PPackage p : pList) {
					System.out.println(p);
					uniqueCoordinates.add(p.getPackage_destination_coordinate());
                    packageDestinationToPackageIDMap.computeIfAbsent(p.getPackage_destination_coordinate(), k -> new ArrayList<>());
					packageDestinationToPackageIDMap.get(p.getPackage_destination_coordinate()).add(p.getPackage_id());
				}
				
				List<String> points = new ArrayList<>(uniqueCoordinates);
				List<List<String>> clusters = KMeansClustering.kMeans(points, numberOfOnlineDeliverer);
				
				List<String> centroids = new ArrayList<>();
				for (List<String> c : clusters) {
					centroids.add(KMeansClustering.calculateCentroid(c));
				}
				
				double minDist = Integer.MAX_VALUE;
				int minIndex = 0;
				
				for (int i = 0; i < centroids.size(); i++) {
					if (minDist < KMeansClustering.calculateEuclideanDistance(currentCoordinate, centroids.get(i))) {
						minDist = KMeansClustering.calculateEuclideanDistance(currentCoordinate, centroids.get(i));
						minIndex = i;
					}
		        }
				
				clusterPoints = clusters.get(minIndex);
				
				returnList = new ArrayList<>();
				for (String coords : clusterPoints) {
					for (String p : packageDestinationToPackageIDMap.get(coords)) {
						returnList.add(p);
						//returnObject.add(pList.stream().filter(o -> o.getPackage_id().equals(p)).findAny());
						returnObject.addAll(pList.stream().filter(o -> o.getPackage_id().equals(p)).toList());
					}
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
			return objectMapper.writeValueAsString(returnObject).trim().replace('\uFEFF', ' ');
		} else {
			List<W2PPackage> returnObject = new ArrayList<>();
			try {
				List<W2PPackage> pList = infrastructureServiceMapper.selectAllW2PPackageWithNoDeliverer();
				List<Deliverer> deliverersOnline = infrastructureServiceMapper.selectAllFromDriver();
				deliverersOnline.removeIf(o -> !o.getReady());
				int numberOfOnlineDeliverer = deliverersOnline.size();
				
				HashMap<String, List<String>> packageDestinationToPackageIDMap = new HashMap<String, List<String>>();
				Set<String> uniqueCoordinates = new HashSet<>();
				for (W2PPackage p : pList) {
					uniqueCoordinates.add(p.getPackage_destination_coordinate());
					if (packageDestinationToPackageIDMap.get(p.getPackage_destination_coordinate()) == null) {
						packageDestinationToPackageIDMap.put(p.getPackage_destination_coordinate(), new ArrayList<>());
					}
					packageDestinationToPackageIDMap.get(p.getPackage_destination_coordinate()).add(p.getPackage_id());
				}
				
				List<String> points = new ArrayList<>(uniqueCoordinates);
				List<List<String>> clusters = KMeansClustering.kMeans(points, numberOfOnlineDeliverer);
				
				List<String> centroids = new ArrayList<>();
				for (List<String> c : clusters) {
					centroids.add(KMeansClustering.calculateCentroid(c));
				}
				
				double minDist = Integer.MAX_VALUE;
				int minIndex = 0;
				
				for (int i = 0; i < centroids.size(); i++) {
					if (minDist < KMeansClustering.calculateEuclideanDistance(currentCoordinate, centroids.get(i))) {
						minDist = KMeansClustering.calculateEuclideanDistance(currentCoordinate, centroids.get(i));
						minIndex = i;
					}
		        }
				
				clusterPoints = clusters.get(minIndex);
				
				returnList = new ArrayList<>();
				for (String coords : clusterPoints) {
					for (String p : packageDestinationToPackageIDMap.get(coords)) {
						System.out.println(p);
						returnList.add(p);
						//returnObject.add(pList.stream().filter(o -> o.getPackage_id().equals(p)).findAny());
						returnObject.addAll(pList.stream().filter(o -> o.getPackage_id().equals(p)).toList());
					}
				}

			} catch (Exception e) {
				e.printStackTrace();
			}
			return objectMapper.writeValueAsString(returnObject).trim().replace('\uFEFF', ' ');
		}
	}
}
