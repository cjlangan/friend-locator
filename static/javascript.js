const lat_html = document.getElementById("latitude");
const long_html = document.getElementById("longitude");
const acc_html = document.getElementById("accuracy");
const infotext = document.getElementById("infotext");
const button = document.getElementById("button");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

// Geolocation API options
const options = {
    enableHighAccuracy: true,
    timeout: Infinity,
    maximumAge: 0,
};

let size; // dimension size of canvas

let myLatitude;
let myLongitude;
let myOrientation;

// Coordinate direction of vector. Range [-1, 1]. e.g: (1, -1) is the bottom right corner.
let xFactor = 0;
let yFactor = 0.8;

let angle = 90;
let deviceRotation = 0;

let friend = "";
let isFriend = false;
let isFirstLocation = true;

let hasAllowed = false;

main() 

function main()
{
    window.addEventListener('resize', resizeCanvas);
    getLocation();
    resizeCanvas();
    render();
}

// Draws the vector and coordinates on the canavs 
function render()
{
    ctx.clearRect(0,0, canvas.width, canvas.height);
    drawCardinalDirection();
    drawVector();
}

function drawCardinalDirection()
{
    ctx.font = "10vw Rubik";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // North
    let xF = Math.cos((deviceRotation + 90) * Math.PI / 180);
    let yF = Math.sin((deviceRotation + 90) * Math.PI / 180);
    ctx.fillText("N", size / 2 + xF * size / 2 * 0.8, size / 2 - yF * size / 2 * 0.8);

    // East
    xF = Math.cos((deviceRotation + 0) * Math.PI / 180);
    yF = Math.sin((deviceRotation + 0) * Math.PI / 180);
    ctx.fillText("E", size / 2 + xF * size / 2 * 0.8, size / 2 - yF * size / 2 * 0.8);

    // South
    xF = Math.cos((deviceRotation - 90) * Math.PI / 180);
    yF = Math.sin((deviceRotation - 90) * Math.PI / 180);
    ctx.fillText("S", size / 2 + xF * size / 2 * 0.8, size / 2 - yF * size / 2 * 0.8);

    // West
    xF = Math.cos((deviceRotation - 180) * Math.PI / 180);
    yF = Math.sin((deviceRotation - 180) * Math.PI / 180);
    ctx.fillText("W", size / 2 + xF * size / 2 * 0.8, size / 2 - yF * size / 2 * 0.8);
}

function drawVector()
{
    // Main line
    ctx.strokeStyle = "red";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(size / 2, size / 2);
    ctx.lineTo(size / 2 + xFactor * size / 2, size / 2 - yFactor * size / 2);
    ctx.stroke();


    // Calculate the angle of the line (for arrowhead direction)
    const arrowAngle = Math.atan2(-yFactor, xFactor); // Negative yFactor because canvas Y axis is inverted

    // Draw the arrowhead
    const headLength = 20; // Length of the arrowhead
    const headAngle = Math.PI / 6; // Angle of the arrowhead

    // Right side of the arrowhead
    ctx.beginPath();
    ctx.moveTo(size / 2 + xFactor * size / 2, size / 2 - yFactor * size / 2);
    ctx.lineTo(
        size / 2 + xFactor * size / 2 - headLength * Math.cos(arrowAngle - headAngle),
        size / 2 - yFactor * size / 2 - headLength * Math.sin(arrowAngle - headAngle)
    );
    ctx.stroke();

    // Left side of the arrowhead
    ctx.beginPath();
    ctx.moveTo(size / 2 + xFactor * size / 2, size / 2 - yFactor * size / 2);
    ctx.lineTo(
        size / 2 + xFactor * size / 2 - headLength * Math.cos(arrowAngle + headAngle),
        size / 2 - yFactor * size / 2 - headLength * Math.sin(arrowAngle + headAngle)
    );
    ctx.stroke();
}

// Given someone else latitude and longitude, find the angle the vector should point at 
function findStationaryAngle(otherLatitude, otherLongitude)
{
    console.log("Determining Vector...")

    let xDiff = otherLongitude - myLongitude;
    let yDiff = otherLatitude - myLatitude;

    let length = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

    // Normalise coordinates to ensure a length of 1
    let xStationary = xDiff / length;
    let yStationary = yDiff / length;

    // Find angle in radians
    angle = Math.atan2(yStationary, xStationary) * (180 / Math.PI);

    // Ensure angle it positive
    if(angle < 0)
    {
        angle += 360;
    }

    return angle;
}

// Adjust the canvas size based on resizing of window
function resizeCanvas()
{
    size = Math.round(0.8 * Math.min(window.innerHeight, window.innerWidth) / 8) * 8;
    canvas.height = size;
    canvas.width = size;

    render();
}

// Use geolocation API to get coordinates
function getLocation()
{
    // Get location coordinates and send to setLocation function
    if("geolocation" in navigator)
    {
        navigator.geolocation.watchPosition(setLocation, error, options);
    }
    else
    {
        console.log("Gelocation API is not available");
    }
}

// For the geolocation parameter, I think its necessary?
function error(err)
{
    if(err.code === 1) 
    {
        alert("To Enable Location: Go to Settings > Privacy & Security > Location Services > (your browser) > Select 'While Using the App'");
    }
    else
    {
        console.error(`ERROR(${err.code}): ${err.message}`);
    }
}

