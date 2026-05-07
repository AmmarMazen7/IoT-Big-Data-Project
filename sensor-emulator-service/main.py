import time
import random
import logging
from config import Config
from generators.sensor_data import generate_sensor_data
from kafka_publisher import KafkaPublisher

logging.basicConfig(
    format='%(asctime)s %(levelname)s: %(message)s',
    level=logging.INFO
)

def main():
    logging.info("INFO: Sensor Emulator Service started.")
    publisher = KafkaPublisher()
    
    logging.info(f"INFO: Starting to generate simulated IoT data to topic '{Config.KAFKA_TOPIC}'.")
    
    while True:
        # Generate a batch of events
        batch_size = random.randint(5, 15)
        for _ in range(batch_size):
            data = generate_sensor_data()
            publisher.publish(data)
                
        logging.info(f"INFO: Sent {batch_size} sensor events to Kafka.")
        # Wait a bit before next batch to simulate continuous flow (e.g. 2-5 seconds)
        time.sleep(random.uniform(2.0, 5.0))

if __name__ == "__main__":
    main()
