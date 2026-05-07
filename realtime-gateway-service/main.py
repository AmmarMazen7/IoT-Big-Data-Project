import eventlet
eventlet.monkey_patch()

import logging
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from config import Config
from events.socket_handlers import register_socket_events
from services.mongo_watcher import monitor_mongo_changes
from services.kafka_consumer import consume_kafka_messages

logging.basicConfig(
    format='%(asctime)s %(levelname)s: %(message)s',
    level=logging.INFO
)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')
    
    # Register events
    register_socket_events(socketio)
    
    @app.route('/healthz')
    def healthz():
        return 'ok', 200

    return app, socketio

if __name__ == '__main__':
    logging.info('STARTING REALTIME GATEWAY SERVICE')
    app, socketio = create_app()
    
    # Start background tasks
    eventlet.spawn_n(monitor_mongo_changes, socketio)
    eventlet.spawn_n(consume_kafka_messages, socketio)
    
    socketio.run(app, host='0.0.0.0', port=5000)
