import logging
from pymongo import MongoClient
from config import Config
from utils import sanitize_document

def register_socket_events(socketio):
    client = MongoClient(Config.MONGO_URL)
    db = client[Config.DB_NAME]
    coll = db[Config.ANALYTICS_COLLECTION]
    raw_coll = db[Config.RAW_COLLECTION]

    @socketio.on('connect')
    def handle_connect():
        logging.info("Client connected to Realtime Gateway. Sending initial payload...")
        socketio.emit('status', {'msg': 'Connected to gateway'})
        
        # Send initial analytics
        try:
            analytics_data = []
            for doc in coll.find():
                doc['_id'] = str(doc['_id'])
                analytics_data.append(sanitize_document(doc))
            socketio.emit('initial_analytics', analytics_data)
            
            raw_count = raw_coll.count_documents({})
            analytics_count = coll.count_documents({})
            socketio.emit('status_counts', {'raw_sensors_count': raw_count, 'analytics_count': analytics_count})
            
            # Emit recent raw readings
            raw_data = []
            for doc in raw_coll.find().sort('_id', -1).limit(50):
                doc['_id'] = str(doc['_id'])
                raw_data.append(sanitize_document(doc))
            raw_data.reverse()
            socketio.emit('initial_sensors', raw_data)
            
        except Exception as e:
            logging.error(f"Error sending initial WebSocket data: {e}")

    @socketio.on('disconnect')
    def test_disconnect():
        logging.info('Client disconnected from Gateway')
