function main()
{
    let button = document.querySelector("#button")
    button.addEventListener('click', (e) => send_request())
}

function send_request() 
{
    path = "/API/users"
    request = new XMLHttpRequest();     
    request.open("POST", path)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    payload = "username=connor&password=temp"

    let infobox = document.querySelector("#info")
    request.onreadystatechange = () => {
        if(request.readystate = XMLHttpRequest.DONE) {
            infobox.textContent = request.response;
        }
    }
    request.send(payload)


}


main()
