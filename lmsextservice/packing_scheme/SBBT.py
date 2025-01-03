import csv
from random import random

import numpy as np
from flask import send_file

from packing_scheme.Package import Package

import random

from matplotlib import pyplot as plt

from Parser import parse_csv


def init_box(l, w, h):
    return np.zeros((l, w, h), dtype=np.int64)


def visualize_packages(packages, areas=None, filename=None, box_para=None):
    max_l, max_w, max_h = box_para

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
        bar = ax.bar3d(bottom_left_y, bottom_left_x, bottom_left_z, length, width, height, color=colors[i] + (0.8,),
                       edgecolor='g')

        # center_x = bottom_left_x + length / 2
        # center_y = bottom_left_y + width / 2
        # center_z = bottom_left_z + height / 2
        #
        # # Add package label on the top face
        # label = f'{i + 1}'
        # ax.text(center_x, center_y, center_z, label, color='k', ha='center', va='center', rotation='vertical')

        handles.append(foo_face)
        labels.append(f'{package.package_id}')

    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')

    ax.legend(handles, labels, loc='upper right', prop={'size': 3})

    if filename:
        plt.savefig("output/" + filename, dpi=300, bbox_inches='tight')  # Save the plot as a PNG file
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


def stack_based_binary_tree(list_item, box_para, visual=None, username="", single_stack=False):  # base area
    max_l, max_w, max_h = box_para['dimensions']
    pos_list = [[0, 0, 0]]
    info = []

    total_space = max_w * max_l * max_h
    used_space = 0

    list_item = sorted(list_item, key=lambda tmp: tmp["size"][0] * tmp["size"][1],
                       reverse=False)  # sort by base size, could be tuned to true
    list_of_stacks = []
    stack = []
    for itm in list_item:
        itm["size"].sort(reverse=True)
        while sum(p["size"][2] for p in stack) <= max_h:
            if sum(p["size"][2] for p in stack) + itm["size"][2] > max_h \
                    or (len(stack) != 0 and (
                    stack[-1]["size"][0] < itm["size"][0] or stack[-1]["size"][1] < itm["size"][1])):
                list_of_stacks.append(stack.copy())
                stack = []
            if itm["count"] == 0:
                if list_item[len(list_item) - 1] is itm:
                    list_of_stacks.append(stack.copy())
                break
            else:
                stack.append({"id": itm["id"], "size": itm["size"], "count": 1})
                itm["count"] -= 1

    if single_stack:
        highest_stack = []
        for i in list_of_stacks:
            if sum([item['size'][2] for item in i]) > sum([item['size'][2] for item in highest_stack]):
                highest_stack = i
        list_of_stacks = [highest_stack.copy()]
    else:
        list_of_stacks.sort(key=lambda tmp: sum([item['size'][0] * item['size'][1] * item['size'][2] for item in tmp]), reverse=True)

    placeable_corner = [(0, 0, max_l, max_w)]  # l-cord, r-cord, remaining_l, remaining_w
    arrangement = []

    for stack in list_of_stacks:
        if not stack:
            continue
        base_area = (stack[0]['size'][0], stack[0]['size'][1])
        if len(placeable_corner) == 1:
            selected = placeable_corner[0]
        else:
            selected = None
            for option in placeable_corner:
                # if (option[2] >= base_area[0] and option[3] >= base_area[1]) or (
                #         option[2] >= base_area[1] and option[3] >= base_area[0]):
                #     selected = option
                # if selected is not None and option[2] > selected[2] and option[3] > selected[3]:
                #     selected = option

                # length = option[2] - option[0]
                # width = option[3] - option[1]
                # if (length >= base_area[0] and width >= base_area[1]) or (width >= base_area[0] and length >= base_area[1]):
                #     selected = option
                # if selected is not None and option[2] > selected[2] and option[3] > selected[3]:
                #     selected = option

                length = option[2] - option[0]
                width = option[3] - option[1]
                if length * width >= base_area[0] * base_area[1]:
                    selected = option
                if selected is not None and length * width >= (selected[2] - selected[0]) * (selected[3] - selected[1]) :
                    selected = option

# or selected[2] < base_area[0] or selected[3] < base_area[1]
        if selected is None:
            continue

        placeable_corner.remove(selected)
        arrangement.append([selected, stack])
        area1 = (selected[0],
                 selected[1] + base_area[0],
                 selected[2] - base_area[0],
                 selected[3])
        placeable_corner.append(area1)
        area2 = (selected[0] + base_area[1],
                 selected[1],
                 base_area[0],
                 selected[3] - base_area[1])
        placeable_corner.append(area2)

        #parse_and_visualize(arrangement, [area1, area2])

    res = []
    return_list = []
    used_space = 0
    for pair in arrangement:
        accumulated_height = 0
        for package in pair[1]:
            pos = Package(pair[0][0],
                          pair[0][1],
                          accumulated_height,
                          pair[0][0] + package["size"][0],
                          pair[0][1] + package["size"][1],
                          accumulated_height + package["size"][2], package["id"])
            used_space += package["size"][0] * package["size"][1] * package["size"][2]
            accumulated_height += package["size"][2]
            res.append(pos)
            return_list.append(package["id"])

    # for individual in res:
    #     print(individual)
    #
    # print(used_space / (max_l * max_w * max_h))
    max_l, max_w, max_h = box_para['dimensions']
    if visual is not None:
        visualize_packages(res, None, "SBBT" + username + ".jpg", box_para['dimensions'])
    else:
        return used_space / (max_l * max_w * max_h), return_list

    return used_space / (max_l * max_w * max_h), return_list, send_file("output/" + "SBBT" + username + ".jpg")


if __name__ == "__main__":
    box, items = {'dimensions': [512, 76, 67]}, [{'id': '869318d2-4673-4a73-8967-4c761c7cd561', 'size': [22, 3, 18], 'count': 1}, {'id': 'p2p002', 'size': [25, 17, 2], 'count': 1}]
    print(box)
    print(items)
    space_utility, res = stack_based_binary_tree(items, box, True, username="", single_stack=True)
    print(res)
