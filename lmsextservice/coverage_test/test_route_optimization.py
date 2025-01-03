import csv
import random
from datetime import time as t, timedelta, datetime, date

import numpy as np

filename = "test_set/locations.csv"  # Replace with the actual filename

# Create empty lists to store the parsed data
names = []
latitudes = []
longitudes = []

# Open the CSV file and read its contents
with open(filename, "r") as file:
    reader = csv.reader(file)
    next(reader)  # Skip the header row
    for row in reader:
        # Extract the data from each row
        name = row[0]
        longitude = float(row[1])
        latitude = float(row[2])

        # Append the data to the respective lists
        names.append(name)
        latitudes.append(latitude)
        longitudes.append(longitude)

# Print the parsed data
coords = []
for i in range(len(names)):
    coords.append([longitudes[i], latitudes[i]])
    print("Name:", names[i])
    print("Latitude:", latitudes[i])
    print("Longitude:", longitudes[i])

pickup = coords[:len(coords) // 2]
delivery = coords[len(coords) // 2:]
pickup_point_of = {}
current_time = [datetime.today().hour, datetime.today().minute]
deadline_of = {}
for i in delivery:
    if not(pickup_point_of.__contains__(str(i))):
        pickup_point_of[str(i)] = [pickup[random.randint(0, len(pickup) - 1)]]
    else:
        pickup_point_of[str(i)].append(pickup[random.randint(0, len(pickup) - 1)])
    deadline_of[str(i)] = [np.random.randint(current_time[0] + 1, 24), np.random.randint(0, 60)]

print(pickup)
print(delivery)
print(current_time)
print(pickup_point_of.__str__().replace("'", "\""))
print(deadline_of)
