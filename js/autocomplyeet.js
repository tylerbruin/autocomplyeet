// Autocomplyeet 2.0 - https://github.com/tylerbruin/autocomplyeet
window.autocomplyeet = {
    options: {
        id: "",
        server: "",
        cache: 15,
        cloneCSS: true,
    },
    vars: {},
    cache: {},
    fn: {}
}

autocomplyeet.fn.init = function () {


    // if IE11, Disable Query Finisher as we like to support IE11 but also we kinda dont.
    var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
    if(isIE11) {
        autocomplyeet.options.cloneCSS = false;
    }


    autocomplyeet.vars.input = document.querySelector(autocomplyeet.options.id);
    autocomplyeet.vars.input.setAttribute("autocomplete", "off");
    autocomplyeet.vars.input.style.backgroundColor = "transparent";

    // Create Autocomplete Elements
    autocomplyeet.vars.list = document.createElement("ul");
    autocomplyeet.vars.list.setAttribute("id", "ac-list");

    // Create Wrapper Element / Autocomplete Structure
    autocomplyeet.vars.container = document.createElement("div");
    autocomplyeet.vars.container.classList.add("ac-container");
    autocomplyeet.vars.input.parentNode.insertBefore(autocomplyeet.vars.container, autocomplyeet.vars.input);

    if (autocomplyeet.options.cloneCSS) {
        autocomplyeet.vars.styles = document.createElement("style");
        autocomplyeet.vars.styles.type = 'text/css';
        autocomplyeet.fn.cloneCSS();
        
        // autocomplyeet.vars.querySuggestion.style.width = autocomplyeet.vars.input.clientWidth + "px";
    }

    if(!isIE11) {
        // Query Finisher, Create Fake Input to display query suggestion
        autocomplyeet.vars.querySuggestion = document.createElement("input");
        autocomplyeet.vars.querySuggestion.setAttribute("id", "ac-querySuggestion");
        autocomplyeet.vars.querySuggestion.setAttribute("tabIndex", -1);
        autocomplyeet.vars.querySuggestion.setAttribute("readonly", true);
        autocomplyeet.vars.querySuggestion.setAttribute("aria-hidden", true);
    }



    // Reassemble the DOM
    autocomplyeet.vars.container.appendChild(autocomplyeet.vars.styles);
    autocomplyeet.vars.container.appendChild(autocomplyeet.vars.querySuggestion);
    autocomplyeet.vars.container.appendChild(autocomplyeet.vars.input);
    autocomplyeet.vars.container.appendChild(autocomplyeet.vars.list);


    //* All Event Listeners Below

    // Focus Out Event
    autocomplyeet.vars.input.addEventListener("focusout", function (e) {
        if (e.relatedTarget == null) {
            autocomplyeet.vars.list.innerHTML = "";
            autocomplyeet.vars.querySuggestion.value = "";
        } else if (e.relatedTarget.className !== "ac-item") {
            autocomplyeet.vars.list.innerHTML = "";
            autocomplyeet.vars.querySuggestion.value = "";
        }
    });

    // Text Input Event
    autocomplyeet.vars.input.addEventListener("input", function () {

        if (autocomplyeet.vars.input.value.length > 2) {

            // If query length is large enough to scroll, then break;
            if(autocomplyeet.vars.input.scrollWidth > autocomplyeet.vars.input.offsetWidth) {
                console.log("length too large, cancel");
                autocomplyeet.vars.querySuggestion.value = "";
                return false;
            }

            // Request new data
            var url = autocomplyeet.options.server + autocomplyeet.vars.input.value;
            var cacheHandle = autocomplyeet.vars.input.value.toLowerCase().replace(/\s/g, "");
            var data = [];

            if (autocomplyeet.cache[cacheHandle] !== undefined) {
                // console.log("Cached Status", true, cacheHandle);
                data = autocomplyeet.cache[cacheHandle];
                autocomplyeet.fn.handleResponse(data);

            } else {
                // console.log("Cached Status", false, cacheHandle);

                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) {

                        data = JSON.parse(xhr.response);
                        // Send Data to handler
                        autocomplyeet.fn.handleResponse(data);
                        // Cache response data;
                        autocomplyeet.cache[cacheHandle] = data;

                    } else {
                        console.log('Failed to fetch autocomplete data');
                    }
                };
                xhr.open('GET', url);
                xhr.send();


            }
            autocomplyeet.fn.clearCache(autocomplyeet.options.cache);
        } else {
            autocomplyeet.vars.list.innerHTML = "";
            autocomplyeet.vars.querySuggestion.value = "";
        }

    });


    autocomplyeet.vars.input.addEventListener("keydown", function (e) {
        if (autocomplyeet.vars.input.value.length > 2 && e.keyCode == "40" && document.querySelector("#ac-list li") !== null) {
            e.preventDefault();
            document.querySelector("#ac-list li:first-child").focus();
        }
    });

    if (autocomplyeet.options.cloneCSS) {
        var timeout;
        window.addEventListener("resize", function () {
            if (!timeout) {
                timeout = setTimeout(function () {
                    timeout = null;
                    autocomplyeet.fn.cloneCSS();
                }, 200);
            }
        }, false);
    }

}

