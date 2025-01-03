import math
import random
from itertools import combinations
import os, sys, copy
from math import ceil

import numpy as np
import time
import matplotlib.pyplot as plt
import requests

from datetime import time as t, timedelta, date, datetime

from route_plan.NN import NN


class Tabu():
    def __init__(self, current_time, deadline_of, points, disMatrix, max_iters=50, maxTabuSize=10):
        """parameters definition"""
        self.deadline_of = deadline_of
        self.current_time = current_time
        self.points = points
        self.disMatrix = disMatrix
        self.maxTabuSize = maxTabuSize
        self.max_iters = max_iters
        self.tabu_list = []

    def get_route_distance(self, route):
        '''
        Description: function to calculate total distance of a route. evaluate function.
        parameters: route : list
        return : total distance : folat
        '''
        routes = [0] + route + [0]  # add the start and end point
        total_distance = 0
        eta = 0
        for i, n in enumerate(routes):
            if i != 0:
                deviant = self.disMatrix[last_pos][n]
                total_distance += deviant

                eta += ceil(((deviant / 1000) / 30) * 60) if np.isfinite(deviant) else 0
                if self.current_time is not None and self.deadline_of is not None and self.deadline_of.__contains__(
                        self.points[n]):
                    current_datetime = datetime.combine(date.today(), self.current_time)
                    deadline_datetime = datetime.combine(date.today(), self.deadline_of[self.points[n]])
                    current_datetime = current_datetime + timedelta(minutes=eta)
                    if current_datetime > deadline_datetime:
                        latency = ceil((current_datetime - deadline_datetime).total_seconds() / 60)
                        total_distance += latency
            last_pos = n
        return total_distance

    def exchange(self, s1, s2, arr):
        """
        function to Swap positions of two elements in an arr
        Args: int,int,list
            s1 : target 1 
            s2 : target 2  
            arr : target array 
        Ouput: list
            current_list : target array 
        """
        current_list = copy.deepcopy(arr)
        index1, index2 = current_list.index(s1), current_list.index(s2)  # get index
        current_list[index1], current_list[index2] = arr[index2], arr[index1]
        return current_list

    def generate_initial_solution(self, pickup_list, delivery_list, current_time=None, pickup_point_of=None,
                                  deadline_of=None,
                                  start=None, num=10, mode='greedy'):
        """
        function to get the initial solution,there two different way to generate route_init.
        Args: 
            num :  int
                the number of points 
            mode : string
                "greedy" : advance step by choosing optimal one 
                "random" : randomly generate a series number
        Ouput: list
            s_init : initial solution route_init
        """
        # if mode == 'greedy':
        #     route_init = [0]
        #     for i in range(num):
        #         best_distance = np.inf
        #         for j in range(num + 1):
        #             if self.disMatrix[i][j] < best_distance and j not in route_init:
        #                 best_distance = self.disMatrix[i][j]
        #                 best_candidate = j
        #         route_init.append(best_candidate)
        #     route_init.remove(0)
        #
        # if mode == 'random':
        #     route_init = np.arange(1, num + 1)  # init solution from 1 to num
        #     np.random.shuffle(route_init)  # shuffle the list randomly

        best, route_init = NN(pickup_list, delivery_list, current_time, pickup_point_of, deadline_of, start)

        return list(route_init)

    def tabu_search(self, s_init):
        """tabu search"""
        s_best = s_init
        bestCandidate = copy.deepcopy(s_best)
        routes, temp_tabu = [], []  # init
        routes.append(s_best)
        while (self.max_iters):
            self.max_iters -= 1  # Number of iterations
            neighbors = copy.deepcopy(s_best)
            for s in combinations(neighbors, 2):
                sCandidate = self.exchange(s[0], s[1], neighbors)  # exchange number to generate candidates
                if s not in self.tabu_list and self.get_route_distance(sCandidate) < self.get_route_distance(
                        bestCandidate):
                    bestCandidate = sCandidate
                    temp_tabu = s
            if self.get_route_distance(bestCandidate) < self.get_route_distance(s_best):  # record the best solution
                s_best = bestCandidate
            if temp_tabu not in self.tabu_list:
                self.tabu_list.append(temp_tabu)
            if len(self.tabu_list) > self.maxTabuSize:
                self.tabu_list.pop(0)
            routes.append(bestCandidate)
        return s_best, routes


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
    if response.status_code == 400 or response.status_code == 500:
        backup_url = 'http://47.238.184.88:5000/route/v1/driving/{0},{1};{2},{3}'.format(y1, x1, y2, x2)
        response = requests.get(backup_url)

    if response.status_code == 200:
        data = response.json()
        distance = data['routes'][0]['distance']
    else:
        distance = haversine_distance(x1, y1, x2, y2)
    return distance


