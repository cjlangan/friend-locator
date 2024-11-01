const lat_html = document.getElementById("latitude");
const long_html = document.getElementById("longitude");
const acc_html = document.getElementById("accuracy");

const rotation = document.getElementById("rotation");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

// For debugging info on phones
const console1 = document.getElementById("console1");
const console2 = document.getElementById("console2");


// Geolocation API options
const options = {
    enableHighAccuracy: true,
    timeout: Infinity,
    maximumAge: 0,
};

let size; // dimension size of canvas

let myLatitude;
let myLongitude;

// Coordinate direction of vector. Range [-1, 1]. e.g: (1, -1) is the bottom right corner.
let xFactor = 0;
let yFactor = 1;

main() 

function main()
{
    getLocation();
    resizeCanvas();
    render();
}

function render()
{
    ctx.clearRect(0,0, canvas.width, canvas.height);
    drawVector();
}

function drawVector()
{
    // Main line
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(size / 2, size / 2);
    ctx.lineTo(size / 2 + xFactor * size / 2, size / 2 - yFactor * size / 2);
    ctx.stroke();
}

function findStationaryAngle(otherLatitude, otherLongitude)
{
    console.log("Determining Vector...")

    let xDiff = otherLongitude - myLongitude;
    let yDiff = otherLatitude - myLatitude;

    console1.innerHTML = xDiff;
    console2.innerHTML = yDiff;

    let length = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

    // Normalise coordinates to ensure a length of 1
    let xStationary = xDiff / length;
    let yStationary = yDiff / length;

    // Find angle in radians
    let angle = Math.atan2(yStationary, xStationary) * (180 / Math.PI);

    return angle;
}

window.addEventListener('resize', resizeCanvas);

function resizeCanvas()
{
    size = Math.round(0.8 * Math.min(window.innerHeight, window.innerWidth) / 8) * 8;
    canvas.height = size;
    canvas.width = size;

    render();
}

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
    console.error(`ERROR(${err.code}): ${err.message}`);
}

function isIOS()
{
    if (typeof window === `undefined` || typeof navigator === `undefined`) return false;

    return /iPhone|iPad|iPod/i.test(navigator.userAgent || navigator.vendor || (window.opera && opera.toString() === `[object Opera]`));
}

function requestOrientationPermission()
{
    console.log("Device Orientation Requested...");

    if(isIOS())
    {
        console.log("Device is running IOS mobile...");

        DeviceOrientationEvent.requestPermission()
        .then(response =>
        {
            if(response == "granted")
            {
                console.log("Permission Granted");
                window.addEventListener("deviceorientation", handleOrientation, true); 
            }
        })
        .catch(console.error)
    }
    else
    {
        console.log("Device is not IOS mobile. Orinetation can be obtained.");
        window.addEventListener("deviceorientation", handleOrientation, true); 
    }
}

// Update html to reflect coordinates
function setLocation(position)
{
    coords = position.coords;
    //sometimes the event triggers without the latitude or longitude changing.
    if(position.coords.latitude == myLatitude &&
       position.coords.longitude == myLongitude)
        return;

    myLatitude = coords.latitude;
    myLongitude = coords.longitude;

    //send position to server.
    position_array = ["lat", myLatitude, "lon", myLongitude, "acc", coords.accuracy]
    send_post("/API/location", http_encode(position_array));

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
    for(i = 0; i < array.length / 2; i++) {
        string += array[i] + "=" + array[i + 1];
        if(i != array.length / 2 - 1)
            string += "&";
    }
    return string;
}

function send_post(location, payload)
{
    request = new XMLHttpRequest();     
    request.open("POST", location);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(payload)
}


// Set html elements to acquired Device Orientation Data
function handleOrientation(event)
{
    console.log("Orientation Received.")

    let compass = event.webkitCompassHeading || Math.abs(event.alpha - 360);

    rotation.innerHTML = "Rotation: " + compass;

    let angleStationary = findStationaryAngle(49.8099, -97.13507);
    let vectorAngle = angleStationary + compass;

    xFactor = Math.cos(vectorAngle * Math.PI / 180);
    yFactor = Math.sin(vectorAngle * Math.PI / 180);

    render();
}
