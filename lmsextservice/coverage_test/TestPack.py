from packing_scheme.DBLF import pack_item_into_box_dblf, init_ethnic
from Parser import parse_csv

import time

from packing_scheme.SBBT import stack_based_binary_tree


def test_dblf_and_sbbt():
    for i in range(1, 14):
        test_file = "../test_set/3d_bpp_integer_guillotine_test_case_{0}.csv".format(i)
        box, items = parse_csv(test_file)

        start_time = time.time()
        space_ratio, info = pack_item_into_box_dblf(items, box, init_ethnic(items, 20)[0])
        end_time = time.time()
        print("DBLF Test {0}: Time - {1}, Space Usage: {2} %".format(i, str(end_time - start_time), space_ratio * 100))

        box, items = parse_csv(test_file)
        start_time = time.time()
        space_ratio, info = stack_based_binary_tree(items, box)
        end_time = time.time()
        print("SBBT Test {0}: Time - {1}, Space Usage: {2} %".format(i, str(end_time - start_time), space_ratio * 100))

        box, items = parse_csv(test_file)
        start_time = time.time()
        space_ratio, info = stack_based_binary_tree(items, box, single_stack=True)
        end_time = time.time()
        print("Single Stack Test {0}: Time - {1}, Space Usage: {2} %".format(i, str(end_time - start_time), space_ratio * 100))


if __name__ == "__main__":
    test_dblf_and_sbbt()