# if __name__ == "__main__":
#     np.random.seed(114514)


def ts(pickup_list, delivery_list, current_time=None, pickup_point_of=None, deadline_of=None,
       start=(113.9667498, 22.3876616)):
    # 定义多少个点
    # pickup_points = [(np.random.uniform(114.1534, 114.2461), np.random.uniform(22.3215, 22.3875)) for _ in range(
    # 25)] delivery_points = [(np.random.uniform(114.1534, 114.2461), np.random.uniform(22.3215, 22.3875)) for _ in
    # range(25)]

    pickup_points = pickup_list
    delivery_points = delivery_list

    customerNum = len(pickup_list) + len(delivery_list) - 1

    # pickup_point_of = {}
    # deadline_of = {}

    if current_time is None:
        current_time = t(hour=datetime.today().hour, minute=datetime.today().minute)  # 0 - 23, 0 - 59

    if deadline_of is None:
        deadline_of = {}
        for i in range(len(delivery_points)):
            delivery = delivery_points[i]
            deadline_of[delivery] = t(np.random.randint(current_time.hour + 1, 24), np.random.randint(0, 60))

    if pickup_point_of is None:
        pickup_point_of = {}
        for i in range(len(delivery_points)):
            if not (pickup_point_of.__contains__(delivery_points[i])):
                pickup_point_of[delivery_points[i]] = [pickup_points[random.randint(0, len(pickup_points) - 1)]]
            else:
                pickup_point_of[delivery_points[i]].append(pickup_points[random.randint(0, len(pickup_points) - 1)])

    points = pickup_points + delivery_points
    problem = calculate_distance_matrix(points, pickup_point_of)

    """ Tabu : 
        disMatrix : the distance matrix from 0 to X , 0 represernt starting and stopping point。 
        for example:   disMatrix = [[0,3,4,...
                                     1,0,5,...
                                     3,5,0,...]]
       that means the distance from 0 to 0 is 0, from 0 to 1 is 3,... from 1 to 3 is 5....		
        max_iters : maximum iterations 
        maxTabuSize : maximum iterations 
    """
    tsp = Tabu(current_time=current_time, deadline_of=deadline_of, points=points, disMatrix=problem, max_iters=60,
               maxTabuSize=60)
    # two different way to generate initial solution
    # num : the number of points
    s_init = tsp.generate_initial_solution(pickup_list=pickup_list, delivery_list=delivery_list,
                                           current_time=current_time, pickup_point_of=pickup_point_of,
                                           deadline_of=deadline_of, start=start, num=customerNum,
                                           mode='greedy')  # mode = "greedy"  or "random"
    print('init route : ', s_init)
    print('init distance : ', tsp.get_route_distance(s_init))

    start = time.time()
    best_route, routes = tsp.tabu_search(s_init)  # tabu search
    end = time.time()

    print('best route : ', best_route)
    dist = 0
    for i in range(0, len(best_route) - 1):
        print(dist)
        dist += calculate_distance(points[best_route[i]], points[best_route[i + 1]])
    # print('best best_distance : ', tsp.get_route_distance(best_route))
    print('best best_distance : ', dist)
    print('the time cost : ', end - start)

    # plot the result changes with iterations
    # results = []
    # for i in routes:
    #     results.append(tsp.get_route_distance(i))
    # plt.plot(np.arange(len(results)), results)
    # plt.show()

    return dist, best_route
    # plot the route
