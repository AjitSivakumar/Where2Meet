import os
from app import create_app
from app.routes import api

app = create_app()
app.register_blueprint(api, url_prefix='/api')

if __name__ == '__main__':
    port = int(os.getenv('PORT', '5001'))
    app.run(host='0.0.0.0', port=port)
