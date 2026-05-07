import os

class Config:
    MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017/?replicaSet=rs0")
    DB_NAME = os.getenv("DB_NAME", "iot_city")
    RAW_COLLECTION = os.getenv("RAW_COLLECTION", "raw_sensor_data")
    KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "iot-sensors-topic")
    KAFKA_SERVER = os.getenv("KAFKA_SERVER", "kafka_broker:29092")
