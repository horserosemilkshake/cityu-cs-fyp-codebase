import numpy as np
import argparse
import imutils
import cv2
from scipy.spatial import distance as dist
from imutils import contours, perspective


def midpoint(_, __):
    return (_[0] + __[0]) * 0.5, (_[1] + __[1]) * 0.5


class ObjectMeasurement:
    def __init__(self, image_path, reference_width, name=None):
        self.image_path = image_path
        self.reference_width = reference_width
        self.name = name
        self.pixels_per_metric = None

    def measure_objects(self):
        image = cv2.imread(self.image_path)
        image = cv2.resize(image, dsize=None, fx=0.25, fy=0.25, interpolation=cv2.INTER_LINEAR)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (7, 7), 0)
        edged = cv2.Canny(gray, 50, 100)
        edged = cv2.dilate(edged, None, iterations=1)
        edged = cv2.erode(edged, None, iterations=1)
        contour_set = cv2.findContours(edged.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contour_set = imutils.grab_contours(contour_set)
        (contour_set, _) = contours.sort_contours(contour_set, "right-to-left")
        self.pixels_per_metric = None

        dimA = 0
        dimB = 0

        i = -1
        print(len(contour_set))
        output_file = ""
        for c in contour_set:
            i += 1
            if cv2.contourArea(c) < 500:
                continue
            orig = image.copy()
            box = cv2.minAreaRect(c)
            box = cv2.boxPoints(box) if imutils.is_cv2() else cv2.boxPoints(box)
            box = np.array(box, dtype="int")
            box = perspective.order_points(box)
            cv2.drawContours(orig, [box.astype("int")], -1, (0, 255, 0), 2)

            for (x, y) in box:
                cv2.circle(orig, (int(x), int(y)), 5, (0, 0, 255), -1)

            (tl, tr, br, bl) = box
            (tltrX, tltrY) = midpoint(tl, tr)
            (blbrX, blbrY) = midpoint(bl, br)
            (tlblX, tlblY) = midpoint(tl, bl)
            (trbrX, trbrY) = midpoint(tr, br)

            dA = dist.euclidean((tltrX, tltrY), (blbrX, blbrY))
            dB = dist.euclidean((tlblX, tlblY), (trbrX, trbrY))

            if self.pixels_per_metric is None:
                self.pixels_per_metric = dB / self.reference_width

            dimA = dA / self.pixels_per_metric
            dimB = dB / self.pixels_per_metric
            dimA, dimB = dimB, dimA

            if i == len(contour_set) - 1:
                cv2.putText(orig, "{:.1f}cm".format(dimA),
                            (int(tltrX - 15), int(tltrY - 10)), cv2.FONT_HERSHEY_SIMPLEX,
                            0.65, (255, 255, 255), 2)
                cv2.putText(orig, "{:.1f}cm".format(dimB),
                            (int(trbrX + 10), int(trbrY)), cv2.FONT_HERSHEY_SIMPLEX,
                            0.65, (255, 255, 255), 2)

                cv2.imshow("Measurement Result", orig)
            output_file = "size_detection_output/" + self.name + ".jpg"
            cv2.imwrite(output_file, orig)

        print(dimA)
        print(dimB)
        return output_file, dimA, dimB


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("-i1", "--image1", required=True, help="path to the input image 1")
    ap.add_argument("-i2", "--image2", required=True, help="path to the input image 2")
    ap.add_argument("-w", "--width", type=float, required=True, help="width of the right-most object in the image (in "
                                                                     "cm)")
    args = vars(ap.parse_args())

    measurement = ObjectMeasurement(args["image1"], args["width"], "image1")
    measurement.measure_objects()

    measurement = ObjectMeasurement(args["image2"], args["width"], "image2")
    measurement.measure_objects()
