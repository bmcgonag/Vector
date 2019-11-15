// This is called to display a temporary message to the user at the bottom of the screen

showSnackbar = function(snackbarText, snackbarColor) {
    var snackbbarNotification = document.getElementById("snackbar");
    snackbbarNotification.innerHTML = snackbarText;
    snackbbarNotification.style.backgroundColor = snackbarColor;
    snackbbarNotification.className = "show";
    setTimeout(function() {
        snackbbarNotification.className = snackbbarNotification.className.replace("show", "");
    }, 4500)
}