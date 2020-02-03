import { Configuration } from '../../imports/api/configuration.js';

Template.adminLogLevel.onCreated(function() {

});

Template.adminLogLevel.onRendered(function() {
    $("select").material_select();
});

Template.adminLogLevel.helpers({
    configLogs: function() {
        let configs = Configuration.findOne({});
        if (typeof configs == "undefined") {
            return false;
        } else if (configs.logMore == true) {
            Session.set("logLevelOn", true);
            return true;
        } else {
            return false;
        }
    },
    logLevelOn: function() {
        return Session.get("logLevelOn");
    }
});

Template.adminLogLevel.events({
    "click #logMore" (event) {
        let isTrue = $("#logMore").prop('checked');

        if (isTrue == true) {
            Session.set("logLevelOn", true);
        } else {
            Session.set("logLevelOn", false);
        }

        setTimeout(function() {
            $("select").material_select();
            Materialize.updateTextFields()
        }, 150);
    }
});