import os

class Config:
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'your_strong_secret_key')
    MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017")
    DB_NAME = os.getenv("DB_NAME", "iot_city")
    ANALYTICS_COLLECTION = os.getenv("COLLECTION", "sensor_analytics")
    RAW_COLLECTION = os.getenv("RAW_COLLECTION", "raw_sensor_data")
    KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka_broker:29092")
    KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "iot-sensors-topic")
