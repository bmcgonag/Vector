import { Configuration } from '../../imports/api/configuration.js';

Template.serverMain.onCreated(function() {
    this.subscribe("configuration");
});

Template.serverMain.onRendered(function() {

});

Template.serverMain.helpers({
    allowSetup: function() {
        let userId = Meteor.userId();
        let config = Configuration.findOne({});
        let role = Roles.userIsInRole(userId, ['Admin']);
        
        if (role == true || config.allowOwnNetwork == true) {
            console.log("Found true");
            return true;
        } else {
            console.log("Not True");
            return false;
        }
    },
});

Template.serverMain.events({

});