// Checks if a device is IOS
function isIOS()
{
    if (typeof window === `undefined` || typeof navigator === `undefined`) return false;

    return /iPhone|iPad|iPod/i.test(navigator.userAgent || navigator.vendor || (window.opera && opera.toString() === `[object Opera]`));
}



submit_if_enter = function (e) 
{
    if(e.key == 'Enter')
    {
        handleButtonClick();
    }
}

window.addEventListener('keypress', submit_if_enter)


// The Submit Button
// Request orientation permission and then also checks for a frined
async function handleButtonClick()
{
    // If first time clicking button, we have to process orientation permission separately.
    if(!hasAllowed)
    {
        await getOrientation();
        window.removeEventListener("deviceorientation", handleOrientation, true); 
    }

    // Get user input and clear box
    friend = document.getElementById('input').value;

    if(button.dataset.state === "finding")
    {
        // Stop Searching. Set state and HTML
        button.dataset.state = "not finding";
        button.innerHTML = "Start Finding Friend";
        infotext.innerHTML = "Enter a username of a friend";
        document.getElementById('input').value = "";
        isFriend = false;

        // Reset compass
        friend = "";
        deviceRotation = 0;
        xFactor = 0; 
        yFactor = 0.8;

        // Remove orientation event listener and render
        window.removeEventListener("deviceorientation", handleOrientation, true); 
        render();
    }
    else // State is "not finding"
    {
        // Check if friend exists
        isFriend = await userExists(friend);

        if(isFriend)
        {
            // Update HTML
            button.dataset.state = "finding";
            button.innerHTML = "Stop";
            infotext.innerHTML = "Locating " + friend;
            
            getOrientation();

            // Pull friend's location every 0.5 seconds
            while(button.dataset.state === "finding")
            {
                await getFriendLocation(friend);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        else // Not friend
        {
            infotext.innerHTML = "Username " + friend + " does not exist";
        }
    }
}

// Set orientation event listener if allowed
async function getOrientation() 
{
    if(isIOS())
    {
        console.log("Device is running IOS mobile...");

        return DeviceOrientationEvent.requestPermission()
        .then(response =>
        {
            if(response == "granted")
            {
                console.log("Permission Granted");
                window.addEventListener("deviceorientation", handleOrientation, true); 
                hasAllowed = true;
            }
        })
        .catch(console.error);
    }
    else
    {
        console.log("Device is not IOS mobile. Orientation can be obtained.");
        window.addEventListener("deviceorientation", handleOrientation, true); 
        hasAllowed = true;
    }
}

// Update html to reflect coordinates and send coordinates to the server
function setLocation(position)
{
    coords = position.coords;

    //sometimes the event triggers without the latitude or longitude changing.
    if(position.coords.latitude == myLatitude &&
       position.coords.longitude == myLongitude)
        return;

    myLatitude = coords.latitude;
    myLongitude = coords.longitude;

    if(button.dataset.state === "finding" || isFirstLocation)
    {
        //send position to server if on finding mode 
        isFirstLocation = false;
        position_array = ["lat", myLatitude, "lon", myLongitude, "acc", coords.accuracy]
        send_post("/API/location", http_encode(position_array));
    }

    lat_html.innerHTML = "Latitude: " + myLatitude.toFixed(6);
    long_html.innerHTML = "Longitude: " + myLongitude.toFixed(6);
    acc_html.innerHTML = "Accuracy: " + coords.accuracy.toFixed(6);
    console.log("Location set");
}

//HTTP encodes an arry where the first element is the key and the second is the 
//value, the third is the key and the fourth is the value and so on.
function http_encode(array) {

    if(array.length % 2 != 0)
        return undefined;

    let string = "";
    for(let i = 0; i < array.length; i += 2) {
        string += array[i] + "=" + array[i + 1];
        if(i < array.length - 2)
            string += "&";
    }
    return string;
}

// Function to simplify the process of sending a post request to the server
function send_post(location, payload)
{
    request = new XMLHttpRequest();     
    request.open("POST", location);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(payload)
}

async function userExists(username)
{
    // Pre check for empty string
    if(username === "")
    {
        return false;
    }

    try{
        const response = await fetch(`/API/users/${username}`, {
            method: 'GET',
        });

        if(!response.ok) {
            console.log("Failed to check for username " + friend);
            return;
        }

        const user_existence = await response.json();
        console.log(user_existence);

        return user_existence.exists;
    }
    catch(e)
    {
        console.error(e);
    }
}

// Function to retrieve your friends location 
async function getFriendLocation(username)
{
    if(username === "") return;

    try {
        const response = await fetch(`/API/location/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(!response.ok) {
            console.log("Failed to get friend location. Incorrect username.");
            return;
        }

        const friend_location = await response.json();
        console.log(friend_location);

        // Determine angle relative to you
        findStationaryAngle(friend_location.latitude, friend_location.longitude);
    }
    catch(e)
    {
        console.error(e)
    }
}

// Set html elements to acquired Device Orientation Data
function handleOrientation(event)
{
    console.log("Orientation Received.")

    let compass = event.webkitCompassHeading; // || Math.abs(event.alpha);
    
    // Angle of vector depends on orientation AND your frineds angle relative to you
    let vectorAngle = angle + compass;
    deviceRotation = compass;

    // Determien vector coordinates based of angle.
    xFactor = Math.cos(vectorAngle * Math.PI / 180) * 0.8;
    yFactor = Math.sin(vectorAngle * Math.PI / 180) * 0.8;

    render();
}
