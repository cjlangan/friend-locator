main()

textbox = document.getElementById("username");

async function get_requests(incoming=true) {
    path = "/API/friend_requests/" + (incoming ? "incoming" : "outgoing")

    response = await fetch(path)
    if(!response.ok) {
        return null
    }

    json = await response.json()
    return json
}

function create_incoming_request_card(name) {
    const card = document.createElement("div")
    card.classList.add("request_card")
    //setup textbox
    const textbox = document.createElement("div")
    textbox.classList.add("friend_request_textbox")
    const textbox_inner_box = document.createElement("div");
    textbox.appendChild(textbox_inner_box);
    textbox_inner_box.textContent = name
    card.appendChild(textbox);

    //buttons
    const accept_button = document.createElement("button")
    const reject_button = document.createElement("button")
    accept_button.classList.add("request_button")
    reject_button.classList.add("request_button")
    const button_text_box1 = document.createElement("div")
    const button_text_box2 = document.createElement("div")
    accept_button.appendChild(button_text_box1)
    reject_button.appendChild(button_text_box2)
    button_text_box1.innerText = "✓"
    button_text_box2.innerText = "x"
    card.appendChild(accept_button);
    card.appendChild(reject_button);

    reject_button.addEventListener("click", () => remove_card(card));
    accept_button.addEventListener("click", () => remove_card(card));

    return card;
}

function remove_card(card) {
    card.remove();
    let name = card.children[0].innerText;
    console.log(name);
    send_delete("/API/friend/" + name);
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
function send_post(location, payload, fcn=null)
{
    request = new XMLHttpRequest();     
    request.open("POST", location);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(payload)
    return request
}

// Function to simplify the process of sending a post request to the server
function send_delete(location)
{
    request = new XMLHttpRequest();     
    request.open("DELETE", location);
    //request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send()
}

function accept_friend(card) {
    card.remove();
    let name = card.children[0].innerText;
    textbox.value = name
    send_friend_request()
    textbox.value = "";
    
}
async function send_friend_request() {
    let name_array = ["name", textbox.value];

    request = new XMLHttpRequest();     
    request.open("POST", "/API/friend");
    request.onreadystatechange = () => {
    // In local files, status is 0 upon success in Mozilla Firefox
        if (request.readyState === XMLHttpRequest.DONE) {
            const status = request.status;
            if (status === 0 || (status >= 200 && status < 400)) {
                alert("Sent friend request")
            } else {
                alert(request.responseText)
            }
        }
    };
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(http_encode(name_array))
    return request
}

submit_if_enter = function (e) 
{
    if(e.key == 'Enter')
    {
        send_friend_request();
    }
}

window.addEventListener('keypress', submit_if_enter)

async function main() {
    //get all incoming friend requests
    incoming_requests_box = document.querySelector("#incoming-requests")
    incoming_requests = await get_requests(true)
    for(i = 0; i < incoming_requests.length; i++) {
        incoming_requests_box.appendChild(create_incoming_request_card(incoming_requests[i])); 
    }
}
