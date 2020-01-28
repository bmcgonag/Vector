import { ServerInfo } from '../../imports/api/serverInfo.js';

Template.serverSetup.onCreated(function() {
    this.subscribe("myServerInfo");
});

Template.serverSetup.onRendered(function() {
    Session.set("showManualSetup", false);
    setTimeout(function(){
        let infoExists = ServerInfo.findOne({});
        if (typeof infoExists == 'undefined' || infoExists == "" || infoExists == null) {
            console.log("didn't find server info");
            Session.set("adjustServer", true);
        } else {
            console.log("found server info");
            Session.set("adjustServer", false);
        }
    }, 200);
});

Template.serverSetup.helpers({
    showManual: function() {
        return Session.get("showManualSetup");
    },
    serverExists: function() {
        let infoExists = ServerInfo.findOne({});
        if (typeof infoExists == 'undefined' || infoExists == "" || infoExists == null) {
            return false;
        } else {
            return true;
        }
    },
    adjustServer: function() {
        return Session.get("adjustServer");
    },
});

Template.serverSetup.events({
    "click #autoSetup" (event) {
        event.preventDefault();
        // setup the wg0.conf file with default settings for a
        // WireGuard server with full NAT through the server
        Meteor.call("createServer.Interface", "auto", "10.100.100.1", "wg0", "51820", function(err, result) {
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
        // up the WireGuard server for the user with their proeffered
        // IPv4 Address
        Session.set("showManualSetup", true);
    },
    "click #hideManualSetup" (event) {
        event.preventDefault();
        Session.set("showManualSetup", false);
    },
    "click #adjustServer" (event) {
        event.preventDefault();
        Session.set("adjustServer", true);
    },
});