from flask import Flask
from flask import render_template
from flask import url_for 
from flask import current_app
from flask import request
import signal
import sqlite3

DATABASE_PATH = "database.sqlite"
#create the app
app = Flask(__name__, template_folder='templates')
app.app_context()
database = None

def init_database(database_path):
    db = sqlite3.connect(database_path, check_same_thread=False)
    cursor = db.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS users(
                 user_id           INTEGER    PRIMARY KEY,
                 name              TEXT       UNIQUE NOT NULL,
                 password          TEXT       NOT NULL
                 );
                 ''')

    cursor.execute('''CREATE TABLE IF NOT EXISTS tokens(
                user_id            INTEGER    REFERENCES users(user_id) ON DELETE CASCADE, 
                token              BINARY(16) NOT NULL,
                token_expiry       INTEGER    NOT NULL,
                PRIMARY KEY(user_id)
                );
                 ''')

    cursor.execute('''CREATE TABLE IF NOT EXISTS locations(
                user_id            INTEGER    REFERENCES users(user_id) ON DELETE CASCADE,
                latitude           REAL       NOT NULL,
                longitude          REAL       NOT NULL,
                PRIMARY KEY(user_id)
                );
                ''')

    print("Initated database")
    return db
        

@app.route('/')
def webpage():
    return render_template('account_creation.html')

@app.route('/API/users', methods=['POST'])
def add_user():
    #TODO clean the input to stop SQL code injection.
    username = request.form['username']
    password = request.form['password']

    cursor = database.cursor() 
    query_string = f"""
        SELECT count(*) FROM users
        WHERE name like '{username}'; 
    """
    cursor.execute(query_string)
    users_with_same_name = cursor.fetchall()[0][0]

    if not users_with_same_name == 0:
        return "Username in use.", 202
    
    query_string = f'''
        INSERT INTO users(name, password) values('{username}', '{password}')
    '''
    print(query_string)
    cursor.execute(query_string)
    database.commit()

    return "Account successfuly created.", 200


    

@app.route('/API/location', methods=['POST'])
def print_location():
    # print(request.form['lat'])
    return 'OK'

def cleanup(signum, frame):
    database.close()
    print("\x08\x08Successfuly closed server.")
    exit()

def main():
    global database
    database = init_database(DATABASE_PATH)
    if database is None:
        print("Error, could not open dataabase.")
        exit(1)
    signal.signal(signal.SIGINT, cleanup)


main()
