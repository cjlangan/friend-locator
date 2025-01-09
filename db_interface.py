import sqlite3
import time
import secrets

class Token:
    def __init__(self, token, expiry):
        self.token = token
        self.expiry = expiry


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

            cursor.execute('''CREATE TABLE IF NOT EXISTS friends(
                        user_id_1            INTEGER   REFERENCES users(user_id) ON DELETE CASCADE,
                        user_id_2            INTEGER   REFERENCES users(user_id) ON DELETE CASCADE,
                        PRIMARY KEY(user_id_1, user_id_2)
                        );
                        ''')

            cursor.execute('''CREATE TABLE IF NOT EXISTS friend_requests(
                        from_user                 INTEGER   REFERENCES users(user_id) ON DELETE CASCADE,
                        to_user                   INTEGER   REFERENCES users(user_id) ON DELETE CASCADE,
                        PRIMARY KEY(from_user, to_user)
                        );
                        ''')

        except(Exception):
            raise Exception("Database initialization error.")



    def user_id_list_to_name_list(self, id_list):
        name_list= []
        for id in id_list: 
            name_list.append(
                    self.get_client_from_id(id).get_name()
                    )

        return name_list

    def create_client(self, username, password):
        cursor = self.db.cursor()
        query = '''
            INSERT INTO users(name, password)
            values(?, ?)
            '''            

        #insert user
        try:
            cursor.execute(query, (username, password))
        except(sqlite3.IntegrityError):
            return None

        self.db.commit()
        return self.get_client_from_credentials(username, password)


    def get_client_from_credentials(self, username, password):
        cursor = self.db.cursor() 
        query = '''
            SELECT user_id FROM users
            WHERE name     LIKE ?
            AND   password =    ?
        '''
        cursor.execute(query, (username, password) )
        result = cursor.fetchone()

        if not result: 
            return None

        user_id = result[0]
        return Client(self.db, user_id)

    def get_client_from_name(self, username):
        cursor = self.db.cursor() 
        query = '''
            SELECT user_id FROM users
            WHERE name     LIKE ?
        '''
        cursor.execute(query, (username,) )
        result = cursor.fetchone()

        if not result: 
            return None

        user_id = result[0]
        return Client(self.db, user_id)


    def get_client_from_id(self, client_id):
        return Client(self.db, client_id)

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

    def close(self):
        self.db.close()

        
