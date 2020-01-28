import { Configuration } from '../imports/api/configuration.js';

Template.MainLayout.onCreated(function() {
    this.subscribe("configuration");
});

Template.MainLayout.onRendered(function() {
    Session.set("ip6pattern", "fe80::10:10:");
});

Template.MainLayout.helpers({
    myConfig: function() {
        let userId = Meteor.userId();
        let config = Configuration.findOne({});
        let role = Roles.userIsInRole(userId, ['Admin']);
        console.log("Role = " + true + " and config.allowOthers = " + config.allowOthers);
        if ((role == true && config.allowOthers == false) || (config.allowOthers == true) || (role == true && typeof config.allowOthers == 'undefined')) {
            return true;
        } else {
            return false;
        }
    },
});

Template.MainLayout.events({
    
});