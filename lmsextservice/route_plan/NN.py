import math
from datetime import time as t, timedelta, datetime, date
from random import random

import numpy as np
import requests


def contains_sublist(lst, sublst):
    """
    Checks if a list `lst` contains the sublist `sublst`.

    Args:
        lst (list): The list to search.
        sublst (list): The sublist to look for.

    Returns:
        bool: True if `lst` contains `sublst`, False otherwise.
    """
    for i in range(len(lst) - len(sublst) + 1):
        if lst[i:i + len(sublst)] == sublst:
            return True
    return False


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on the Earth's surface.

    Parameters:
    lat1, lon1 (float): Latitude and longitude of the first point, in decimal degrees.
    lat2, lon2 (float): Latitude and longitude of the second point, in decimal degrees.

    Returns:
    float: The distance between the two points, in kilometers.
    """
    R = 6371  # Earth's radius in kilometers

    # Convert latitude and longitude to radians
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    # Calculate the Haversine formula
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c

    return distance * 1000  # in meters


def calculate_distance(point1, point2):
    # Calculate the distance between two points
    x1, y1 = point1
    x2, y2 = point2
    # distance = np.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    # API endpoint URL
    url = 'http://47.238.184.88:5000/route/v1/driving/{0},{1};{2},{3}'.format(x1, y1, x2, y2)  # change to public ip

    response = requests.get(url)
    try:
        if response.status_code == 400 or response.status_code == 500:
            backup_url = 'http://47.238.184.88:5000/route/v1/driving/{0},{1};{2},{3}'.format(y1, x1, y2, x2)
            response = requests.get(backup_url)

        if response.status_code == 200:
            data = response.json()
            distance = data['routes'][0]['distance']
        else:
            distance = haversine_distance(x1, y1, x2, y2)
    except Exception as e:
        distance = haversine_distance(x1, y1, x2, y2)

    return distance


def calculate_distance_matrix(points, pickup_point_of):
    num_points = len(points)
    distance_matrix = np.zeros((num_points, num_points))

    for i in range(num_points):
        for j in range(i + 1, num_points):
            distance1 = calculate_distance(points[i], points[j])
            distance2 = calculate_distance(points[j], points[i])

            distance_matrix[i][j] = distance1 if points[i] not in pickup_point_of or not (pickup_point_of[
                points[
                    i]].__contains__(
                points[j])) else np.inf
            distance_matrix[j][i] = distance2 if points[j] not in pickup_point_of or not (pickup_point_of[
                points[
                    j]].__contains__(
                points[i])) else np.inf

    return distance_matrix


def NN(pickup_list, delivery_list, current_time=None, pickup_point_of=None, deadline_of=None,
       start=(113.9667498, 22.3876616)):
    # pickup_points = [(np.random.uniform(114.1534, 114.2461), np.random.uniform(22.3215, 22.3875)) for _ in range(
    # 25)] delivery_points = [(np.random.uniform(114.1534, 114.2461), np.random.uniform(22.3215, 22.3875)) for _ in
    # range(25)]

    pickup_points = pickup_list
    delivery_points = delivery_list

    dist = 0

    # pickup_point_of = {}
    # deadline_of = {}

    # if current_time is None:
    #     current_time = t(hour=datetime.today().hour, minute=datetime.today().minute)  # 0 - 23, 0 - 59
    #
    # if deadline_of is None:
    #     deadline_of = {}
    #     for i in range(len(delivery_points)):
    #         delivery = delivery_points[i]
    #         deadline_of[delivery] = t(np.random.randint(current_time.hour + 1, 24), np.random.randint(0, 60))

    if pickup_point_of is None:
        pickup_point_of = {}
        for i in range(len(delivery_points)):
            if not (pickup_point_of.__contains__(delivery_points[i])):
                pickup_point_of[delivery_points[i]] = [pickup_points[random.randint(0, len(pickup_points) - 1)]]
            else:
                pickup_point_of[delivery_points[i]].append(pickup_points[random.randint(0, len(pickup_points) - 1)])

    points = pickup_points + delivery_points
    points_const = pickup_points + delivery_points
    problem = calculate_distance_matrix(points, pickup_point_of)

    route = []
    min_dist = math.inf
    first_loc = ()
    for i in pickup_points:
        if haversine_distance(start[0], start[1], i[0], i[1]) < min_dist:
            min_dist = haversine_distance(start[0], start[1], i[0], i[1])
            first_loc = i
    route.append(first_loc)
    points.remove(first_loc)
    pickup_points.remove(first_loc)

    while points:
        min_dist_for_pickup = math.inf
        min_dist_for_delivery = math.inf
        subsequent_loc_if_pickup = ()
        subsequent_loc_if_delivery = ()

        for i in pickup_points:
            foo_1 = points_const.index(route[-1])
            foo_2 = points_const.index(i)
            trial_dist = problem[foo_1][foo_2]
            if trial_dist < min_dist_for_pickup and route[-1] != i:
                min_dist_for_pickup = trial_dist
                subsequent_loc_if_pickup = i

        for i in delivery_points:
            trial_dist = problem[points_const.index(route[-1])][points_const.index(i)]
            if trial_dist and route[-1] != i and contains_sublist(route, pickup_point_of[i]):
                min_dist_for_delivery = trial_dist
                subsequent_loc_if_delivery = i

        if min_dist_for_pickup <= min_dist_for_delivery:
            route.append(subsequent_loc_if_pickup)
            dist += min_dist_for_pickup
            if subsequent_loc_if_pickup in points:
                points.remove(subsequent_loc_if_pickup)
            if subsequent_loc_if_pickup in pickup_points:
                pickup_points.remove(subsequent_loc_if_pickup)
        else:
            route.append(subsequent_loc_if_delivery)
            dist += min_dist_for_delivery
            if subsequent_loc_if_delivery in points:
                points.remove(subsequent_loc_if_delivery)
            if subsequent_loc_if_delivery in delivery_points:
                delivery_points.remove(subsequent_loc_if_delivery)

    best_path = []
    for i in route:
        best_path.append(points_const.index(i))
    # optimizer.plot()
    # print(best)
    # print(best_path)
    # for i in best_path:
    #     for j in best_path:
    #         if points[i] in pickup_point_of and pickup_point_of[points[i]].__contains__(points[j]) and i < j:
    #             print("haram")
    # points = points_const
    # print(points)
    # dist = 0
    # for i in range(0, len(best_path) - 1):
    #     print(dist)
    #     dist += calculate_distance(points[best_path[i]], points[best_path[i + 1]])
    print("dist={0}".format(dist))
    best = dist
    return best, best_path
