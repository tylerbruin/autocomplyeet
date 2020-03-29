function ajaxRequest(e,t,n,a){let s=new XMLHttpRequest;s.open(e,t,!0),"POST"==e&&s.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),s.onreadystatechange=function(){if(4==s.readyState&&200==s.status){let e=s.responseText;a(e)}},s.send(n)}

document.addEventListener("DOMContentLoaded", function(){

    // Identify input & manipulate
    const input = document.querySelector("#search");
    input.setAttribute("autocomplete", "off");

    // Create Autocomplete Elements
    const autocomplete = document.createElement("ul");
    autocomplete.setAttribute("id", "ac-list");
    
    // Create Wrapper Element / Autocomplete Structure
    const ac_container = document.createElement("div");
    ac_container.classList.add("ac-container");
    input.parentNode.insertBefore(ac_container, input);
    ac_container.appendChild(input);
    ac_container.appendChild(autocomplete);
    // var input_bg = input.style.backgroundColor  ? input.style.backgroundColor : "#fff";
    // ac_container.style.backgroundColor = "#fff";
    // input.style.backgroundColor = "transparent";


    
    // Focus Out Event
    input.addEventListener("focusout", function(){
        autocomplete.innerHTML = "";
        ac_container.setAttribute('data-before', "");
    });

    // Text Input Event
    input.addEventListener("input", function(){
        // console.log("Input detected!");

        if (input.value.length > 2) {

            // Send request
            var url = "https://squiznz-dev-search.squiz.cloud/s/suggest.json?collection=FbNeoDemo&show=10&partial_query=" + input.value;

            ajaxRequest("GET", url, null, function(response){
                // console.log("response = ", response);
                var data = JSON.parse(response);
                
                if (data.length > 0) {

                    ac_container.setAttribute('data-before', data[0]);

                    autocomplete.innerHTML = "";
                    autocomplete.style.width = input.offsetWidth + "px";

                    // Print suggestions
                    for(var i=0;i<data.length;i++){
                        var item = document.createElement("li");
                        item.innerText = data[i];
                        item.setAttribute("tabindex", "1");
                        autocomplete.append(item);
                    }
                } else {
                    autocomplete.innerHTML = "";
                    ac_container.setAttribute('data-before', "");
                }

            });
        } else {
            autocomplete.innerHTML = "";
            ac_container.setAttribute('data-before', "");
        }

    });

});