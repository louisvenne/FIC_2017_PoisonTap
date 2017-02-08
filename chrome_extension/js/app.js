/*
*
*   POISONTAP COOKIE MANAGER
*
*   By Pandhack & drouar_b
*
* */

var     json_file = null;


document.addEventListener('DOMContentLoaded', function() {

    var     checkbox = document.querySelector('.js-switch');

    if (!(localStorage.getItem("enable_poisontap_cookies") == "false"))
      checkbox.setAttribute("checked", "");

    var     switchery = new Switchery(checkbox);

    console.log(checkbox.checked);
    localStorage.setItem("enable_poisontap_cookies", checkbox.checked);

    /* To enable poisontap cookies use */
    checkbox.onchange = function() {
        localStorage.setItem("enable_poisontap_cookies", checkbox.checked);
        console.log(localStorage.getItem("enable_poisontap_cookies"));
    };

    /* To load poisontap.cookie.log */
    document.getElementById("fct_file_loading").addEventListener("click", load_pt_file);

});


/*
**  Function to load file and set json_file var
*/
function        load_pt_file(event) {
    var         input;
    var         file;
    var         fr;

    if (typeof window.FileReader !== 'function') {
    console.log("The file API isn't supported on this browser yet.");
    return;
    }
    input = document.getElementById('file_input');
    if (!input)
    console.log("Um, couldn't find the fileinput element.");
    else if (!input.files)
    console.log("This browser doesn't seem to support the `files` property of file inputs.");
    else if (!input.files[0])
    console.log("Please select a file before clicking 'Load'");
    else {
      file = input.files[0];
      console.log(file);
      fr = new FileReader();
      fr.onload = to_json_local_storage;
      fr.readAsText(file);
    }
}

/*
**  Store all cookies found on the file load in HTML5 localStorage
*/
function        to_json_local_storage(e) {
    var         cookies = {};

    lines = e.target.result;
    json_file = JSON.parse(lines);

    for (i = 0; i < json_file.length; ++i) {
        var item = json_file[i];

        if (item.hasOwnProperty("cookie") && item.hasOwnProperty("host")) {
            cookies[item.host] = item.cookie;
        }
    }
    localStorage.setItem("cookies", JSON.stringify(cookies));
    cookies = localStorage.getItem("cookies");
    console.log(JSON.parse(cookies));
};


