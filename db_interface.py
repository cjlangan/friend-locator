import sqlite3
import time
import secrets

class Database:

    def __init__(self, database_path, token_length=64):
        self.token_length = token_length 
        try:
            self.db = sqlite3.connect(database_path, check_same_thread=False)
            cursor = self.db.cursor()
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
        except(Exception):
            raise Exception("Database initialization error.")


    def create_client(self, username, password):
        cursor = self.db.cursor()
        query_string = '''
            INSERT INTO users(name, password)
            values(?, ?)
            '''            

        #insert user
        try:
            cursor.execute(query_string, (username, password))
        except(sqlite3.IntegrityError):
            return None

        self.db.commit()
        return self.get_client_from_credentials(username, password)


    def get_client_from_credentials(self, username, password):
        cursor = self.db.cursor() 
        query_string = '''
            SELECT user_id FROM users
            WHERE name     LIKE ?
            AND   password =    ?
        '''
        cursor.execute(query_string, (username, password) )
        result = cursor.fetchone()

        if not result: 
            return None

        user_id = result[0]
        return Client(self.db, user_id)


    def get_client_from_token(self, token):
        cursor = self.db.cursor() 
        cursor.execute(
            '''
            SELECT user_id FROM tokens WHERE token = ?
            ''',
            (token,)
        )
        result = cursor.fetchone() 

        #no user corresponds to this token
        if result is None:
            return None

        user_id = result[0]
        return Client(self.db, user_id)

        
class Client:

    def __init__(self, db, user_id):
        self.db = db
        self.user_id = user_id


    def has_valid_token(self):

        cursor = self.db.cursor()
        query_string = '''
            SELECT token_expiry FROM tokens WHERE user_id = ?
            '''
        cursor.execute(query_string, (self.user_id,) )
        result = cursor.fetchone()

        if result is None:
            return False

        expiry = result[0]
        return expiry > int(time.time())


    def generate_new_token(self, token_length=64, lifetime_s=604800):
        cursor = self.db.cursor()
        query_string = '''
                INSERT OR REPLACE INTO tokens(user_id, token, token_expiry)
                values(?, ?, ?)
            '''

        valid_token = False
        while not valid_token: 
            new_token = secrets.token_urlsafe(token_length)
            expiry = int(time.time()) + lifetime_s 
            try:
                cursor.execute(query_string, (self.user_id, new_token, expiry) )
                valid_token = True
            except(sqlite3.IntegrityError):
                print("Generated non-unique token. Try again.")
                pass

        self.db.commit()
        return new_token

    def set_location(self, lon, lat):
        cursor = self.db.cursor()
        query_string = '''
            INSERT OR REPLACE INTO locations (user_id, latitude, longitude)
            VALUES(?, ?, ?)
        '''
        cursor.execute(query_string, (self.user_id, lat, lon))
        self.db.commit() 

    def get_location(self):
        cursor = self.db.cursor()
        query_string = '''
            SELECT latitude, longitude FROM locations
            WHERE user_id = ?
            '''

        cursor.execute(query_string, (self.user_id,) )
        results = cursor.fetchone()

        return None if not results else results

    def get_name(self):
        cursor = self.db.cursor()
        query_string = '''
            SELECT name FROM users 
            WHERE user_id = ?
            '''

        cursor.execute(query_string, (self.user_id,) )
        results = cursor.fetchone()

        return None if not results else results[0]


    def print(self):
        name = self.get_name()
        if not name: 
            print("No name.")
        else:
            print(name)

        print(self.user_id)
        print(self.has_valid_token())
        location = self.get_location()
        if location is None:
            print("No location.")
        else:
            print(f"lat: {location[0]}")
            print(f"lon: {location[1]}")

db = Database("database.sqlite")

# client = db.get_client_from_token("WW8-6a9i0bbj5IlqClzgXhklxwCcijPkEaJU3qB7xYlJzijJy-sUqLuiTx11vPhLbst72R3PBIianHueqZ5eGQ")
# print(client.has_valid_token())
# print(client.generate_new_token())

client = db.create_client("laptop29", "laptop")
if client is not None:
    client.generate_new_token()
    client.set_location(100, 200)
    client.print()
else:
    print("Clint is none.")
