import os

import uvicorn

from api import app

host = os.getenv("BACKEND_IP", '0.0.0.0')
port = int(os.getenv("BACKEND_PORT", 8000))

if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=port)
