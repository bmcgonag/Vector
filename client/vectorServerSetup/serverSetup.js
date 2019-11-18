
Template.serverSetup.onCreated(function() {

});

Template.serverSetup.onRendered(function() {

});

Template.serverSetup.helpers({

});

Template.serverSetup.events({
    "click #autoSetup" (event) {
        event.preventDefault();
        // setup the wg0.conf file with default settings for a
        // Wireguard server with full NAT through the server
        Meteor.call("createServer.Interface", "auto", "10.100.100.1", "wg0-test", "51820", function(err, result) {
            if (err) {
                console.log("Error auto creating the server interface: " + err);
                showSnackbar("Error Auto Creating Server Interface!", "red");
            } else {
                showSnackbar("Creating Server Interface!", "green");
            }
        });
    },
    "click #manualSetup" (event) {
        event.preventDefault();
        // expose a form to gather necessary information for setting
        // up the Wireguard server for the user with their proeffered
        // IPv4 Address
        
    },
});