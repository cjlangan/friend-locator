# Friend Locator 

#### A project to locate your friends using a web app! 

### Project Video 

[![Watch the video](https://img.youtube.com/vi/WxWmKGfQXFY/hqdefault.jpg)](https://youtu.be/WxWmKGfQXFY)

## Project link 

After over 1000 lines of code and 100 commits, the beta version is complete:

[https://friend-locator.duckdns.org](https://friend-locator.duckdns.org)

## Usage: 

1. Ensure your browser has location permission 
    - ON IOS: 
        - Head to settings > Privacy & Security > Location Services > (Choose you browser, i.e. Safari) > Select "While Using the App"

2. Head to [the website](https://friend-locator.duckdns.org), create an account, and log in. 
    - Have a friend (different device) do the same

3. Enter eachothers usernames into the search field.

4. That's it!
    - Your compasses will now direct you and your friend towards eachother until you are in a close enough proximity to eachother to find manually (~5 meters) 

## TODO 

- Add two-way authentication for a friend connection.
- Maybe make canvas 3D and add an elevation aspect 
- Could maybe improve efficiency if users had direct connection to eachother rather than having to access the server.

### Dependencies
- python3-mysql.connector
- python3-flask

## Log

### Day 1 

- Implemented basic geolocation request with auto updating 
- Tried to change options to allow for more accuracy and/or faster location retrieval.
    - These attempts virtually changed nothing
- Next time I want to try and run the website from a Phone to see if it is quicker/more accurate there
- An iphone app has insanely accurate and fast coordinates, that is what I'd like to replicate.

### Day 2

- Managed to test website on iPhone via and https connection using ngrok. A few things to note...
    1. the location precision is much higher, like up to 7 more decimal places in accuracy.
    2. the time taken to update the location is a fraction of a second.
- These are ideal, however...:
    - It is most likely that the user will have their location off for browser apps such as safari or chrome. 
    - So, in order to use this web app, they must first go to their settings and enable location services for their browser.
    - This is a slight, and unfortunate, barrier, and there is not much we can do other than give instruction on our webapp so the user know to go and do this.
        - Their is no indication otherwise as to why the location does not work.
- ~~At this point, we are ready to either test receiving another webapp user's coordinates and/or finding a way to draw a vecotor that points to a coordinate location.~~
- Next up is to add the Device Orientation API, only then can we decide where a vector can point relatively.
- I added the device orientation function, but for some reason (when using on my iPhone as I should be), it appears that we aren't getting any information
    - This may be an iPhone problem, Logan was able to have has phone work with a demo website that used this function...

### Day 3 
- Added ability to obtain device orientation on IOS mobile, it requires manual permission via its own function
    - It must also be done through manual interaction, such as a button.
    - THis isn't bad, odds are we have some other `start finding friends` button and through that we can run the Orientation Permission Request.
- Added canvas to draw a vector 
- I made a system to that we can draw a vector that always points at a specific geo-location relative to device orientation, however:
    - ISSUE: It turns out that the device orientation numbers change every time the website is loaded. I was under the assumption that 360 degrees always meant south, however this is not the case
    - We will have to retrieve another piece of data from the phone so that we know which way, say North, is relative to the phone's orientation...

### Day 4 
- So $0^o$ is your phones orientation when you first allow orientation permission. 
- So, if we can determine what the original direction the phone points to (e.g: North), then we can always calculate its current direction based on rotation.
    - ~~IDEA: Have coordinates or a vector be originally directly North, so this vecotr will be pointing a direction on the canvas, then we can correct that Northern vector relative to the device orientation~~
- Able to resolve this by using the webkitCompassHeading event.
- We can now point to specific coordinates relative to the phones orientation 
    - We found that this worked best outside
- Logan was able to set up the Flask server, and be able to send coordinate data to it.

### Day 5 
- Began adding some basic CSS, I realise that I am not very good at web design. 
- We will have to decided how we want it to look more exactly later. 

### Day 6
- Created database tables. I will still need to add another table for who can track who's location, but that is yet to come.  
- Added the path /API/users where you can POST to to create a new user. Next, I will add a login screen. Should this be a single page application? I don't know.

### Day 7
- Added ability to add locations to database
- Added ability to retrieve other users locations from the database and point to their location!
- Changes CSS from the ugly plain colors to better images and other stuff 
- Brought in discord information to get stronger idea of how we should be finishing the project in the next coming few days

### Day 8 
- Made video, fine-tuned backend database management, ready to send to production
