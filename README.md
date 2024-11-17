# Friend Locator 

#### A project to locate you friends using a web app! 

### Dependencies
- python3-mysql.connector
- python3-flask

## Status 

- Currently you can login and if two people enter eachothers usernames, then the app *should* just work.
    - I did some testing, but I'm out of the city and there is no service, so maybe that is why the accuracy was so poor
    - Praying it will be better if testing in the city 
- They way it is currently set up, you can enter anyone's username and if they have ever logged in, then you will be able to see their location.
    - Obviously this is **very** unsafe; we need to eventually create it so it only works if both people are trying to geolocate eachother, not just a one way thing. 


## TODO 

- Add info for user to allow location on mobile
- Add better way to stop tracking a friend.
- Add better / more code comments.
- Add two-way authentication for a friend connection.
- Get a link to host the webapp on. Maybe? Just gotta be able to run on aviary servers and get a https connection.
- maximum 5-minute video presentation (.mp4 format) about our project 
- submit project in the form of a GitHub repository to [Google Forms](https://bit.ly/CUSECProjectSubmission)

## Info From Discord: 

- Team of 3
- software, library, game, webapp, research 
- winners fully funded to attend the Canadian University Software Engineering Conference 2025 to submit their project and participate in the Dev's Den contest, representing the University of Manitoba in what is one of the biggest stages for undergraduate students all across Canada.

🏆 Prize for the best team: up to $3000 for a team of 3 ($1000/person)

- for stipends that would be required to attend CUSEC 
    - conference tickets 
    - plane tickets 
    - hotel/accommodation fees 
    - food, drink and travel fees for the duration of CUSEC.

### Requirements: 

- original work
- working interactive prototype, except for the case of research projects
- maximum 5-minute video presentation (.mp4 format is preferred).
- Submit GitHub repository

#### The teams who receive funding must:

- confirm their ability to attend the entirety of CUSEC (January 9th - 11th, 2025),
- arrange plane tickets, accommodations, and food for CUSEC (the organizing committee will assist in securing them conference tickets and other things as necessary),
- attend a branding guidelines workshop TBD the week of January 6th, 2025 (before CUSEC starts),
- give a report to the Department Head and presentation (TBD) to the student body about their experience and what they've learned (with the assistance of the organizing committee).

#### Timeline:

- 11:59 PM Sunday, November 17th: Due date for all project submissions
- November 18th - December 1st: Grading period and, if the project's authors indicated so, open board for the public to check out projects and/or presentations
- 12:00 PM Monday, December 2nd: Results
- December 2nd - 8th: Confirmation with the winning team(s) to set up all required bookings, or revision period for awards in special cases
- 11:59 PM Sunday, December 8th: Finalization of the funded attending teams
- Week of January 6th, 2025: Branding guidelines workshop
- January 9th - 11th: CUSEC!
- Aftermath TBD: Written report and giving a presentation.

## Rubric 

### 1. **Originality and Creativity (30 points)**
   - **30-25 points**: The project demonstrates outstanding creativity, with an innovative approach or a unique idea. It introduces a novel solution to a problem, with clear and significant creative input from the team.
   - **24-19 points**: The project demonstrates good creativity, offering a solid or clever idea that might build on existing concepts but adds noticeable improvements or twists.
   - **18-13 points**: The project is somewhat creative, but the idea is a more standard or less innovative approach. Some originality is present but limited.
   - **12-7 points**: The project shows minimal creativity, with a familiar concept or a very basic approach.
   - **6-0 points**: The project lacks originality and creativity, and the idea is not substantially different from existing solutions.

### 2. **Technical Complexity and Functionality (25 points)**
   - **25-22 points**: The project demonstrates excellent technical complexity, with advanced functionality and a sophisticated implementation. It works as intended with minimal or no issues, offering a seamless user experience.
   - **21-18 points**: The project is technically complex, with solid functionality, though it may have a few minor issues or bugs. The implementation demonstrates good technical understanding.
   - **17-13 points**: The project has moderate technical complexity, with basic functionality mostly working as intended. There may be some bugs, but the core features function.
   - **12-8 points**: The project demonstrates limited technical complexity, with significant functionality missing or not working properly. There are several bugs that hinder the project.
   - **7-0 points**: The project lacks technical complexity or does not function as intended. It either has major flaws or is non-operational.

### 3. **Real-World Impact and Problem Solving (20 points)**
   - **20-17 points**: The project addresses a significant real-world problem with a clear, impactful solution. The potential for real-world application and relevance is highly evident.
   - **16-13 points**: The project addresses a relevant problem and presents a solid solution. It has good potential for real-world application, though the impact may be less pronounced or immediate.
   - **12-9 points**: The project addresses a problem, but the solution or impact is somewhat limited or unclear in its practical application.
   - **8-5 points**: The project attempts to address a problem, but the solution is vague or the relevance to real-world issues is limited.
   - **4-0 points**: The project does not clearly address a real-world problem, or the solution is disconnected from practical applications.

### 4. **Presentation and Documentation (15 points)**
   - **15-13 points**: The video presentation is clear, engaging, and professional, with excellent visuals and clear explanation of the project’s purpose, development process, and functionality. Documentation is thorough, easy to understand, and well-organized (e.g., README, code comments, etc.).
   - **12-10 points**: The presentation is good, but might lack minor clarity or polish. The project’s purpose, process, and functionality are mostly clear. Documentation is solid but could be improved in depth or organization.
   - **9-7 points**: The presentation is average, with some unclear parts or lacking in detail. Documentation is present but may be incomplete or difficult to follow.
   - **6-4 points**: The presentation is poorly done, unengaging, or unclear in explaining key project aspects. Documentation is sparse or poorly organized.
   - **3-0 points**: The presentation is either missing or completely inadequate. Documentation is insufficient or not provided.

### 5. **Usability and User Experience (10 points)**
   - **10-9 points**: The project is very user-friendly and offers a smooth, intuitive user experience. The interface is clear, accessible, and well-designed, with minimal to no learning curve.
   - **8-7 points**: The project is user-friendly but may have minor issues in usability or design. The interface is good but could benefit from slight improvements.
   - **6-5 points**: The project is somewhat usable, but the user experience is hindered by issues such as confusing design, unclear instructions, or poor interface choices.
   - **4-3 points**: The project has significant usability issues, with a poor user experience that makes it difficult to use or understand.
   - **2-0 points**: The project is not usable or has a severely flawed user experience, making it impractical for end users.

### Total: **100 Points**

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
