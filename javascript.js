const lat_html = document.getElementById("latitude");
const long_html = document.getElementById("longitude");
const acc_html = document.getElementById("accuracy");

const options = {
    enableHighAccuracy: true,
    timeout: Infinity,
    maximumAge: 0,
};

if("geolocation" in navigator)
{
    navigator.geolocation.watchPosition(setLocation, error, options);
}
else
{
    console.log("Gelocation API is not available");
}

function error(err)
{
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

function setLocation(position)
{
    lat_html.innerHTML = "Latitude: " + position.coords.latitude;
    long_html.innerHTML = "Longitude: " + position.coords.longitude;
    acc_html.innerHTML = "Accuracy: " + position.coords.accuracy;
    console.log("Location set");
}
