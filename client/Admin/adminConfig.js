import { Configuration } from '../../imports/api/configuration.js';

Template.adminConfig.onCreated(function() {
    this.subscribe("configuration");
});

Template.adminConfig.onRendered(function() {
    $("#sudoPwd").val("");
});

Template.adminConfig.helpers({

});

Template.adminConfig.events({
    "click #submitConfig" (event) {
        event.preventDefault();
        let sudoPwd = $("#sudoPwd").val();

        if (sudoPwd == "" || sudoPwd == null) {
            console.log("No password given.");
        } else {
            Meteor.call("add.mpd", sudoPwd, function(err, result) {
                if (err) {
                    console.log("Error adding password: " + err);
                    showSnackbar("Error Adding PWD to DB!", "red");
                } else {
                    showSnackbar("Private Configuration Updated Successfully!", "green");
                }
            });
        }
    },
    "click #saveChangedConfig" (event) {
        event.preventDefault();
    },
    "click #cancelConfig" (event) {
        event.preventDefault();
    },
});