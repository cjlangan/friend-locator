function main()
{
    let button = document.querySelector("#create_account_bttn")
    button.addEventListener('click', (event) => send_request())
}

function send_request(event) 
{
    let path = "/API/users"
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