class Client:

    FAILURE = 1
    REQUEST_SENT = 2
    DUPLICATE_REQUEST = 3
    FRIEND_ADDED = 4
    ALREADY_FRIENDS = 5

    def __init__(self, db, user_id):
        self.db = db
        self.user_id = user_id

    def get_friends(self):

        cursor = self.db.cursor()
        query = '''
        SELECT user_id_1 FROM friends
        WHERE user_id_2 = ?
        UNION
        SELECT user_id_2 FROM friends
        WHERE user_id_1 = ?
        '''

        results = cursor.execute(query, (self.user_id, self.user_id)).fetchall()

        return self._sql_results_to_list(results)

    #takes the first element of every tuple 
    #and adds them to an list.
    @staticmethod
    def _sql_results_to_list(results):
        list = []
        for result_tuple in results:
            list.append(result_tuple[0])

        return list


    def is_friends_with(self, friend):
        if self.user_id == friend.user_id:
            return False #Should this be true??

        cursor = self.db.cursor()
        query = '''
        SELECT COUNT(*) FROM friends
        WHERE (user_id_1 = ? AND user_id_2 = ?) OR
        (user_id_1 = ? AND user_id_2 = ?)
        '''

        result = cursor.execute(query,
            (self.user_id, friend.user_id, friend.user_id, self.user_id)
        ).fetchone()

        return result[0] >= 1


    def unfriend(self, friend):
        if friend is None or not self.is_friends_with(friend):
            return False

        cursor = self.db.cursor()
        query = '''
        DELETE FROM FRIENDS
        WHERE (user_id_1 = ? AND user_id_2 = ?) OR
        (user_id_1 = ? AND user_id_2 = ?)
        '''

        cursor.execute(query,
             (self.user_id, friend.user_id, friend.user_id, self.user_id)
         )
        self.db.commit()

        return True

    def withdraw_friend_request(self, friend):
        if friend is None:
            return False

        cursor = self.db.cursor()
        query = '''
        DELETE FROM friend_requests
        WHERE to_user = ? AND from_user = ?
        '''

        cursor.execute(query, (friend.user_id, self.user_id)) 
        self.db.commit()
        return True

        

    #returns one of
    # FAILURE, REQUEST_SENT, DUPLICATE_REQUEST, FRIEND_ADDED, ALREADY_FRIENDS
    def send_friend_request(self, friend):

        if friend is None or friend.user_id == self.user_id:
            return self.FAILURE

        if self.is_friends_with(friend):
            return self.ALREADY_FRIENDS

        cursor = self.db.cursor()
        #check if the user has already sent a friend requset. 
        query = '''
            SELECT count(*) FROM friend_requests
            WHERE from_user = ? AND
            to_user = ?
        '''
        result = cursor.execute(query, (self.user_id, friend.user_id))
        if result.fetchone()[0] == 1:
            return self.DUPLICATE_REQUEST

        #check if 'friend' has sent you a friend request.
        #If they have, remove their request and add to the friends table
        #Otherwise, add a friend requset.
        query = '''
            SELECT count(*) FROM friend_requests
            WHERE from_user = ? AND
            to_user = ?
        '''
        result = cursor.execute(query, (friend.user_id, self.user_id))

        #send the request
        if result.fetchone()[0] == 0:
            query = '''
            INSERT INTO friend_requests(from_user, to_user)
            values(?, ?)
            '''

            cursor.execute(query, (self.user_id, friend.user_id))
            self.db.commit()
            return self.REQUEST_SENT

        #accept the request
        else:
            query = '''
            DELETE FROM friend_requests
            WHERE to_user = ? AND
            from_user = ?
            '''

            cursor.execute(query, (self.user_id, friend.user_id))

            query = '''
            INSERT INTO friends(user_id_1, user_id_2)
            values(?, ?)
            '''
            cursor.execute(query, (self.user_id, friend.user_id))
            self.db.commit()
            return self.FRIEND_ADDED


    def has_valid_token(self):

        cursor = self.db.cursor()
        query = '''
            SELECT token_expiry FROM tokens WHERE user_id = ?
            '''
        cursor.execute(query, (self.user_id,) )
        result = cursor.fetchone()

        if result is None:
            return False

        expiry = result[0]
        return expiry > int(time.time())

    # returns a tuple of the token and the token's expiry date
    def get_token(self):
        cursor = self.db.cursor()
        query = '''
            SELECT token, token_expiry FROM tokens
            WHERE user_id = ?
        '''
        cursor.execute(query, (self.user_id,) )
        
        results= cursor.fetchone()
        if results is None:
            return None

        token = results[0]
        expiry = results[1]

        return Token(token, expiry)

    def generate_new_token(self, token_length=64, lifetime_s=604800):
        cursor = self.db.cursor()
        query = '''
                INSERT OR REPLACE INTO tokens(user_id, token, token_expiry)
                values(?, ?, ?)
            '''

        valid_token = False
        while not valid_token: 
            new_token = secrets.token_urlsafe(token_length)
            expiry = int(time.time()) + lifetime_s 
            try:
                cursor.execute(query, (self.user_id, new_token, expiry) )
                valid_token = True
            except(sqlite3.IntegrityError):
                print("Generated non-unique token. Try again.")
                pass

        self.db.commit()
        return Token(new_token, expiry)

    def set_location(self, lat, lon):
        cursor = self.db.cursor()
        query = '''
            INSERT OR REPLACE INTO locations (user_id, latitude, longitude)
            VALUES(?, ?, ?)
        '''
        cursor.execute(query, (self.user_id, lat, lon))
        self.db.commit() 

    def get_incoming_friend_requests(self):
        cursor = self.db.cursor()
        query = '''
        SELECT from_user FROM friend_requests
        WHERE to_user = ?
        '''

        result = cursor.execute(query, (self.user_id,)).fetchall()
        return self._sql_results_to_list(result)

    def get_outgoing_friend_requests(self):
        cursor = self.db.cursor()
        query = '''
        SELECT to_user FROM friend_requests
        WHERE from_user = ?
        '''

        results = cursor.execute(query, (self.user_id,)).fetchall()
        return self._sql_results_to_list(results)

    def get_location(self):
        cursor = self.db.cursor()
        query = '''
            SELECT latitude, longitude FROM locations
            WHERE user_id = ?
            '''

        cursor.execute(query, (self.user_id,) )
        results = cursor.fetchone()

        return (None, None) if not results else results

    def get_name(self):
        cursor = self.db.cursor()
        query = '''
            SELECT name FROM users 
            WHERE user_id = ?
            '''

        cursor.execute(query, (self.user_id,) )
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

if __name__ == "__main__":
    db = Database("database.sqlite")
    db.create_client("logan1", "password")
    db.create_client("logan2", "password")
    user1 = db.get_client_from_name("logan1")
    if user1 is None:
        print("User1 does not exist")
    user2 = db.get_client_from_name("logan2")
    if user2 is None:
        print("User2 does not exist")


    print(user1.get_friends())
    print(user1.send_friend_request(user2))
    print(user1.get_outgoing_friend_requests())
    print(user2.get_outgoing_friend_requests())
    print(user1.get_incoming_friend_requests())
    print(user2.get_incoming_friend_requests())
    print(user1.get_friends())
    # print(user2.is_friends_with(user1))


