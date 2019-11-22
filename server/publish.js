import { Interfaces } from '../imports/api/interfaces.js';
import { Configuration } from '../imports/api/configuration.js';
import { InterfaceGroups } from '../imports/api/interfaceGroups.js';
import { ServerInfo } from '../imports/api/serverInfo.js';
import { Control } from '../imports/api/control.js';
import { WGInstalled } from '../imports/api/wgInstalled.js';

Meteor.publish("myInterfaces", function() {
    try {
        return Interfaces.find({ interfaceUserId: this.userId });
    } catch (error) {
        console.log("Error publishing interfaces: " + error);
    }
});

Meteor.publish("configuration", function() {
    try {
        return Configuration.find({});
    } catch(err) {
        console.log("Error publishing configuration: " + err);
    }
});

Meteor.publish("myGroups", function() {
    try {
        return InterfaceGroups.find({});
    } catch(err) {
        console.log("Error publishing Groups: " + err);
    } 
});

Meteor.publish("myServerInfo", function() {
    try {
        return ServerInfo.find({});
    } catch (err) {
        console.log("Error publishing Server Info: " + err);
    }
});

Meteor.publish("wgInstall", function() {
    try {
        return WGInstalled.find({});
    } catch (err) {
        console.log("Error publishing WG Install Status: " + err);
    }
});

Meteor.publish("myControl", function() {
    try {
        return Control.find({}, {_id: 1, exists: 1});
    } catch (err) {
        console.log("Error publishign whether control exists: " + err);
    }
});