import { Interfaces } from '../imports/api/interfaces.js';
import { Configuration } from '../imports/api/configuration.js';
import { InterfaceGroups } from '../imports/api/interfaceGroups.js';
import { ServerInfo } from '../imports/api/serverInfo.js';
import { WGInstalled } from '../imports/api/wgInstalled.js';

Meteor.publish("myInterfaces", function() {
    try {
        if (Roles.userIsInRole (this.userId, ['Admin'])) {
            return Interfaces.find({});
        } else {
            return Interfaces.find({ interfaceUserId: this.userId });
        }
    } catch (error) {
        console.log("Error publishing interfaces: " + error);
    }
});

Meteor.publish("configuration", function() {
    try {
        if (Roles.userIsInRole(this.userId, ['Admin'])) {
            return Configuration.find({});
        } else {
            return Configuration.find({}, {
                fields: {
                    _id: 1,
                    allowOwnNetwork: 1,
                    maxNumberNetworks: 1,
                    allowOthers: 1,
                    maxNumberInterfaces:1
                }
            });
        }
    } catch(err) {
        console.log("Error publishing configuration: " + err);
    }
});

Meteor.publish("myGroups", function() {
    try {
        if (Roles.userIsInRole(this.userId, ['Admin'])) {
            return InterfaceGroups.find({});
        } else {
            return InterfaceGroups.find({ groupUserId: this.userId })
        }
    } catch(err) {
        console.log("Error publishing Groups: " + err);
    } 
});

Meteor.publish("myServerInfo", function() {
    try {
        if (Roles.userIsInRole(this.userId, ['Admin'])) {
            return ServerInfo.find({});
        } else {
            return ServerInfo.find({ serverUserId: this.userId });
        }
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