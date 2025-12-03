import logging
from flask import Flask
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    app.config.from_mapping(
        DEBUG=False,
        JSON_SORT_KEYS=False,
    )
    CORS(app)

    logging.basicConfig(level=logging.INFO)
    
    @app.get('/health')
    def health():
        return {'service': 'Where2Meet API', 'status': 'healthy'}

    return app
