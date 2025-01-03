import random
from math import ceil

import numpy
import numpy as np
import copy
import sys

import uuid

from flask import send_file
from matplotlib import pyplot as plt

from packing_scheme.Package import Package
from Parser import parse_csv


def visualize_packages(packages, areas=None, filename=None, container=None):
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')

    colors = []
    for i in packages:
        colors.append((random.random(), random.random(), random.random()))

    handles = []  # To store the handles for the legend
    labels = []  # To store the labels for the legend

    if areas is not None:
        for area in areas:
            ax.bar3d(area[1], area[0], 0, area[2], area[3], 0, color='r',
                     edgecolor='g')
        # ax.bar3d(area2[1], area2[0], 0, area2[2], area2[3], 0, color='r',
        #          edgecolor='g')

    max_l, max_w, max_h = container
    ax.bar3d(0, 0, 0, max_l, max_w, max_h, color=colors[0] + (0.1,),
             edgecolor='b')

    for i, package in enumerate(packages):
        length = package.compute_length()
        width = package.compute_width()
        height = package.compute_height()

        bottom_left_x = package.bottom_left_x
        bottom_left_y = package.bottom_left_y
        bottom_left_z = package.bottom_left_z

        # Plot the package as a cuboid
        foo_face = plt.Rectangle((0, 0), 1, 1, fc=colors[i])
        bar = ax.bar3d(bottom_left_x, bottom_left_y, bottom_left_z, length, width, height, color=colors[i] + (1,),
                       edgecolor='g')

        center_x = bottom_left_x + length / 2
        center_y = bottom_left_y + width / 2
        center_z = bottom_left_z + height / 2

        # Add package label on the top face
        label = f'{i + 1}'
        ax.text(center_x, center_y, center_z, label, color='k', ha='center', va='center', rotation='vertical')

        handles.append(foo_face)
        labels.append(f'{package.package_id}')

    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')

    ax.legend(handles, labels, loc='upper right', prop={'size': 3})

    if filename:
        plt.savefig(filename, dpi=300, bbox_inches='tight')  # Save the plot as a PNG file
    else:
        plt.show()


def parse_and_visualize(arrangement, areas):
    res = []
    used_space = 0
    for pair in arrangement:
        accumulated_height = 0
        for package in pair[1]:
            pos = Package(pair[0][0],
                          pair[0][1],
                          accumulated_height,
                          pair[0][0] + package["size"][0],
                          pair[0][1] + package["size"][1],
                          accumulated_height + package["size"][2])
            used_space += package["size"][0] * package["size"][1] * package["size"][2]
            accumulated_height += package["size"][2]
            res.append(pos)

    visualize_packages(res, areas)


def init_box(l, w, h):
    return np.zeros((l, w, h), dtype=int)


def modify_space(box, pos, l, w, h):
    x, y, z = pos[0], pos[1], pos[2]
    box[x:x + l, y:y + w, z:z + h] = 1


def judge_item(box, pos, l, w, h):
    max_l, max_w, max_h = box.shape  # box param
    x, y, z = pos[0], pos[1], pos[2]  # current arrangement position

    if l + x > max_l or w + y > max_w or z + 1 > max_h:
        return False, 0

    for i in range(x, x + l):  # exceed container length or width -> fail
        for j in range(y, y + w):
            if box[i, j, z]:
                return False, 0

    min_h = z
    for k in range(z - 1, -1, -1):  # find max height
        flag = True
        for i in range(x, x + l):
            for j in range(y, y + w):
                if box[i, j, k]:
                    flag = False
                    break
            if not flag:
                break
        if not flag:
            break
        min_h -= 1

    if min_h + h > max_h:
        return False, z - min_h

    for k in range(1, h - z + min_h):
        for i in range(x, x + l):
            for j in range(y, y + w):
                if box[i, j, z + k]:
                    return False, z - min_h

    return True, z - min_h


def pack_item_into_box_dblf(list_item, box_para, seq, visual=None, username=""):
    packages = []

    max_l, max_w, max_h = box_para['dimensions']
    box = init_box(max_l, max_w, max_h)
    pos_list = [[0, 0, 0]]
    info = []

    total_space = max_w * max_l * max_h
    used_space = 0

    dir_list = [(0, 1, 2), (0, 2, 1), (1, 0, 2), (1, 2, 0), (2, 0, 1), (2, 1, 0)]

    for i in range(len(list_item)):
        pos_list.sort(key=lambda x: (x[2], x[1], x[0]))
        item = list_item[seq[i][0]]
        seq_dir = seq[i][1]
        l, w, h = (item['size'][dir_list[seq_dir][0]]), (item['size'][dir_list[seq_dir][1]]), (item['size'][
            dir_list[seq_dir][2]])
        if l > max_l or w > max_w or h > max_h or (used_space + l * w * h) > total_space:
            continue
        for index, pos in enumerate(pos_list):
            flag, min_h = judge_item(box, pos, l, w, h)
            if flag:
                new_pos = [pos[0], pos[1], pos[2] - min_h]
                modify_space(box, new_pos, l, w, h)
                info.append("{}-shape({}, {}, {})-location:{}".format(item['id'], l, w, h, new_pos))
                packages.append(
                    Package(new_pos[0], new_pos[1], new_pos[2], new_pos[0] + l, new_pos[1] + w, new_pos[2] + h))
                pos_list.pop(index)

                pos_list.append([new_pos[0] + l, new_pos[1], new_pos[2]])
                pos_list.append([new_pos[0], new_pos[1] + w, new_pos[2]])
                pos_list.append([new_pos[0], new_pos[1], new_pos[2] + h])

                used_space += l * w * h
                break

    if visual is not None:
        visualize_packages(packages, None, "output/DBLF" + username + ".jpg", box_para['dimensions'])

    space_ratio = used_space / total_space

    if visual is None:
        return space_ratio, info

    return space_ratio, info, send_file("output/" + "DBLF" + username + ".jpg")


def init_ethnic(list_item, ethnic_num):
    count = len(list_item)
    ethnic_list = []
    seq_id = list(range(count))
    for i in range(ethnic_num):
        random.shuffle(seq_id)
        seq_dir = [random.randint(0, 5) for j in range(count)]
        ethnic_list.append([(seq_id[j], seq_dir[j]) for j in range(count)])
    return ethnic_list


if __name__ == "__main__":
    box, items = parse_csv("test_set/3d_bpp_integer_guillotine_test_case_1.csv")
    print(pack_item_into_box_dblf(items, box, init_ethnic(items, 20)[0]), True)

    # item_list = []
    # lis_num = 4
    # for k in range(lis_num):
    #     item_list = []
    #     for i in range(len(item_info[k])):
    #         for j in range(item_info[k][i]['count']):
    #             item_list.append(copy.deepcopy(item_info[k][i]))
    #     print("k={0}".format(k))
    #     # print('E{0}-{1}：'.format(int(k / 5 + 1), (k % 5 + 1)))
    #     # print(ethnic_reproduction(item_list, box, 20, 0.7, 0.05, 1))
    #     print(pack_item_into_box_dblf(item_list, box, init_ethnic(item_list, 20)[0]))
