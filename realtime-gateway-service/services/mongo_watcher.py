import eventlet
import logging
from pymongo import MongoClient
from config import Config
from utils import sanitize_document

def monitor_mongo_changes(socketio):
    logging.info("Starting MongoDB change stream monitor for analytics...")
    client = MongoClient(Config.MONGO_URL)
    db = client[Config.DB_NAME]
    coll = db[Config.ANALYTICS_COLLECTION]
    
    while True:
        try:
            with coll.watch(full_document='updateLookup') as change_stream:
                for change in change_stream:
                    logging.info(f"MongoDB Change detected: {change['operationType']}")
                    document = change.get('fullDocument')
                    if document:
                        document['_id'] = str(document['_id'])
                        sanitized = sanitize_document(document)
                        socketio.emit('analytics_update', sanitized)
        except Exception as e:
            logging.error(f"Error monitoring MongoDB changes: {e}")
        
        logging.info('Sleeping 5 seconds before reconnecting to Mongo change stream...')
        eventlet.sleep(5)
        
        # After a reconnect (usually caused by Spark dropping the collection for an overwrite),
        # we broadcast the entire new collection to clients.
        try:
            analytics_data = []
            for doc in coll.find():
                doc['_id'] = str(doc['_id'])
                analytics_data.append(sanitize_document(doc))
            if analytics_data:
                socketio.emit('initial_analytics', analytics_data)
                logging.info(f"Broadcasted {len(analytics_data)} updated analytics records to all clients.")
        except Exception as e:
            logging.error(f"Error sending bulk analytics update: {e}")
