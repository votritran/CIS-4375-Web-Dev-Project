import flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import mysql.connector
import os
from dotenv import load_dotenv
load_dotenv()

# Flask app instance
app = flask.Flask(__name__)
app.config["DEBUG"] = True
CORS(app)
bcrypt = Bcrypt(app)  

# Database connection
def create_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        return connection
    except mysql.connector.Error as e:
        print(f"Database connection error: {e}")
        return None

# Import the login blueprint
from login import login_blueprint
app.register_blueprint(login_blueprint)

@app.route('/', methods=['GET'])
def home():
    return {"message": "Welcome to the Bakery API!"}

if __name__ == '__main__':
    app.run()

