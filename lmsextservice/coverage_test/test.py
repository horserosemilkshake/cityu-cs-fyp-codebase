import csv
import random
import uuid

import numpy as np
from matplotlib import pyplot as plt
from mpl_toolkits.mplot3d import proj3d


class Package:
    def __init__(self, bottom_left_x, bottom_left_y, bottom_left_z, top_right_x, top_right_y, top_right_z):
        self.package_id = str(uuid.uuid4()).split("-")[0]
        self._top_right_x = top_right_x
        self._top_right_y = top_right_y
        self._top_right_z = top_right_z
        self._bottom_left_x = bottom_left_x
        self._bottom_left_y = bottom_left_y
        self._bottom_left_z = bottom_left_z

    @property
    def top_right_x(self):
        return self._top_right_x

    @top_right_x.setter
    def top_right_x(self, value):
        self._top_right_x = value

    @property
    def top_right_y(self):
        return self._top_right_y

    @top_right_y.setter
    def top_right_y(self, value):
        self._top_right_y = value

    @property
    def top_right_z(self):
        return self._top_right_z

    @top_right_z.setter
    def top_right_z(self, value):
        self._top_right_z = value

    @property
    def bottom_left_x(self):
        return self._bottom_left_x

    @bottom_left_x.setter
    def bottom_left_x(self, value):
        self._bottom_left_x = value

    @property
    def bottom_left_y(self):
        return self._bottom_left_y

    @bottom_left_y.setter
    def bottom_left_y(self, value):
        self._bottom_left_y = value

    @property
    def bottom_left_z(self):
        return self._bottom_left_z

    @bottom_left_z.setter
    def bottom_left_z(self, value):
        self._bottom_left_z = value

    def compute_length(self):
        return abs(self.top_right_x - self.bottom_left_x)

    def compute_width(self):
        return abs(self.top_right_y - self.bottom_left_y)

    def compute_height(self):
        return abs(self.top_right_z - self.bottom_left_z)

    def __str__(self):
        return f"Package {self.package_id}: (Top-Right: ({self.top_right_x}, {self.top_right_y}, {self.top_right_z}), " \
               f"Bottom-Left: ({self.bottom_left_x}, {self.bottom_left_y}, {self.bottom_left_z}))" \
               f"(l, w, h): ({self.compute_length()}, {self.compute_width()}, {self.compute_height()}))"

    def output_to_csv(self):
        return [self.package_id, self.compute_length(), self.compute_width(), self.compute_height()]

    def output_solution_to_csv(self):
        return [self.package_id, self.bottom_left_x, self.bottom_left_y, self._bottom_left_z, self.compute_length(),
                self.compute_width(), self.compute_height()]


def cutting_stock(number_of_loops, initial_l, initial_w, initial_h):
    packages = [Package(0, 0, 0, initial_l, initial_w, initial_h)]
    for i in range(number_of_loops):
        initial_box = packages[random.randint(0, len(packages) - 1)]
        packages.remove(initial_box)

        selected_l = random.randint(initial_box.bottom_left_x, initial_box.top_right_x)
        selected_w = random.randint(initial_box.bottom_left_y, initial_box.top_right_y)
        selected_h = random.randint(initial_box.bottom_left_z, initial_box.top_right_z)

        package_1 = Package(initial_box.bottom_left_x, initial_box.bottom_left_y, initial_box.bottom_left_z, selected_l,
                            selected_w, selected_h)
        package_2 = Package(selected_l, initial_box.bottom_left_y, initial_box.bottom_left_z, initial_box.top_right_x,
                            selected_w, selected_h)
        package_3 = Package(selected_l, selected_w, initial_box.bottom_left_z, initial_box.top_right_x,
                            initial_box.top_right_y, selected_h)
        package_4 = Package(initial_box.bottom_left_x, selected_w, initial_box.bottom_left_z, selected_l,
                            initial_box.top_right_y, selected_h)
        package_5 = Package(initial_box.bottom_left_x, initial_box.bottom_left_y, selected_h, selected_l, selected_w,
                            initial_box.top_right_z)
        package_6 = Package(selected_l, initial_box.bottom_left_y, selected_h, initial_box.top_right_x, selected_w,
                            initial_box.top_right_z)
        package_7 = Package(selected_l, selected_w, selected_h, initial_box.top_right_x, initial_box.top_right_y,
                            initial_box.top_right_z)
        package_8 = Package(initial_box.bottom_left_x, selected_w, selected_h, selected_l, initial_box.top_right_y,
                            initial_box.top_right_z)

        packages.append(package_1)
        packages.append(package_2)
        packages.append(package_3)
        packages.append(package_4)
        packages.append(package_5)
        packages.append(package_6)
        packages.append(package_7)
        packages.append(package_8)
    return packages


def visualize_packages(packages, filename=None):
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')

    colors = []
    for i in packages:
        colors.append((random.random(), random.random(), random.random()))

    handles = []  # To store the handles for the legend
    labels = []  # To store the labels for the legend

    for i, package in enumerate(packages):
        length = package.compute_length()
        width = package.compute_width()
        height = package.compute_height()

        bottom_left_x = package.bottom_left_x
        bottom_left_y = package.bottom_left_y
        bottom_left_z = package.bottom_left_z

        # Plot the package as a cuboid
        foo_face = plt.Rectangle((0, 0), 1, 1, fc=colors[i])
        bar = ax.bar3d(bottom_left_x, bottom_left_y, bottom_left_z, length, width, height, color=colors[i] + (0.1,), edgecolor=colors[i] + (1,))

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


container_length = 512
container_width = 76
container_height = 67
loop = 14
res = cutting_stock(loop, container_length, container_width, container_height)
sum = 0
print(len(res))
visualize_packages(res, "img")
for p in res:
    sum += p.compute_length() * p.compute_width() * p.compute_height()
    print(p)
print(sum)

header = ['package_id', 'length', 'width', 'height', 'container_length', 'container_width', 'container_height']
with open("test_set/3d_bpp_integer_guillotine_test_case_{0}.csv".format(loop), 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow([len(res)])
    writer.writerow(header)
    for p in res:
        writer.writerow(p.output_to_csv() + [container_length, container_width, container_height])

with open("test_set/3d_bpp_integer_guillotine_test_case_{0}_answer.csv".format(loop), 'w', encoding='UTF8',
          newline='') as f:
    writer = csv.writer(f)
    writer.writerow([len(res)])
    writer.writerow(['package_id', 'bottom_left_x', 'bottom_left_y', 'bottom_left_z', 'length', 'width', 'height',
                     'container_length', 'container_width', 'container_height'])
    for p in res:
        writer.writerow(p.output_solution_to_csv() + [container_length, container_width, container_height])
