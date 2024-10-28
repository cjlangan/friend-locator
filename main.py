from flask import Flask
from flask import render_template
from flask import url_for 
from flask import current_app
from flask import request

#create the app
app = Flask(__name__, template_folder='templates')
app.app_context()

@app.route('/')
def webpage():
    return render_template('index.html')

@app.route('/API/location', methods=['POST'])
def print_location():
    print(request.form)
    return 'OK'

if __name__ == "__main__":
    #run the app
    app.run(debug = True, host = '', port = 8000)
