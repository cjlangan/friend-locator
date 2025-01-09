main()

textbox = document.getElementById("username");

async function get_requests(incoming=true) {
    path = "/API/friend_requests/" + (incoming ? "incoming" : "outgoing")

    req = new XMLHttpRequest()

    response = await fetch(path)
    if(!response.ok) {
        return null
    }

    return await response.json()

}


//HTTP encodes an arry where the first element is the key and the second is the 
//value, the third is the key and the fourth is the value and so on.
function http_encode(array) {

    if(array.length % 2 != 0)
        return undefined;

    let string = "";
    for(let i = 0; i < array.length; i += 2) {
        string += array[i] + "=" + array[i + 1];
        if(i < array.length - 2)
            string += "&";
    }
    return string;
}


// Function to simplify the process of sending a post request to the server
function send_post(location, payload)
{
    request = new XMLHttpRequest();     
    request.open("POST", location);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(payload)
}


async function send_friend_request() {
    let name_array = ["name", textbox.value];
    console.log(textbox.value);
    console.log(http_encode(name_array));
    send_post("/API/friend", http_encode(name_array));
}


function create_incoming_request_card(name) {
    card = document.createElement("div")
    card.classList.add("request_card")
    textbox = document.createElement("div")
    textbox.style.width = "60%";
    textbox.style.height= "90%";
    textbox.style.border= "dotted";
    card.appendChild(textbox);
    accept_button = document.createElement("div")
    reject_button = document.createElement("div")
    accept_button.classList.add("request_button")
    reject_button.classList.add("request_button")
    button_text_box1 = document.createElement("div")
    button_text_box2 = document.createElement("div")
    accept_button.appendChild(button_text_box1)
    reject_button.appendChild(button_text_box2)
    button_text_box1.innerText = "✓"
    button_text_box2.innerText = "x"
    card.appendChild(accept_button);
    card.appendChild(reject_button);
    return card;
}

function get_requests(container) {

    container.innerHTML = null;

    req = new XMLHttpRequest()
    req.open("GET", "/API/friend_requests/incoming")

    req.onreadystatechange = () => {
        if(req.readystate = XMLHttpRequest.DONE) {
            if(req.status == 200) {
                if(req.responseText == []) {
                    container.textContent = "No incoming requests."
                } else {
                    container.textContent = req.responseText                
                }
            } else {
                container.textContent = "Error fetching incoming friend requests."
            }
        }
    }
    req.send()
}

submit_if_enter = function (e) 
{
    if(e.key == 'Enter')
    {
        send_friend_request();
    }
}

window.addEventListener('keypress', submit_if_enter)




function main() {
    //get all incoming friend requests
    incoming_requests_box = document.querySelector("#incoming-requests")
    get_requests(true)
    incoming_requests_box.appendChild(create_incoming_request_card("logan")); 
    incoming_requests_box.appendChild(create_incoming_request_card("connor")); 
    //get all outgoing friend requests
}
