import { Configuration } from '../../imports/api/configuration.js';

Template.adminConfig.onCreated(function() {
    this.subscribe("configuration");
});

Template.adminConfig.onRendered(function() {
    
});

Template.adminConfig.helpers({
    emailHost: function() {
        let configExists = Configuration.findOne({});
        if (typeof configExists != "undefined") {
            Session.set("configMode", "edit");
            return true;
        } else {
            Session.set("configMode", "new");
            return false; 
        }
    },
    configExists: function() {
        return Configuration.findOne({});
    },
    configMode: function() {
        return Session.get("configMode");
    },
});

Template.adminConfig.events({
    "click #submitConfig" (event) {
        event.preventDefault();
        console.log("detected click event");
        let host = $("#emailHost").val();
        let user = $("#emailUser").val();
        let pass = $("#emailPass").val();
        let server = $("#emailServer").val();
        let portNo = $("#emailPort").val();

        Meteor.call("new.config", host, user, pass, server, portNo, function(err, result) {
            if (err) {
                console.log("Error adding email configuration: " + err);
                showSnackbar("Error Adding Email Configuration!", "red");
            } else {
                showSnackbar("Email Configuration Updated Successfully!", "green");
                Session.set("configMode", "edit");
            }
        });
    },
    "click #saveChangedConfig" (event) {
        event.preventDefault();
        let configId = this._id;
        let host = $("#emailHost").val();
        let user = $("#emailUser").val();
        let pass = $("#emailPass").val();
        let server = $("#emailServer").val();
        let portNo = $("#emailPort").val();

        Meteor.call("edit.config", host, user, pass, server, portNo, function(err, result) {
            if (err) {
                console.log("Error editing email configuration: " + err);
                showSnackbar("Error Editing Email Configuration!", "red");
            } else {
                showSnackbar("Email Configuration Updated Successfully!", "green");
                Session.set("configMode", "edit");
            }
        });
    },
    "click #cancelConfig" (event) {
        event.preventDefault();
        $("#emailHost").val("");
        $("#emailUser").val("");
        $("#emailPass").val("");
        $("#emailServer").val("");
        $("#emailPort").val("");
    },
    "click #testEmail" (event) {
        event.preventDefault();

        // send a test email using the saved creds.
        console.log("Email Test clicked");
        // first see if creds exist.

    },
});