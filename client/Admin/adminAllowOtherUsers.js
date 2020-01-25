import { Configuration } from '../../imports/api/configuration.js';

Template.adminAllowOtherUsers.onCreated(function() {
    this.subscribe("configuration");
});

Template.adminAllowOtherUsers.onRendered(function() {

});

Template.adminAllowOtherUsers.helpers({
    configInfo: function() {
        let configInfo = Configuration.findOne({});
        if (configInfo.allowOthers == true) {
            Session.set("allowOthers", true);
        } else {
            Session.set("allowOthers", false);
        }

        if (configInfo.allowOwnNetwork == true) {
            Session.set("allowOwnNetwork", true);
        } else {
            Session.set("allowOwnNetwork", false);
        }
        
        return configInfo;
    },
    allowOthers: function() {
        return Session.get("allowOthers");
    },
    allowOwnNetwork: function() {
        return Session.get("allowOwnNetwork");
    }
});

Template.adminAllowOtherUsers.events({
    'click #allowOthers' (event) {
        let allowOthers = $("#allowOthers").prop('checked');
        Session.set("allowOthers", allowOthers);
    },
    'click #allowOwnNetwork' (event) {
        let allowOwnNetwork = $("#allowOwnNetwork").prop('checked');
        Session.set("allowOwnNetwork", allowOwnNetwork);
    }
});