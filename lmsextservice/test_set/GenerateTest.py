import random


class Package:
    def __init__(self, bottom_left_x, bottom_left_y, bottom_left_z, top_right_x, top_right_y, top_right_z):
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
        return f"Package: (Top-Right: ({self.top_right_x}, {self.top_right_y}, {self.top_right_z}), " \
               f"Bottom-Left: ({self.bottom_left_x}, {self.bottom_left_y}, {self.bottom_left_z}))" \
               f"(l, w, h): ({self.compute_length()}, {self.compute_width()}, {self.compute_height()}))"


def cutting_stock(number_of_loops, initial_l, initial_w, initial_h):
    packages = [Package(0, 0, 0, initial_l, initial_w, initial_h)]
    for i in range(number_of_loops):
        initial_box = packages[random.randint(0, len(packages) - 1)]
        packages.remove(initial_box)

        selected_l = random.randint(initial_box.bottom_left_x, initial_box.top_right_x)
        selected_w = random.randint(initial_box.bottom_left_y, initial_box.top_right_y)
        selected_h = random.randint(initial_box.bottom_left_z, initial_box.top_right_z)

        package_1 = Package(initial_box.bottom_left_x, initial_box.bottom_left_y, initial_box.bottom_left_z, selected_l, selected_w, selected_h)
        package_2 = Package(selected_l, initial_box.bottom_left_y, initial_box.bottom_left_z, initial_box.top_right_x, selected_w, selected_h)
        package_3 = Package(selected_l, selected_w, initial_box.bottom_left_z, initial_box.top_right_x, initial_box.top_right_y, selected_h)
        package_4 = Package(initial_box.bottom_left_x, selected_w, initial_box.bottom_left_z, selected_l, initial_box.top_right_y, selected_h)
        package_5 = Package(initial_box.bottom_left_x, initial_box.bottom_left_y, selected_h, selected_l, selected_w, initial_box.top_right_z)
        package_6 = Package(selected_l, initial_box.bottom_left_y, selected_h, initial_box.top_right_x, selected_w, initial_box.top_right_z)
        package_7 = Package(selected_l, selected_w, selected_h, initial_box.top_right_x, initial_box.top_right_y, initial_box.top_right_z)
        package_8 = Package(initial_box.bottom_left_x, selected_w, selected_h, selected_l, initial_box.top_right_y, initial_box.top_right_z)

        packages.append(package_1)
        packages.append(package_2)
        packages.append(package_3)
        packages.append(package_4)
        packages.append(package_5)
        packages.append(package_6)
        packages.append(package_7)
        packages.append(package_8)
    return packages


res = cutting_stock(2, 100, 100, 100)
sum = 0
print(len(res))
for p in res:
    sum += p.compute_length() * p.compute_width() * p.compute_height()
    print(p)
print(sum)
