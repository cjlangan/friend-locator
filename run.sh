export FLASK_APP=main.py
flask run --host=0.0.0.0

# For running on server:
#python3 -m gunicorn -w 4 -b 127.0.0.1:5000 main:app

# Then I'm using apache2 to proxy pass 127.0.0.1:5000 to an https connection
