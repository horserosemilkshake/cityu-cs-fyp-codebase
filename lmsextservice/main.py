import ast
import asyncio
import base64
import io
import logging
import math
import mimetypes
import random
import time
import uuid

import numpy as np
import copy
import sys

import requests
from PIL import Image
from flask import Flask, request, send_file, jsonify
from datetime import time as t, timedelta, datetime, date

import route_plan.ACO as ACO
import route_plan.NN as NN
import route_plan.TS as TS
import size_detection.measurement as measurement
import transaction
from packing_scheme.DBLF import init_ethnic, pack_item_into_box_dblf

import http.client

from packing_scheme.SBBT import stack_based_binary_tree
from transaction import transfer

from flask_cors import CORS, cross_origin

from celery import Celery

app = Flask(__name__)
cors = CORS(app)

app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'  # Replace with Celery broker URL
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'  # Replace with Celery result backend URL

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)


@app.route('/get', methods=['GET'])
def get():
    return {"title": 'React GET Request'}


@app.route('/measure', methods=['POST'])
def measure():
    if 'image' not in request.files:
        data = {
            "extra_msg": 'No image file found here',
            'image': ""
        }
        return jsonify(data)

    file = request.files['image']
    temp_file_name = uuid.uuid4().__str__()
    temp_file_path = 'temp/{0}.jpg'.format(temp_file_name)
    file.save(temp_file_path)
    obj = measurement.ObjectMeasurement(temp_file_path, 2.57, temp_file_name)
    output_path, dimA, dimB = obj.measure_objects()

    # Read the image file
    with open(output_path, 'rb') as file:
        image_data = file.read()

    # Encode the image as base64
    image_base64 = base64.b64encode(image_data).decode('utf-8')

    data = {
        'dimA': dimA,
        'dimB': dimB,
        'image': image_base64
    }

    return jsonify(data)


@app.route('/balance', methods=['POST'])
def balance():
    body = request.json
    wallet_address = body["wallet_address"]
    web3 = transaction.create_web3("https://polygon.drpc.org")
    return jsonify(transaction.check_balance(web3, wallet_address, "MATIC"))


@app.route('/transfer', methods=['POST'])
def trans():
    body = request.json
    amount = 0.1
    sender_wallet_address = body["sender_wallet_address"]
    sender_private_key = body["sender_private_key"]
    recipient_wallet_address = body["recipient_wallet_address"]
    if "amount" in body:
        amount = body["amount"]

    return transfer(sender_wallet_address, recipient_wallet_address, sender_private_key, amount)


@app.route('/pack', methods=['POST'])
def pack():
    # {
    #     "username": "driver1",
    #     "content": {
    #         "box": {
    #             "dimensions": [
    #                 587,
    #                 233,
    #                 220
    #             ]
    #         },
    #         "items": [
    #             {
    #                 "id": "1",
    #                 "size": [
    #                     108,
    #                     76,
    #                     30
    #                 ],
    #                 "count": 5
    #             },
    #             {
    #                 "id": "2",
    #                 "size": [
    #                     110,
    #                     43,
    #                     25
    #                 ],
    #                 "count": 2
    #             },
    #             {
    #                 "id": "3",
    #                 "size": [
    #                     92,
    #                     81,
    #                     55
    #                 ],
    #                 "count": 5
    #             }
    #         ],
    #         "method": "SBBT"
    #     }
    # }
    username = request.json["username"]
    body = request.json["content"]
    box = body["box"]
    items = body["items"]

    # box = {"dimensions": [box["dimensions"][0] * 10, box["dimensions"][1] * 10, box["dimensions"][2] * 10]}
    # temp = []  # magnify space in case of double of 2 decimal places
    # for i in items:
    #     while i["count"] > 0:
    #         temp.append(
    #             {"id": i["id"], "size": [int(i["size"][0] * 10), int(i["size"][1] * 10), int(i["size"][2] * 10)],
    #              "count": 1})
    #         i["count"] -= 1
    # items = temp

    if body["method"] == "DBLF":
        box = {"dimensions": [int(box["dimensions"][0]), int(box["dimensions"][1]), int(box["dimensions"][2])]}
        temp = []  # magnify space in case of double of 2 decimal places
        for i in items:
            while i["count"] > 0:
                temp.append(
                    {"id": i["id"], "size": [int(i["size"][0]), int(i["size"][1]), int(i["size"][2])],
                     "count": 1})
                i["count"] -= 1
        items = temp

        s, i, f = pack_item_into_box_dblf(items, box, init_ethnic(items, 20)[0], True, username)
        list_item = i

        asyncio.sleep(5)

        image = Image.open("output/" + "DBLF" + username + ".jpg")  # Replace with the path to your image file

        image_bytes = io.BytesIO()
        image.save(image_bytes, format='JPEG')
        image_bytes.seek(0)

        encoded_image = base64.b64encode(image_bytes.getvalue()).decode('utf-8')

        return jsonify(list_data=list_item, image=encoded_image)

    if body["method"] == "SBBT":
        box = {"dimensions": [box["dimensions"][0], box["dimensions"][1], box["dimensions"][2]]}
        temp = []  # magnify space in case of double of 2 decimal places
        for i in items:
            while i["count"] > 0:
                temp.append(
                    {"id": i["id"], "size": [int(i["size"][0]), int(i["size"][1]), int(i["size"][2])],
                     "count": 1})
                i["count"] -= 1
        items = temp

        print("items before passing in: " + items.__str__())

        s, i, f = stack_based_binary_tree(items, box, True, username)

        list_item = i

        asyncio.sleep(5)

        image = Image.open("output/" + "SBBT" + username + ".jpg")  # Replace with the path to your image file

        image_bytes = io.BytesIO()
        image.save(image_bytes, format='JPEG')
        image_bytes.seek(0)

        encoded_image = base64.b64encode(image_bytes.getvalue()).decode('utf-8')

        return jsonify(list_data=list_item, image=encoded_image)



