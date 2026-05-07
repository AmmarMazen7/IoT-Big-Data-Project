import eventlet
import logging
import json
from confluent_kafka import Consumer, KafkaError
from config import Config
from utils import sanitize_document

def consume_kafka_messages(socketio):
    logging.info(f"Starting Kafka consumer for topic {Config.KAFKA_TOPIC}...")
    conf = {
        'bootstrap.servers': Config.KAFKA_BROKER,
        'group.id': 'realtime_gateway_group',
        'auto.offset.reset': 'latest'
    }
    consumer = Consumer(conf)
    
    try:
        consumer.subscribe([Config.KAFKA_TOPIC])
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                eventlet.sleep(0)
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    eventlet.sleep(0)
                    continue
                else:
                    logging.error(f"Kafka error: {msg.error()}")
                    break
            
            sensor_data = json.loads(msg.value().decode('utf-8'))
            logging.debug(f"Received Kafka message for sensor: {sensor_data.get('sensor_id')}")
            
            if '_id' in sensor_data:
                sensor_data['_id'] = str(sensor_data['_id'])
                
            socketio.emit('live_sensor_reading', sanitize_document(sensor_data))
            eventlet.sleep(0)
            
    except Exception as e:
        logging.error(f"Error consuming Kafka messages: {e}")
    finally:
        consumer.close()
