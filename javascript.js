const latitude = document.getElementById("latitude");
const longitude = document.getElementById("longitude");

if("geolocation" in navigator)
{
    navigator.geolocation.getCurrentPosition((position) =>
    {
        latitude.innerHTML = "Latitude: " + position.coords.latitude
        longitude.innerHTML = "Longitude: " + position.coords.longitude
    });
}
else
{
    console.log("Gelocation API is not available")
}