@app.route('/plan', methods=['POST'])
def plan():
    # {
    #     "content": {
    #         "pickup": [[114.0981, 22.2572], [113.9885, 22.3056], [114.3849, 22.4192], [114.1654, 22.4413],
    #                    [114.2365, 22.4297], [114.0897, 22.3651], [114.4013, 22.3429], [114.0869, 22.2374],
    #                    [114.2252, 22.2265], [114.3546, 22.3018]],
    #         "delivery": [[114.1802, 22.2761], [114.1093, 22.3599], [114.2874, 22.3195], [114.1838, 22.4427],
    #                      [114.2899, 22.3698], [114.0337, 22.2673], [114.2631, 22.4254], [113.9244, 22.3665],
    #                      [114.0924, 22.2767], [114.3249, 22.2441]],
    #         "current_time": [9, 30],
    #         "pickup_point_of": {
    #             "[114.1802, 22.2761]": [[114.0981, 22.2572]],
    #             "[114.1093, 22.3599]": [[113.9885, 22.3056]],
    #             "[114.2874, 22.3195]": [[114.3849, 22.4192]],
    #             "[114.1838, 22.4427]": [[114.1654, 22.4413]],
    #             "[114.2899, 22.3698]": [[114.2365, 22.4297]],
    #             "[114.0337, 22.2673]": [[114.0897, 22.3651]],
    #             "[114.2631, 22.4254]": [[114.4013, 22.3429]],
    #             "[113.9244, 22.3665]": [[114.0869, 22.2374]],
    #             "[114.0924, 22.2767]": [[114.2252, 22.2265]],
    #             "[114.3249, 22.2441]": [[114.3546, 22.3018]]
    #         },
    #         "deadline_of": {
    #             "[114.1802, 22.2761]": [12, 0],
    #             "[114.1093, 22.3599]": [12, 30],
    #             "[114.2874, 22.3195]": [13, 0],
    #             "[114.1838, 22.4427]": [13, 30],
    #             "[114.2899, 22.3698]": [14, 0],
    #             "[114.0337, 22.2673]": [14, 30],
    #             "[114.2631, 22.4254]": [15, 0],
    #             "[113.9244, 22.3665]": [15, 30],
    #             "[114.0924, 22.2767]": [16, 0],
    #             "[114.3249, 22.2441]": [16, 30]
    #         },
    #         "method": "TS"
    #     }
    # }
    #
    # {
    #     "content": {
    #         "pickup": [
    #             [114.1005, 22.2237],
    #             [114.1291, 22.2874],
    #             [114.3348, 22.3699],
    #             [113.9309, 22.2581],
    #             [114.1896, 22.4426],
    #             [114.2498, 22.3765],
    #             [114.0012, 22.4487],
    #             [114.3557, 22.2864],
    #             [114.1843, 22.2819],
    #             [114.1059, 22.4191],
    #             [114.2704, 22.3517],
    #             [113.9083, 22.4123],
    #             [114.3732, 22.2636],
    #             [113.9821, 22.2856],
    #             [114.0457, 22.3332]
    #         ],
    #         "delivery": [
    #             [114.1723, 22.2328],
    #             [114.0746, 22.2947],
    #             [114.3866, 22.3815],
    #             [113.9133, 22.3092],
    #             [114.2679, 22.3661],
    #             [113.9407, 22.4009],
    #             [113.9864, 22.4582],
    #             [114.2151, 22.2942],
    #             [114.1065, 22.2557],
    #             [114.2167, 22.4471],
    #             [114.3309, 22.3812],
    #             [113.9866, 22.4637],
    #             [114.3769, 22.2829],
    #             [114.0143, 22.2975],
    #             [114.1229, 22.3511]
    #         ],
    #         "current_time": [10, 45],
    #         "pickup_point_of": {
    #             "[114.1723, 22.2328]": [[114.1005, 22.2237]],
    #             "[114.0746, 22.2947]": [[114.1291, 22.2874]],
    #             "[114.3866, 22.3815]": [[114.3348, 22.3699]],
    #             "[113.9133, 22.3092]": [[113.9309, 22.2581]],
    #             "[114.2679, 22.3661]": [[114.1896, 22.4426]],
    #             "[113.9407, 22.4009]": [[114.2498, 22.3765]],
    #             "[113.9864, 22.4582]": [[114.0012, 22.4487]],
    #             "[114.2151, 22.2942]": [[114.3557, 22.2864]],
    #             "[114.1065, 22.2557]": [[114.1843, 22.2819]],
    #             "[114.2167, 22.4471]": [[114.1059, 22.4191]],
    #             "[114.3309, 22.3812]": [[114.2704, 22.3517]],
    #             "[113.9866, 22.4637]": [[113.9083, 22.4123]],
    #             "[114.3769, 22.2829]": [[114.3732, 22.2636]],
    #             "[114.0143, 22.2975]": [[113.9821, 22.2856]],
    #             "[114.1229, 22.3511]": [[114.0457, 22.3332]]
    #         },
    #         "deadline_of": {
    #             "[114.1723, 22.2328]": [12, 0],
    #             "[114.0746, 22.2947]": [12, 30],
    #             "[114.3866, 22.3815]": [13, 0],
    #             "[113.9133, 22.3092]": [13, 30],
    #             "[114.2679, 22.3661]": [14, 0],
    #             "[113.9407, 22.4009]": [14, 30],
    #             "[113.9864, 22.4582]": [15, 0],
    #             "[114.2151, 22.2942]": [15, 30],
    #             "[114.1065, 22.2557]": [16, 0],
    #             "[114.2167, 22.4471]": [23, 59],
    #             "[114.3309, 22.3812]": [23, 59],
    #             "[113.9866, 22.4637]": [23, 59],
    #             "[114.3769, 22.2829]": [23, 59],
    #             "[114.0143, 22.2975]": [23, 59],
    #             "[114.1229, 22.3511]": [23, 59]
    #         },
    #         "method": "TS"
    #     }
    # }
    #
    # {
    #     "pickup": [[114.1541, 22.2817], [114.1779, 22.2753], [114.2317, 22.2646], [114.1859, 22.2775],
    #                [114.2172, 22.2848], [114.1718, 22.2744], [114.1565, 22.2736], [114.2014, 22.2861],
    #                [114.1582, 22.281], [114.23, 22.2872], [114.0316, 22.4636], [114.2671, 22.3794], [113.976, 22.3887],
    #                [114.219, 22.3154], [114.0379, 22.4421], [114.2192, 22.4482], [114.2637, 22.3081],
    #                [114.1168, 22.3752], [114.1018, 22.4375], [114.1595, 22.4488], [114.1709, 22.3238],
    #                [114.1891, 22.3316], [114.1712, 22.3196], [114.1751, 22.3129], [114.1663, 22.3205]],
    #     "delivery": [[114.1689, 22.2731], [114.2179, 22.2829], [114.1732, 22.2763], [114.2157, 22.2869],
    #                  [114.1655, 22.2774], [114.1482, 22.2705], [114.1918, 22.2846], [114.2309, 22.2857],
    #                  [114.1984, 22.2902], [114.1755, 22.2807], [114.21, 22.4168], [114.1171, 22.3729],
    #                  [114.1504, 22.463], [114.2669, 22.3811], [114.0264, 22.4439], [114.1179, 22.3527],
    #                  [114.1616, 22.3218], [114.1962, 22.4032], [113.9733, 22.3895], [113.9887, 22.4412],
    #                  [114.17, 22.3121], [114.1696, 22.3175], [114.1844, 22.3304], [114.1678, 22.3193],
    #                  [114.1608, 22.324]],
    #     "current_time": [9, 49],
    #     "pickup_point_of": {"[114.1689, 22.2731]": [[114.2014, 22.2861]], "[114.2179, 22.2829]": [[114.2014, 22.2861]],
    #                         "[114.1732, 22.2763]": [[114.23, 22.2872]], "[114.2157, 22.2869]": [[113.976, 22.3887]],
    #                         "[114.1655, 22.2774]": [[114.1779, 22.2753]], "[114.1482, 22.2705]": [[114.1859, 22.2775]],
    #                         "[114.1918, 22.2846]": [[114.2172, 22.2848]], "[114.2309, 22.2857]": [[114.1712, 22.3196]],
    #                         "[114.1984, 22.2902]": [[114.1891, 22.3316]], "[114.1755, 22.2807]": [[114.2172, 22.2848]],
    #                         "[114.21, 22.4168]": [[114.2637, 22.3081]], "[114.1171, 22.3729]": [[114.23, 22.2872]],
    #                         "[114.1504, 22.463]": [[114.2172, 22.2848]], "[114.2669, 22.3811]": [[114.2671, 22.3794]],
    #                         "[114.0264, 22.4439]": [[114.1168, 22.3752]], "[114.1179, 22.3527]": [[114.1168, 22.3752]],
    #                         "[114.1616, 22.3218]": [[114.1779, 22.2753]], "[114.1962, 22.4032]": [[114.0379, 22.4421]],
    #                         "[113.9733, 22.3895]": [[114.1565, 22.2736]], "[113.9887, 22.4412]": [[114.1541, 22.2817]],
    #                         "[114.17, 22.3121]": [[114.2192, 22.4482]], "[114.1696, 22.3175]": [[114.1712, 22.3196]],
    #                         "[114.1844, 22.3304]": [[114.1751, 22.3129]], "[114.1678, 22.3193]": [[114.1718, 22.2744]],
    #                         "[114.1608, 22.324]": [[114.0316, 22.4636]]},
    #     "deadline_of": {"[114.1689, 22.2731]": [15, 51], "[114.2179, 22.2829]": [18, 6],
    #                     "[114.1732, 22.2763]": [20, 12], "[114.2157, 22.2869]": [12, 56],
    #                     "[114.1655, 22.2774]": [20, 44], "[114.1482, 22.2705]": [13, 39],
    #                     "[114.1918, 22.2846]": [11, 32], "[114.2309, 22.2857]": [10, 13],
    #                     "[114.1984, 22.2902]": [23, 38], "[114.1755, 22.2807]": [12, 26], "[114.21, 22.4168]": [17, 10],
    #                     "[114.1171, 22.3729]": [23, 1], "[114.1504, 22.463]": [14, 18], "[114.2669, 22.3811]": [11, 54],
    #                     "[114.0264, 22.4439]": [11, 31], "[114.1179, 22.3527]": [13, 37],
    #                     "[114.1616, 22.3218]": [16, 57], "[114.1962, 22.4032]": [17, 2],
    #                     "[113.9733, 22.3895]": [11, 13], "[113.9887, 22.4412]": [23, 28], "[114.17, 22.3121]": [18, 57],
    #                     "[114.1696, 22.3175]": [11, 23], "[114.1844, 22.3304]": [23, 28],
    #                     "[114.1678, 22.3193]": [18, 12], "[114.1608, 22.324]": [16, 2]},
    #     "method": "ACO"
    # }
    body = request.json["content"]
    pickup_points = []
    delivery_points = []
    pickup_point_of = {}
    deadline_of = {}

    for i in body["pickup"]:
        pickup_points.append((i[0], i[1]))

    for i in body["delivery"]:
        delivery_points.append((i[0], i[1]))

    current_time = t(body["current_time"][0], body["current_time"][1])

    temp = body["pickup_point_of"]
    for key in body["pickup_point_of"]:
        for i in temp[key]:
            k = (eval(key)[0], eval(key)[1])
            if not (pickup_point_of.__contains__(k)):
                pickup_point_of[k] = [(i[0], i[1])]
            else:
                pickup_point_of[k].append((i[0], i[1]))

    temp = body["deadline_of"]
    for key in body["deadline_of"]:
        deadline_of[tuple(ast.literal_eval(key))] = [temp[key][0], temp[key][1]] # try to change from deadline to how long away from current time

    if body["method"] == "NN":
        start = time.time()
        dis, optimized_path = NN.NN(pickup_points, delivery_points, current_time, pickup_point_of, deadline_of)
        end = time.time()
        print(end - start)
        return jsonify(dist=dis, route=optimized_path)
    elif body["method"] == "ACO":
        start = time.time()
        dis, optimized_path = ACO.aco(pickup_points, delivery_points, current_time, pickup_point_of, deadline_of)
        end = time.time()
        print(end - start)
        return jsonify(dist=dis, route=optimized_path)
    else:
        start = time.time()
        dis, optimized_path = TS.ts(pickup_points, delivery_points, current_time, pickup_point_of, deadline_of)
        end = time.time()
        print(end - start)
        return jsonify(dist=dis, route=optimized_path)


def process_request_body(body):
    # Process the request body as needed
    # Example: Print the body and return a response
    print(body)
    return 'Request body received'


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

@app.errorhandler(500)
def server_error(e):
    logging.exception('An error occurred during a request. %s', e)
    return "An internal error occurred", 500


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=1234, debug=True)
