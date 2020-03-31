// Autocomplyeet 1.0 - https://github.com/tylerbruin/autocomplyeet
function ajaxRequest(e,t,n,a){let s=new XMLHttpRequest;s.open(e,t,!0),"POST"==e&&s.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),s.onreadystatechange=function(){if(4==s.readyState&&200==s.status){let e=s.responseText;a(e)}},s.send(n)}

function autocomplyeet(searchParams){

    // Identify input & manipulate
    const input = document.querySelector(searchParams.id);
    input.setAttribute("autocomplete", "off");

    // Create Autocomplete Elements
    const autocomplete = document.createElement("ul");
    autocomplete.setAttribute("id", "ac-list");
    
    // Create Wrapper Element / Autocomplete Structure
    const ac_container = document.createElement("div");
    ac_container.classList.add("ac-container");
    input.parentNode.insertBefore(ac_container, input);
    
    const ac_querySuggestion = document.createElement("pre");
    ac_querySuggestion.setAttribute("id", "ac-querySuggestion");
    ac_container.appendChild(ac_querySuggestion);
    ac_container.appendChild(input);
    ac_container.appendChild(autocomplete);

    // Style query suggestion element
    ac_querySuggestion.style.font = window.getComputedStyle(input, null).getPropertyValue("font");
    ac_querySuggestion.style.background = window.getComputedStyle(input, null).getPropertyValue("background");
    input.style.backgroundColor = "transparent";
    ac_querySuggestion.style.letterSpacing = window.getComputedStyle(input, null).getPropertyValue("letter-spacing");
    ac_querySuggestion.style.padding = window.getComputedStyle(input, null).getPropertyValue("padding");
    var ac_querySuggestion_padding = parseInt(window.getComputedStyle(input, null).getPropertyValue("border-left-width")) + parseInt(window.getComputedStyle(input, null).getPropertyValue("margin-left")) + parseInt(window.getComputedStyle(input, null).getPropertyValue("padding-left"));
    ac_querySuggestion.style.paddingLeft = ac_querySuggestion_padding + "px";
    

    // Focus Out Event
    input.addEventListener("focusout", function(e){
        if (e.relatedTarget == null) {
            autocomplete.innerHTML = "";
            ac_querySuggestion.innerText = "";
        } else if (e.relatedTarget.className !== "ac-item") {
            autocomplete.innerHTML = "";
            ac_querySuggestion.innerText = "";
        }
    });

    // Text Input Event
    input.addEventListener("input", function(){

        if (input.value.length > 2) {

            // Send request
            var url = searchParams.server + input.value;

            ajaxRequest("GET", url, null, function(response){
                var data = JSON.parse(response);
                
                if (data.length > 0) {

                    // Morph Data to correct casing
                    var ac_suggest = data[0];
                    ac_suggest = ac_suggest.substring(input.value.length);
                    ac_suggest = input.value + ac_suggest;

                    ac_querySuggestion.innerText =  ac_suggest;
                    autocomplete.innerHTML = "";
                    autocomplete.style.width = input.offsetWidth + "px";

                    // Print suggestions
                    for(var i=0;i<data.length;i++){
                        var item = document.createElement("li");

                        var output = data[i].replace(new RegExp('(' + input.value.toLowerCase() + ')'), '<span class="ac-highlight">'+ input.value +'</span>');
                        item.innerHTML = output;
                        item.setAttribute("tabindex", "1");
                        item.classList.add("ac-item");
                        autocomplete.appendChild(item);

                        item.addEventListener("keydown", function(e){
                            if (e.key == "ArrowDown") {
                                e.preventDefault();
                                this.nextSibling.focus();
                            } else if (e.key == "ArrowUp"){
                                if (this.previousSibling !== null ){
                                    e.preventDefault();
                                    this.previousSibling.focus();
                                } else {
                                    input.focus();
                                }
                            } else if (e.key == "Enter") {
                                e.preventDefault();
                                ac_querySuggestion.innerText = "";
                                input.value = this.innerText;
                                input.focus();
                            }
                        });

                        item.addEventListener("click", function(e){
                            input.value = this.innerText;
                            autocomplete.innerHTML = "";
                            ac_querySuggestion.innerText = "";
                            input.focus();
                        });

                        item.addEventListener("focusout", function(e){
                            if (e.relatedTarget == null) {
                                autocomplete.innerHTML = "";
                                ac_querySuggestion.innerText = "";
                            } else if (e.relatedTarget.className == "ac-item" || e.relatedTarget.id == "search") { 
                                return false;
                            } else {
                                autocomplete.innerHTML = "";
                                ac_querySuggestion.innerText = "";
                            }

                        });
                    } 
                } else {
                    autocomplete.innerHTML = "";
                    ac_querySuggestion.innerText = "";
                }

            });
        } else {
            autocomplete.innerHTML = "";
            ac_querySuggestion.innerText = "";
        }

    });

    input.addEventListener("keydown", function(e){
        if (input.value.length > 2 && e.key == "ArrowDown" && document.querySelector("#ac-list li") !== null) {
            e.preventDefault();
            document.querySelector("#ac-list li:first-child").focus();
        }
    });

}