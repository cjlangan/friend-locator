const lat_html = document.getElementById("latitude");
const long_html = document.getElementById("longitude");
const acc_html = document.getElementById("accuracy");

const rotation = document.getElementById("rotation");
const left_to_right = document.getElementById("lefttoright");
const front_to_back = document.getElementById("fronttoback");

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

// Coordinate direction of vector. Range [-1, 1]. e.g: (1, -1) is the bottom right corner.
let xFactor = 0;
let yFactor = 0.5;

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
    ctx.beginPath();
    ctx.moveTo(size / 2, size / 2);
    ctx.lineTo(size / 2 + xFactor * size / 2, size / 2 - yFactor * size / 2);
    ctx.stroke();
}

function calculateVector(otherLatitude, otherLongitude)
{
    console.log("Determining Vector...")

    let xDiff = otherLongitude - myLongitude;
    let yDiff = otherLatitude - myLatitude;

    let length = Math.sqrt(xDiff ^ 2 + yDiff ^ 2);

    xFactor = xDiff / length;
    yFactor = yDiff / length;

    console.log("x: " + xFactor + "\ny: " + yFactor);

    render();
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
    myLatitude = position.coords.latitude;
    myLongitude = position.coords.longitude;

    lat_html.innerHTML = "Latitude: " + myLatitude;
    long_html.innerHTML = "Longitude: " + myLongitude;
    acc_html.innerHTML = "Accuracy: " + position.coords.accuracy;
    console.log("Location set");

    calculateVector(0, 0);
}

// Set html elements to acquired Device Orientation Data
function handleOrientation(event)
{
    let rotateDegrees = event.alpha;    // rotation around Z-axis
    let leftToRight = event.gamma;      // Range [-90, 90]
    let frontToBack = event.beta;       // Range [-180, 180]

    console.log("Orientation Received.")

    rotation.innerHTML = "Rotation: " + rotateDegrees;
    left_to_right.innerHTML = "Left to Right: " + leftToRight;
    front_to_back.innerHTML = "Front to Back: " + frontToBack;

    //xFactor = Math.cos(rotateDegrees * Math.PI / 180);
    //yFactor = Math.sin(rotateDegrees * Math.PI / 180);
    
    render();
}
