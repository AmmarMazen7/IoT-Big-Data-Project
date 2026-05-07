import json
import time
import logging
from kafka import KafkaProducer, errors
from config import Config

class KafkaPublisher:
    def __init__(self):
        self.producer = self._connect()

    def _connect(self):
        while True:
            try:
                producer = KafkaProducer(
                    bootstrap_servers=[Config.KAFKA_SERVER],
                    value_serializer=lambda v: json.dumps(v).encode('utf-8')
                )
                logging.info("INFO: Successfully connected to Kafka.")
                return producer
            except errors.NoBrokersAvailable:
                logging.warning("WARNING: Kafka not available, retrying in 5 seconds...")
                time.sleep(5)

    def publish(self, data):
        try:
            self.producer.send(Config.KAFKA_TOPIC, data)
        except Exception as e:
            logging.error(f"ERROR: Failed to send data to Kafka: {e}")
