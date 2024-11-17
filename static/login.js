function main()
{
    let button = document.querySelector("#login_btn")
    button.addEventListener('click', (event) => send_request())

    submit_if_enter = function (e) {
        if(e.key == 'Enter') {
            send_request()
        }
    }

    let username = document.querySelector("#username")
    let password = document.querySelector("#password")
    username.addEventListener('keypress', submit_if_enter)
    password.addEventListener('keypress', submit_if_enter)
    
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
            if(request.status == 200) {
                window.location = "/homepage"; 
            } else {
                infobox.textContent = "Invalid username or password";
            }
        }
    }
    request.send(payload)


}


main()

