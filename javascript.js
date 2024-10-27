const lat_html = document.getElementById("latitude");
const long_html = document.getElementById("longitude");
const acc_html = document.getElementById("accuracy");

main()

function main()
{
    if("geolocation" in navigator)
    {
        navigator.geolocation.watchPosition(setLocation);
    }
    else
    {
        console.log("Gelocation API is not available");
    }
}

function setLocation(position)
{
    lat_html.innerHTML = "Latitude: " + position.coords.latitude;
    long_html.innerHTML = "Longitude: " + position.coords.longitude;
    acc_html.innerHTML = "Accuracy: " + position.coords.accuracy;
    console.log("Location set");
}
