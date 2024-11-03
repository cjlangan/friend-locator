from flask import Flask
from flask import render_template
from flask import url_for 
from flask import current_app
from flask import request
import sqlite3

DATABASE_PATH = "database.sqlite"
#create the app
app = Flask(__name__, template_folder='templates')
app.app_context()

def init_database(database_path):
    db = sqlite3.connect(database_path)
    cursor = db.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS users(
                 user_id            INTEGER    PRIMARY KEY,
                 name               TEXT           NOT NULL,
                 password           TEXT           NOT NULL,
                 token              BINARY(16) DEFAULT NULL,
                 last_request_time  INTEGER        NOT NULL,
                 latitude           REAL       DEFAULT NULL,
                 longitude          REAL       DEFAULT NULL
                 )'''
                )
    print("Initated database")
    return db
        

@app.route('/')
def webpage():
    return render_template('index.html')

@app.route('/API/location', methods=['POST'])
def print_location():
    print(request.form)
    return 'OK'


db = init_database(DATABASE_PATH)
db.close()

