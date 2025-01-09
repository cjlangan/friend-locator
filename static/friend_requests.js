main()

async function get_requests(incoming=true) {
    path = "/API/friend_requests/" + (incoming ? "incoming" : "outgoing")

    req = new XMLHttpRequest()

    response = await fetch(path)
    if(!response.ok) {
        return null
    }

    json = await response.json()
    console.log(json)
    return json
}

function create_incoming_request_card(name) {
    card = document.createElement("div")
    card.classList.add("request_card")
    textbox = document.createElement("div")
    textbox.style.width = "60%";
    textbox.style.height= "90%";
    textbox.style.border= "dotted";
    card.appendChild(textbox);
    accept_button = document.createElement("button")
    reject_button = document.createElement("button")
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


function main() {
    //get all incoming friend requests
    incoming_requests_box = document.querySelector("#incoming-requests")
    alert(get_requests(true))
    incoming_requests_box.appendChild(create_incoming_request_card("logan")); 
    incoming_requests_box.appendChild(create_incoming_request_card("connor")); 
    //get all outgoing friend requests
}
