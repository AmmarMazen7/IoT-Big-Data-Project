import random
from datetime import datetime

SENSOR_TYPES = ["traffic", "temperature", "aqi"]
SENSOR_ZONES = ["North", "South", "East", "West", "Downtown"]

import math
import time

def generate_sensor_data():
    zone = random.choice(SENSOR_ZONES)
    sensor_type = random.choice(SENSOR_TYPES)
    
    # 1. Base Values
    if sensor_type == "traffic":
        base = random.randint(10, 100)
    elif sensor_type == "temperature":
        base = random.uniform(15.0, 25.0)
    else: # aqi
        base = random.randint(20, 80)

    # 2. Zone Biases (Make zones statistically different)
    zone_biases = {
        "North": {"temperature": -5.0, "traffic": -10, "aqi": -10},
        "South": {"temperature": 8.0, "traffic": 10, "aqi": 10},
        "Downtown": {"temperature": 3.0, "traffic": 60, "aqi": 40},
        "East": {"temperature": -2.0, "traffic": -20, "aqi": -15},
        "West": {"temperature": 1.0, "traffic": 20, "aqi": 50}, # Industrial zone
    }
    
    base += zone_biases[zone][sensor_type]

    # 3. Time-based "Daily Cycle" (Fluctuates every few minutes using a Sine wave)
    time_factor = math.sin(time.time() / 120.0) # 4-minute cycle
    if sensor_type == "temperature":
        base += time_factor * 8.0 # Temp fluctuates by +/- 8 degrees
    elif sensor_type == "traffic":
        base += time_factor * 40 # Traffic fluctuates heavily
    
    # 4. Random Anomalies (Spikes)
    if random.random() > 0.95:
        if sensor_type == "traffic": base += 150
        elif sensor_type == "aqi": base += 200
        elif sensor_type == "temperature": base += 12.0

    # Ensure no negative values where impossible
    if sensor_type in ["traffic", "aqi"]:
        value = max(0, int(base))
    else:
        value = round(base, 1)

    return {
        "sensor_id": f"{sensor_type[:3]}-{zone.lower()}-{random.randint(1, 5)}",
        "type": sensor_type,
        "zone": zone,
        "value": value,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
