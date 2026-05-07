import time
import json
import logging
from kafka import KafkaConsumer, errors
from config import Config
from database.mongo_repo import MongoRepository

logging.basicConfig(
    format='%(asctime)s %(levelname)s: %(message)s',
    level=logging.INFO
)

def main():
    logging.info("INFO: Data Ingestion Service started.")
    repo = MongoRepository()
    
    retry_delay_seconds = 5
    consumer = None
    while True:
        try:
            consumer = KafkaConsumer(
                Config.KAFKA_TOPIC,
                bootstrap_servers=[Config.KAFKA_SERVER],
                value_deserializer=lambda m: json.loads(m.decode('utf-8'))
            )
            logging.info("INFO: Successfully connected to Kafka consumer.")
            break
        except errors.NoBrokersAvailable:
            logging.warning(f"WARNING: Kafka broker not available for consumer, retrying in {retry_delay_seconds} seconds...")
            time.sleep(retry_delay_seconds)
        except Exception as e:
            logging.error(f"ERROR: An unexpected error occurred during Kafka consumer connection: {e}. Exiting.")
            exit(1)

    logging.info("INFO: Starting to consume messages from Kafka...")

    for message in consumer:
        sensor_data = message.value
        logging.info(f"INFO: Received Kafka message for Sensor: {sensor_data.get('sensor_id')} type {sensor_data.get('type')}")
        repo.insert_sensor_data(sensor_data)

if __name__ == "__main__":
    main()
