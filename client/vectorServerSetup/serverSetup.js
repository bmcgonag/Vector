import { ServerInfo } from '../../imports/api/serverInfo.js';
import { WGInstalled } from '../../imports/api/wgInstalled.js';

Template.serverSetup.onCreated(function() {
    this.subscribe("myServerInfo");
    this.subscribe("wgInstall");
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
    wireguardInstalled: function() {
        let installed = WGInstalled.findOne({});
        if (installed.typeInstall != "apt") {
            return "Not Installed";
        } else {
            return "Installed";
        }
    },
});

Template.serverSetup.events({
    "click #autoSetup" (event) {
        event.preventDefault();

        let setupType="auto";
        let ipv4Server = "10.100.100.1";
        let serverIntName = "wg0";
        let serverListenPort = "51820"

        Meteor.call("createServer.Interface", setupType, ipv4Server, serverIntName, serverListenPort, function(err, result) {
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
    "click #installWireguard" (event) {
        event.preventDefault();

        Meteor.call('install.wireguard', "ubuntu 20.04", function(err, result) {
            if (err) {
                console.log("Error calling install.wireguard method in server/methods.js: " + err);
            } else {
                console.log("Wireguard install called.");
            }
        });
    },
});