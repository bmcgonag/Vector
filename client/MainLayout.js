import { WGInstalled } from '../imports/api/wgInstalled.js';
import { Control } from '../imports/api/control.js';
import { ServerInfo } from '../imports/api/serverInfo.js';

Template.MainLayout.onCreated(function() {
    this.subscribe("wgInstall");
    this.subscribe("myControl");
    this.subscribe("myServerInfo");
});

Template.MainLayout.onRendered(function() {
    Session.set("ip6pattern", "fd00::10:10:");
});

Template.MainLayout.helpers({
    wgInstall: function() {
        return WGInstalled.findOne({});
    },
    serverSetup: function() {
        let serverSet = ServerInfo.findOne({});
        if (typeof serverSet == 'undefined') {
            return false;
        } else {
            return true;
        }
    },
});

Template.MainLayout.events({
    "click .fixMPW" (event) {
        event.preventDefault();
        FlowRouter.go('/configSystem');
    },
    "click .fixServer" (event) {
        event.preventDefault();
        let control = Session.get("control");
        if (control == false) {
            showSnackbar("Please Add the Sudo Password first", "orange");
            return;
        } else {
            FlowRouter.go('/serverConfig');
        }
    },
    "click .fixWGInstall" (event) {
        event.preventDefault();
        let control = Session.get("control");
        if (control == false) {
            showSnackbar("Please Add the Sudo Password first.", "orange");
            return;
        } else {
            Meteor.call("install.wg", function(err, result) {
                if (err) {
                    conssole.log("Error while installing Wireguard: " + err);
                    showSnackbar("Error Installing Wireguard", "red");
                } else {
                    showSnackbar("Wireguard is being installed, please stand by.", "green");
                }
            });
        }
    },
});