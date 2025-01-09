from flask import Flask
from flask import render_template
from flask import url_for 
from flask import current_app
from flask import request, redirect, url_for, jsonify
import signal
from db_interface import Client 
import db_interface 

DATABASE_PATH = "database.sqlite"
TOKEN_LENGTH = 64
TOKEN_LIFETIME_SEC = 604800 #a week
#create the app
app = Flask(__name__, template_folder='templates', static_url_path='/static')
app.app_context()
database = None


def get_user_from_token(request):
    if 'token' not in request.cookies:
        return None

    token = request.cookies.get('token')
    user = database.get_client_from_token(token)
    return user
    

@app.route('/homepage')
def homepage():
    user = get_user_from_token(request)
    if user is not None and user.has_valid_token():
        return render_template('homepage.html')
    else:
        return redirect(url_for('return_login_page'))
    

@app.route('/logout')
def logout():
    resp = app.make_response(redirect('/login-page'))
    #invalidate cookie.
    resp.set_cookie('token', '0', expires = 0, secure = True)
    return resp

@app.route('/add-friends')
def add_friends():
    user = get_user_from_token(request)
    if user is None or not user.has_valid_token():
        return redirect(url_for('return_login_page'))
    return render_template('add_friends.html')


@app.route('/')
def webpage():
    user = get_user_from_token(request)
    if user is not None and user.has_valid_token():
        return redirect(url_for('homepage'))
    else:
        return redirect(url_for('return_login_page'))

@app.route('/API/location', methods=['POST'])
def set_location():
    user = get_user_from_token(request)
    if user is None:
        return 'Invalid or missing token.', 401

    latitude = request.form['lat']
    longitude = request.form['lon']

    user.set_location(latitude, longitude)

    return 'Location updated successfuly', 200


#which can be incoming or outgoing
@app.route('/API/friend_requests/<which>', methods=['GET'])
def get_friend_requests(which):
    user = get_user_from_token(request)
    if user is None:
        return 'Invalid or missing token.', 401

    if which == "incoming":
        request_id_list = user.get_incoming_friend_requests()
    elif which == "outgoing":
        request_id_list = user.get_outgoing_friend_requests()
    else:
        return 'Invalid path', 404

    user_name_list = database.user_id_list_to_name_list(request_id_list)
    return jsonify(user_name_list)


@app.route('/API/friend', methods=['GET'])
def get_friends():
    user = get_user_from_token(request)
    if user is None:
        return 'Invalid or missing token.', 401

    friend_list = database.user_id_list_to_name_list(user.get_friends())
    return jsonify(friend_list)
 

@app.route('/API/friend', methods=['DELETE'])
def remove_friend():
    user = get_user_from_token(request)
    if user is None:
        return 'Invalid or missing token.', 401

    username = request.form['name']
    friend = database.get_client_from_name(username)
    success = user.unfriend(friend)
    
    if success:
        return 'Success', 200
    return 'Failiure', 201
    

@app.route('/API/friend', methods=['POST'])
def add_friend():
    user = get_user_from_token(request)
    if user is None:
        return 'Invalid or missing token.', 401

    username = request.form['name']
    friend = database.get_client_from_name(username)
    status = user.send_friend_request(friend)

    match status:
        case Client.FAILURE:
            return 'Could not send friend request.', 400
        case Client.REQUEST_SENT:
            return 'Request sent', 200
        case Client.DUPLICATE_REQUEST:
            return 'You have already sent a request to this user', 200
        case Client.FRIEND_ADDED:
            return 'Added friend', 200
        case Client.ALREADY_FRIENDS:
            return 'Could not send frient request. You are already friends with this user', 200
    

@app.route('/API/location/<username>', methods=['GET'])
def get_friend_location(username):
    requester = get_user_from_token(request)
    if requester is None:
        return 'Invalid or missing token.', 401

    friend = database.get_client_from_name(username)
    if friend is None:
        return "Account does not exist.", 401 

    if not db.is_friends_with(requester, friend)
        return "This is not your friend.", 401 

    latitude, longitude = friend.get_location()
    if latitude is None or longitude is None:
        return "User's location not available.", 404

    user_location = {
            "username": username,
            "latitude": latitude,
            "longitude": longitude
    }

    return jsonify(user_location), 200


@app.route('/login-page', methods=['GET'])
def return_login_page():
    return render_template('login.html')

@app.route('/create-account', methods=['GET'])
def return_account_creator():
    return render_template('account_creation.html')

@app.route('/API/session', methods=['POST'])
def create_session():
    username = request.form['username']
    password = request.form['password']

    client = database.get_client_from_credentials(username, password)
    #No account with that username and password exist
    if not client:
            return "Username or password incorrect.", 401

    if client.has_valid_token():
        token = client.get_token()
    else:
        token = client.generate_new_token(TOKEN_LENGTH, TOKEN_LIFETIME_SEC)

    resp = app.make_response(("Successfuly logged in", 200))
    resp.set_cookie('token', f'{token.token}', expires = token.expiry, secure = True)
    return resp

@app.route('/API/users/<username>', methods=['GET'])
def user_exists(username):
    user = database.get_client_from_name(username)
    if user is None:
        return jsonify({"exists": False}), 200
    return jsonify({"exists": True}), 200

@app.route('/API/users', methods=['POST'])
def add_user():
    #TODO clean the input to stop SQL code injection.
    username = request.form['username']
    password = request.form['password']

    user = database.get_client_from_name(username)
    if user is not None:
        return "Username already in use.", 401

    user = database.create_client(username, password)
    if user is None:
        return "Server error. Could not create account", 500

    return "Account successfuly created.", 200


def cleanup(signum, frame):
    global database
    database.close()
    print("\x08\x08Successfuly closed server.")
    exit()

def main():
    global database
    database = db_interface.Database(DATABASE_PATH, TOKEN_LENGTH)

    #set signal handler for SIGINT to crean up on exit
    signal.signal(signal.SIGINT, cleanup)

main()

