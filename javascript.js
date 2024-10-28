const lat_html = document.getElementById("latitude");
const long_html = document.getElementById("longitude");
const acc_html = document.getElementById("accuracy");

const rotation = document.getElementById("rotation");
const left_to_right = document.getElementById("lefttoright");
const front_to_back = document.getElementById("fronttoback");

const canvas = document.getElementById("canvas");

// Geolocation API options
const options = {
    enableHighAccuracy: true,
    timeout: Infinity,
    maximumAge: 0,
};

main() 

function main()
{
    getLocation();
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
    lat_html.innerHTML = "Latitude: " + position.coords.latitude;
    long_html.innerHTML = "Longitude: " + position.coords.longitude;
    acc_html.innerHTML = "Accuracy: " + position.coords.accuracy;
    console.log("Location set");
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
}
