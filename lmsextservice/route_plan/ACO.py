import math
import random
import sys
from math import ceil

import numpy
import numpy as np
import matplotlib.pyplot as plt

import time
from datetime import time as t, timedelta, datetime, date

import warnings

import requests
from more_itertools import locate
from requests import Response

from route_plan.NN import haversine_distance

warnings.filterwarnings("ignore")


class AntColonyOptimizer:
    def __init__(self, points, ants, evaporation_rate, intensification, alpha=1.0, beta=0.0, beta_evaporation_rate=0,
                 choose_best=.1):
        """
        Ant colony optimizer.  Traverses a graph and finds either the max or min distance between nodes.
        :param ants: number of ants to traverse the graph
        :param evaporation_rate: rate at which pheromone evaporates
        :param intensification: constant added to the best path
        :param alpha: weighting of pheromone
        :param beta: weighting of heuristic (1/distance)
        :param beta_evaporation_rate: rate at which beta decays (optional)
        :param choose_best: probability to choose the best route
        """
        # Parameters
        self.points = points
        self.ants = ants
        self.evaporation_rate = evaporation_rate
        self.pheromone_intensification = intensification
        self.heuristic_alpha = alpha
        self.heuristic_beta = beta
        self.beta_evaporation_rate = beta_evaporation_rate
        self.choose_best = choose_best

        # Internal representations
        self.pheromone_matrix = None
        self.heuristic_matrix = None
        self.probability_matrix = None

        self.map = None
        self.set_of_available_nodes = None

        # Internal stats
        self.best_series = []
        self.best = None
        self.fitted = False
        self.best_path = None
        self.fit_time = None

        # Plotting values
        self.stopped_early = False

        self.delay_from_fatal_accident = 100  # Random number WLOG, can be tuned
        self.delay_from_serious_accident = 50
        self.delay_from_slight_accident = 20

        self.lambda_fatal = 0.00019895357
        self.lambda_serious = 0.00173325722
        self.lambda_slight = 0.0293131659

    def __str__(self):
        string = "Ant Colony Optimizer"
        string += "\n--------------------"
        string += "\nDesigned to optimize either the minimum or maximum distance between nodes in a square matrix that behaves like a distance matrix."
        string += "\n--------------------"
        string += "\nNumber of ants:\t\t\t\t{}".format(self.ants)
        string += "\nEvaporation rate:\t\t\t{}".format(self.evaporation_rate)
        string += "\nIntensification factor:\t\t{}".format(self.pheromone_intensification)
        string += "\nAlpha Heuristic:\t\t\t{}".format(self.heuristic_alpha)
        string += "\nBeta Heuristic:\t\t\t\t{}".format(self.heuristic_beta)
        string += "\nBeta Evaporation Rate:\t\t{}".format(self.beta_evaporation_rate)
        string += "\nChoose Best Percentage:\t\t{}".format(self.choose_best)
        string += "\n--------------------"
        string += "\nUSAGE:"
        string += "\nNumber of ants influences how many paths are explored each iteration."
        string += "\nThe alpha and beta heuristics affect how much influence the pheromones or the distance heuristic weigh an ants' decisions."
        string += "\nBeta evaporation reduces the influence of the heuristic over time."
        string += "\nChoose best is a percentage of how often an ant will choose the best route over probabilistically choosing a route based on pheromones."
        string += "\n--------------------"
        if self.fitted:
            string += "\n\nThis optimizer has been fitted."
        else:
            string += "\n\nThis optimizer has NOT been fitted."
        return string

    def poisson(self, tau):
        p_fatal = (self.lambda_fatal * tau) * math.exp(-self.lambda_fatal * tau)
        p_serious = (self.lambda_serious * tau) * math.exp(-self.lambda_serious * tau)
        p_slight = (self.lambda_slight * tau) * math.exp(-self.lambda_slight * tau)
        p_nothing = 1 - p_fatal - p_serious - p_slight

        random_number = random.random()

        if random_number < p_fatal:
            latency = self.delay_from_fatal_accident
        elif random_number < p_fatal + p_serious:
            latency = self.delay_from_serious_accident
        elif random_number < p_fatal + p_serious + p_slight:
            latency = self.delay_from_slight_accident
        else:
            latency = 0

        return latency

    def _initialize(self, points=None, pickup_point_of=None):
        """
        Initializes the model by creating the various matrices and generating the list of available nodes
        """
        assert self.map.shape[0] == self.map.shape[1], "Map is not a distance matrix!"
        num_nodes = self.map.shape[0]
        self.pheromone_matrix = np.ones((num_nodes, num_nodes))
        # Remove the diagonal since there is no pheromone from node i to itself
        self.pheromone_matrix[np.eye(num_nodes) == 1] = 0
        # for i in pickup_point_of:
        #     for j in pickup_point_of[i]:
        #         indexes_of_i = list(locate(points, lambda x: math.isclose(x[0], i[0]) and math.isclose(x[1], i[1])))
        #         indexes_of_j = list(locate(points, lambda x: math.isclose(x[0], j[0]) and math.isclose(x[1], j[1])))
        #         for ii in indexes_of_i:
        #             for ij in indexes_of_j:
        #                 # self.pheromone_matrix[points.index(i)][points.index(j)] = 0
        #                 self.pheromone_matrix[ii][ij] = 0
        self.heuristic_matrix = 1 / self.map
        self.probability_matrix = (self.pheromone_matrix ** self.heuristic_alpha) * (
                self.heuristic_matrix ** self.heuristic_beta)  # element by element multiplcation
        self.set_of_available_nodes = list(range(num_nodes))

    def _reinstate_nodes(self):
        """
        Resets available nodes to all nodes for the next iteration
        """
        self.set_of_available_nodes = list(range(self.map.shape[0]))

    def _update_probabilities(self):
        """
        After evaporation and intensification, the probability matrix needs to be updated.  This function
        does that.
        """
        self.probability_matrix = (self.pheromone_matrix ** self.heuristic_alpha) * (
                self.heuristic_matrix ** self.heuristic_beta)

    def _choose_next_node(self, from_node):
        """
        Chooses the next node based on probabilities.  If p < p_choose_best, then the best path is chosen, otherwise
        it is selected from a probability distribution weighted by the pheromone.
        :param from_node: the node the ant is coming from
        :return: index of the node the ant is going to
        """
        numerator = self.probability_matrix[from_node, self.set_of_available_nodes]
        if np.random.random() < self.choose_best:
            next_node = np.argmax(numerator)
        else:
            denominator = np.sum(numerator)
            if np.all(numpy.isclose(numerator, 0.)) or numpy.isclose(denominator, 0.0):
                probabilities = np.ones_like(numerator)
                probabilities /= np.sum(probabilities)
                return np.random.choice(range(len(probabilities)), p=probabilities)
            else:
                if not (np.any(np.isinf(denominator))):
                    probabilities = numerator / denominator
                else:
                    finite_numerator = numerator[np.isfinite(numerator)]
                    if finite_numerator.size > 0:
                        numerator[np.isinf(numerator)] = np.max(finite_numerator)
                    else:
                        probabilities = np.ones_like(numerator)
                        probabilities /= np.sum(probabilities)
                        return np.random.choice(range(len(probabilities)), p=probabilities)
                    denominator = np.sum(numerator)
                    probabilities = numerator / denominator

                    if np.all(numpy.isclose(numerator, 0.)) or numpy.isclose(denominator, 0.0):
                        probabilities = np.ones_like(numerator)
                        probabilities /= np.sum(probabilities)
                        return np.random.choice(range(len(probabilities)), p=probabilities)

                probabilities[np.isnan(probabilities)] = 0.0
            try:
                next_node = np.random.choice(range(len(probabilities)), p=probabilities)
            except:
                print(numerator)
                print(denominator)
                print(probabilities)
                raise Exception
        return next_node

    def _remove_node(self, node):
        self.set_of_available_nodes.remove(node)

    def _evaluate(self, paths, mode, current_time=None, deadline_of=None):
        """
        Evaluates the solutions of the ants by adding up the distances between nodes.
        :param paths: solutions from the ants
        :param mode: max or min
        :return: x and y coordinates of the best path as a tuple, the best path, and the best score
        """
        scores = np.zeros(len(paths))
        coordinates_i = []
        coordinates_j = []
        for index, path in enumerate(paths):
            score = 0
            eta = 0
            coords_i = []
            coords_j = []
            for i in range(len(path) - 1):
                coords_i.append(path[i])
                coords_j.append(path[i + 1])
                deviant = self.map[path[i], path[i + 1]]
                score += deviant

                eta += ceil(((deviant / 1000) / 30) * 60) if np.isfinite(deviant) else 0
                if current_time is not None and deadline_of is not None and deadline_of.__contains__(self.points[i]):
                    current_datetime = datetime.combine(date.today(), current_time)
                    presumed_datetime = current_datetime + timedelta(minutes=eta)
                    deadline_datetime = current_datetime + timedelta(hours=deadline_of[self.points[i]][0],
                                                                     minutes=deadline_of[self.points[i]][1])
                    latency = self.poisson(eta)  # Added poisson
                    if presumed_datetime > deadline_datetime:
                        latency += ceil((current_datetime - deadline_datetime).total_seconds() / 60)
                    score += latency
            scores[index] = score
            coordinates_i.append(coords_i)
            coordinates_j.append(coords_j)
        if mode == 'min':
            best = np.argmin(scores)
        elif mode == 'max':
            best = np.argmax(scores)
        return (coordinates_i[best], coordinates_j[best]), paths[best], scores[best]

    def _evaporation(self):
        """
        Evaporate some pheromone as the inverse of the evaporation rate.  Also evaporates beta if desired.
        """
        self.pheromone_matrix *= (1 - self.evaporation_rate)
        self.heuristic_beta *= (1 - self.beta_evaporation_rate)

    def _intensify(self, best_coords):
        """
        Increases the pheromone by some scalar for the best route.
        :param best_coords: x and y (i and j) coordinates of the best route
        """
        i = best_coords[0]
        j = best_coords[1]
        self.pheromone_matrix[i, j] += self.pheromone_intensification

    def fit(self, map_matrix, iterations=100, points=None, pickup_point_of=None, current_time=None, deadline_of=None,
            start=None, pickup_points=None, delivery_points=None,
            mode='min', early_stopping_count=20,
            verbose=True):
        """
        Fits the ACO to a specific map.  This was designed with the Traveling Salesman problem in mind.
        :param map_matrix: Distance matrix or some other matrix with similar properties
        :param iterations: number of iterations
        :param mode: whether to get the minimum path or maximum path
        :param early_stopping_count: how many iterations of the same score to make the algorithm stop early
        :return: the best score
        """
        if verbose:
            print("Beginning ACO Optimization with {} iterations...".format(iterations))

        self.map = map_matrix
        start = time.time()
        self._initialize(points, pickup_point_of)
        num_equal = 0

        for i in range(iterations):
            start_iter = time.time()
            paths = []
            path = []

            for ant in range(self.ants):
                # current_node = self.set_of_available_nodes[np.random.randint(0, len(self.set_of_available_nodes))]
                while True:
                    current_node = self.set_of_available_nodes[np.random.randint(0, len(self.set_of_available_nodes))]
                    if points[current_node] not in delivery_points:
                        break
                # while current_node in pickup_point_of and len(self.set_of_available_nodes) > 1:
                #     current_node = self.set_of_available_nodes[np.random.randint(0, len(self.set_of_available_nodes))]
                start_node = current_node
                while True:
                    path.append(current_node)
                    self._remove_node(current_node)
                    if len(self.set_of_available_nodes) != 0:
                        current_node_index = self._choose_next_node(current_node)
                        current_node = self.set_of_available_nodes[current_node_index]
                    else:
                        break

                # path.append(start_node)  # go back to start
                self._reinstate_nodes()
                paths.append(path)
                path = []

            best_path_coords, best_path, best_score = self._evaluate(paths, mode, current_time, deadline_of)

            if i == 0:
                best_score_so_far = best_score
            else:
                if mode == 'min':
                    if best_score <= best_score_so_far:
                        best_score_so_far = best_score
                        self.best_path = best_path
                elif mode == 'max':
                    if best_score > best_score_so_far:
                        best_score_so_far = best_score
                        self.best_path = best_path

            if best_score == best_score_so_far:
                num_equal += 1
            else:
                num_equal = 0

            self.best_series.append(best_score)
            self._evaporation()
            self._intensify(best_path_coords)
            self._update_probabilities()

            if verbose: print("Best score at iteration {}: {}; overall: {} ({}s)"
                              "".format(i, round(best_score, 2), round(best_score_so_far, 2),
                                        round(time.time() - start_iter)))

            if best_score == best_score_so_far and num_equal == early_stopping_count:
                self.stopped_early = True
                print("Stopping early due to {} iterations of the same score.".format(early_stopping_count))
                break

        self.fit_time = round(time.time() - start)
        self.fitted = True

        if mode == 'min':
            self.best = self.best_series[np.argmin(self.best_series)]
            if verbose: print(
                "ACO fitted.  Runtime: {} minutes.  Best score: {}".format(self.fit_time // 60, self.best))
            return self.best, self.best_path, self.best_series
        elif mode == 'max':
            self.best = self.best_series[np.argmax(self.best_series)]
            if verbose: print(
                "ACO fitted.  Runtime: {} minutes.  Best score: {}".format(self.fit_time // 60, self.best))
            return self.best, self.best_path, self.best_series
        else:
            raise ValueError("Invalid mode!  Choose 'min' or 'max'.")

    def plot(self):
        """
        Plots the score over time after the model has been fitted.
        :return: None if the model isn't fitted yet
        """
        if not self.fitted:
            print("Ant Colony Optimizer not fitted!  There exists nothing to plot.")
            return None
        else:
            fig, ax = plt.subplots(figsize=(20, 15))
            ax.plot(self.best_series, label="Best Run")
            ax.set_xlabel("Iteration")
            ax.set_ylabel("Performance")
            ax.text(.8, .6,
                    'Ants: {}\nEvap Rate: {}\nIntensify: {}\nAlpha: {}\nBeta: {}\nBeta Evap: {}\nChoose Best: {}\n\nFit Time: {}m{}'.format(
                        self.ants, self.evaporation_rate, self.pheromone_intensification, self.heuristic_alpha,
                        self.heuristic_beta, self.beta_evaporation_rate, self.choose_best, self.fit_time // 60,
                        ["\nStopped Early!" if self.stopped_early else ""][0]),
                    bbox={'facecolor': 'gray', 'alpha': 0.8, 'pad': 10}, transform=ax.transAxes)
            ax.legend()
            plt.title("Ant Colony Optimization Results (best: {})".format(np.round(self.best, 2)))
            plt.show()


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


def aco(pickup_list, delivery_list, current_time=None, pickup_point_of=None, deadline_of=None,
        start=(113.9667498, 22.3876616)):
    # pickup_points = [(np.random.uniform(114.1534, 114.2461), np.random.uniform(22.3215, 22.3875)) for _ in range(
    # 25)] delivery_points = [(np.random.uniform(114.1534, 114.2461), np.random.uniform(22.3215, 22.3875)) for _ in
    # range(25)]

    pickup_points = pickup_list
    delivery_points = delivery_list

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
    optimizer = AntColonyOptimizer(points=points, ants=10, evaporation_rate=.1, intensification=2, alpha=1, beta=1,
                                   beta_evaporation_rate=0, choose_best=.1)

    best, best_path, best_series = optimizer.fit(problem, 100, points, pickup_point_of, current_time, deadline_of,
                                                 start, pickup_points, delivery_points)
    # optimizer.plot()
    # print(best)
    # print(best_path)
    # for i in best_path:
    #     for j in best_path:
    #         if points[i] in pickup_point_of and pickup_point_of[points[i]].__contains__(points[j]) and i < j:
    #             print("haram")
    points = pickup_points + delivery_points
    print(points)
    dist = 0
    for i in range(0, len(best_path) - 1):
        print(dist)
        dist += calculate_distance(points[best_path[i]], points[best_path[i + 1]])
    print("dist={0}".format(dist))
    best = dist
    return best, best_path
