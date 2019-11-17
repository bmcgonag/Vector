import { Interfaces } from '../imports/api/interfaces.js';
import { Configuration } from '../imports/api/configuration.js';
import { InterfaceGroups } from '../imports/api/interfaceGroups.js';

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