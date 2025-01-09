main()

async function get_requests(incoming=true) {
    path = "/API/friend_requests/" + (incoming ? "incoming" : "outgoing")

    req = new XMLHttpRequest()

    response = await fetch(path)
    if(!response.ok) {
        return null
    }

    return await response.json()

}

function create_incoming_request_card(name) {
    card = document.createElement("div")
    card.classList.add("request_card")
    textbox = document.createElement("div")
    textbox.style.width = "60%";
    textbox.style.height= "90%";
    textbox.style.border= "dotted";
    card.appendChild(textbox);
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


function main() {
    //get all incoming friend requests
    incoming_requests_box = document.querySelector("#incoming-requests")
    get_requests(true)
    incoming_requests_box.appendChild(create_incoming_request_card("logan")); 
    incoming_requests_box.appendChild(create_incoming_request_card("connor")); 
    //get all outgoing friend requests
}
