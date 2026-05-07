import os

class Config:
    KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "iot-sensors-topic")
    KAFKA_SERVER = os.getenv("KAFKA_SERVER", "kafka_broker:29092")