autocomplyeet.fn.cloneCSS = function () {
    var cssText = document.defaultView.getComputedStyle(autocomplyeet.vars.input, "").cssText;
    autocomplyeet.vars.styles.innerHTML = "#ac-querySuggestion {" + cssText + "}";
}


autocomplyeet.fn.clearCache = function (size) {
    // If cache length is over set value, delete the first item default 15
    if (!size) {
        size = 15;
    }

    var cacheLength = Object.keys(autocomplyeet.cache).length;
    if (cacheLength > size) {
        var dropItem = Object.keys(autocomplyeet.cache)[0];
        // console.log("Clearing item from cache", dropItem);
        delete autocomplyeet.cache[dropItem];
    }
}

// Handle Data, plus send in 
autocomplyeet.fn.handleResponse = function (data) {

    if (data.length > 0) {
        // Morph Data to correct casing
        var ac_suggest = data[0];
        ac_suggest = ac_suggest.substring(autocomplyeet.vars.input.value.length);
        ac_suggest = autocomplyeet.vars.input.value + ac_suggest;

        autocomplyeet.vars.querySuggestion.value = ac_suggest;
        autocomplyeet.vars.list.innerHTML = "";
        autocomplyeet.vars.list.style.width = autocomplyeet.vars.input.offsetWidth + "px";

        // Print suggestions
        for (var i = 0; i < data.length; i++) {
            var item = document.createElement("li");

            var output = data[i].replace(new RegExp('(' + autocomplyeet.vars.input.value.toLowerCase() + ')'), '<span class="ac-highlight">' + autocomplyeet.vars.input.value + '</span>');
            item.innerHTML = output;
            item.setAttribute("tabindex", "1");
            item.classList.add("ac-item");
            autocomplyeet.vars.list.appendChild(item);

            item.addEventListener("keydown", function (e) {
                if (e.keyCode == "40") {
                    e.preventDefault();
                    this.nextSibling.focus();
                } else if (e.keyCode == "38") {
                    if (this.previousSibling !== null) {
                        e.preventDefault();
                        this.previousSibling.focus();
                    } else {
                        autocomplyeet.vars.input.focus();
                    }
                } else if (e.keyCode == "13") {
                    e.preventDefault();
                    autocomplyeet.vars.querySuggestion.value = "";
                    autocomplyeet.vars.input.value = this.innerText;
                    autocomplyeet.vars.input.focus();
                }
            });

            item.addEventListener("click", function (e) {
                autocomplyeet.vars.input.value = this.innerText;
                autocomplyeet.vars.list.innerHTML = "";
                autocomplyeet.vars.querySuggestion.value = "";
                autocomplyeet.vars.input.focus();
            });

            item.addEventListener("focusout", function (e) {
                if (e.relatedTarget == null) {
                    autocomplyeet.vars.list.innerHTML = "";
                    autocomplyeet.vars.querySuggestion.value = "";
                } else if (e.relatedTarget.className == "ac-item" || e.relatedTarget.id == "search") {
                    return false;
                } else {
                    autocomplyeet.vars.list.innerHTML = "";
                    autocomplyeet.vars.querySuggestion.value = "";
                }

            });
        }
    } else {
        autocomplyeet.vars.list.innerHTML = "";
        autocomplyeet.vars.querySuggestion.value = "";
    }

}
