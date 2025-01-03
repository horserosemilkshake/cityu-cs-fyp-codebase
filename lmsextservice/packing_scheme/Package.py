import uuid


class Package:
    def __init__(self, bottom_left_x, bottom_left_y, bottom_left_z, top_right_x, top_right_y, top_right_z,
                 package_id=None):
        self.package_id = str(uuid.uuid4()).split("-")[0] if package_id is None else package_id
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
