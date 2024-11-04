function main()
{
    let button = document.querySelector("#login_btn")
    button.addEventListener('click', (event) => send_request())
}

function send_request(event) 
{
    let path = "/API/session"
    let username = document.querySelector("#username").value
    let password = document.querySelector("#password").value

    let request = new XMLHttpRequest();     
    request.open("POST", path)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    payload = "username="+username+"&password="+password

    let infobox = document.querySelector("#info")
    request.onreadystatechange = () => {
        if(request.readystate = XMLHttpRequest.DONE) {
            infobox.textContent = request.response;
        }
    }
    request.send(payload)


}


main()

