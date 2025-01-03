import csv


def parse_csv(filename):
    container_dimensions = []
    package_data = []

    with open(filename, 'r') as file:
        csv_reader = csv.reader(file)
        header = next(csv_reader)  # Read the header row
        header = next(csv_reader)
        header = next(csv_reader)

        # Extract container dimensions from the first row
        container_dimensions = {"dimensions": [int(dim) for dim in header[4:]]}

        # Initialize a dictionary to store package counts
        package_counts = {}

        for row in csv_reader:
            package_id = row[0]
            package_dimensions = [int(dim) for dim in row[1:4]]

            # Check if package dimensions already exist in the dictionary
            package_key = tuple(package_dimensions)
            if package_key in package_counts:
                package_counts[package_key]['count'] += 1
            else:
                package_counts[package_key] = {
                    'id': package_id,
                    'size': package_dimensions,
                    'count': 1
                }

    # Convert the package counts dictionary to a list
    package_data = list(package_counts.values())

    return container_dimensions, package_data
