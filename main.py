from flask import Flask
from flask import render_template
from flask import url_for 
from flask import current_app
from flask import request
import signal
import sqlite3
import secrets
import time

DATABASE_PATH = "database.sqlite"
TOKEN_LENGTH = 64
TOKEN_LIFETIME_SEC = 604800 #a week
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
                token              TEXT       NOT NULL UNIQUE,
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
        

@app.route('/homepage')
def homepage():
    if not valid_token(request):
        return 'invalid or missing token', 401
    
    return render_template('homepage.html')

@app.route('/')
def webpage():
    return render_template('login.html')

@app.route('/login-page', methods=['GET'])
def return_login_page():
    return render_template('login.html')

@app.route('/create-account', methods=['GET'])
def return_account_creator():
    return render_template('account_creation.html')

@app.route('/API/session', methods=['POST'])
def create_session():
    #TODO clean the input to stop SQL code injection.
    username = request.form['username']
    password = request.form['password']

    #verify username and password
    cursor = database.cursor() 
    query_string = f"""
        SELECT user_id FROM users
        WHERE name     LIKE '{username}'
        AND   password LIKE '{password}'
    """
    cursor.execute(query_string)
    results = cursor.fetchall()
    if not results: #I LOVE THAT THE EMPTY ARRAY IN PYTHON IS FALSY!!!
        return 'Invalid username or password', 403

    #remove existing token if it exists 
    user_id = results[0][0]
    query_string = f"""
        DELETE FROM tokens
        WHERE user_id = '{user_id}'
    """
    cursor.execute(query_string)

    #create a new token
    created_token = False
    while not created_token: 
        token = secrets.token_urlsafe(TOKEN_LENGTH)
        expiry = int(time.time()) + TOKEN_LIFETIME_SEC 
        query_string = f"""
            INSERT INTO tokens(user_id, token, token_expiry) values('{user_id}', '{token}', {expiry})
                        """
        try:
            cursor.execute(query_string)
            created_token = True
        except(sqlite3.IntegrityError):
            print("Generated non-unique token. Trying again")

    database.commit()

    resp = app.make_response(("Successfuly logged in", 200))
    resp.set_cookie('token', f'{token}', expires = expiry, secure = True)
    return resp

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

def valid_token(request):
    if 'token' not in request.cookies:
        return False

    session_tok = request.cookies.get('token')

    cursor = database.cursor()
    statement = '''SELECT token, token_expiry, user_id FROM tokens
                   WHERE token = ?;
                '''
    cursor.execute(statement, (session_tok,) )
    result = cursor.fetchall()

    #check it's an actual token, not one made up
    if not result:
        return False

    #check if it has expried
    if result[0][1] <= int(time.time()):
        return False

    return True


main()

