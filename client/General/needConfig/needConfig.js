import { Configuration } from '../../../imports/api/configuration.js';
import { WGInstalled } from '../../../imports/api/wgInstalled.js';
import { Control } from '../../../imports/api/control.js';
import { ServerInfo } from '../../../imports/api/serverInfo.js';

Template.needConfig.onCreated(function() {
    this.subscribe("configuration");
    this.subscribe("wgInstall");
    this.subscribe("myControl");
    this.subscribe("myServerInfo");
});

Template.needConfig.onRendered(function() {

});

Template.needConfig.helpers({
    myConfig: function() {
        let myconfig = Configuration.findOne({});
        if (typeof myconfg == 'undefined' || myconfig == null || myconfig == "") {
            return false;
        } else {
            return true;
        }
    },
    myServerConfig: function() {
        let config = Configuration.findOne({});
        if (config) {
            return config.allowOwnNetwork;
        }
    },
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

Template.needConfig.events({
    "click .fixMPW" (event) {
        event.preventDefault();
        FlowRouter.go('/configSystem');
    },
    "click .fixServer" (event) {
        event.preventDefault();
        FlowRouter.go('/serverConfig');
    },
    "click .fixWGInstall" (event) {
        event.preventDefault();
        Meteor.call("install.wg", function(err, result) {
            if (err) {
                conssole.log("Error while installing Wireguard: " + err);
                showSnackbar("Error Installing Wireguard", "red");
            } else {
                showSnackbar("Wireguard is being installed, please stand by.", "green");
            }
        });
    },
    "click #configSystem" (event) {
        event.preventDefault();
        FlowRouter.go('/configSystem');

    },
});
