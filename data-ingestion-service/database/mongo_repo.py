import pymongo
import time
import logging
from config import Config

class MongoRepository:
    def __init__(self):
        self.client = self._connect()
        self.db = self.client[Config.DB_NAME]
        self.collection = self.db[Config.RAW_COLLECTION]

    def _connect(self):
        retry_delay_seconds = 5
        while True:
            try:
                client = pymongo.MongoClient(Config.MONGO_URL, serverSelectionTimeoutMS=5000)
                client.admin.command('ping')
                logging.info("INFO: Successfully connected to MongoDB.")
                return client
            except pymongo.errors.ServerSelectionTimeoutError as e:
                logging.warning(f"WARNING: MongoDB not available, retrying in {retry_delay_seconds} seconds: {e}")
                time.sleep(retry_delay_seconds)
            except Exception as e:
                logging.error(f"ERROR: An unexpected error occurred during MongoDB connection: {e}. Exiting.")
                exit(1)

    def insert_sensor_data(self, data):
        if '_id' in data:
            del data['_id']
            
        try:
            result = self.collection.insert_one(data)
            logging.debug(f"DEBUG: Inserted sensor data into MongoDB. Id: {result.inserted_id}")
        except pymongo.errors.PyMongoError as e:
            logging.error(f"ERROR: Failed to insert sensor data into MongoDB: {e}")
        except Exception as e:
            logging.error(f"ERROR: An unexpected error occurred during MongoDB insert: {e}")
