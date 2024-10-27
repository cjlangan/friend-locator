const lat_html = document.getElementById("latitude");
const long_html = document.getElementById("longitude");
const acc_html = document.getElementById("accuracy");

const rotation = document.getElementById("rotation");
const left_to_right = document.getElementById("lefttoright");
const front_to_back = document.getElementById("fronttoback");

const options = {
    enableHighAccuracy: true,
    timeout: Infinity,
    maximumAge: 0,
};

main() 

function main()
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

    // Get Device Orientation
    if(window.DeviceOrientationEvent)
    {
        console.log("Retrieving Device Orientation...")

        window.addEventListener("deviceorientation", handleOrientation, true); 
    }
    else
    {
        console.error("Device Orientation is not available")
    }
}

function error(err)
{
    console.error(`ERROR(${err.code}): ${err.message}`);
}

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
