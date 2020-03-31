function toaster(message, timer) {
    var x = document.getElementById("bread");
    x.innerHTML = '<i class="gg-comment"></i><span>' + message + '</span>';
    x.className = "show";
    setTimeout(function(){ 
        x.className = x.className.replace("show", ""); 
    }, timer);
}


var form = document.querySelector("#ac-demo");
form.addEventListener("submit", function(e){
    e.preventDefault();
    var query = "You searched for: " + document.querySelector("#search").value;
    document.querySelector("#search").value = "";
    toaster(query, 4500);
});