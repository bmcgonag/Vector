import { Configuration } from '../../imports/api/configuration.js';

Template.adminConfig.onCreated(function() {
    this.subscribe("configuration");
});

Template.adminConfig.onRendered(function() {
    $('.collapsible').collapsible();
    setTimeout(function() {
        $('.collapsible').collapsible();
    }, 100);
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
        let allowOthers = $("#allowOthers").prop('checked');
        let allowOwnNetwork = $("#allowOwnNetwork").prop('checked');
        let maxNoInts = $("#maxInterfaces").val();
        let maxNoNets = $("#maxNetworks").val();
        let logMore = $("#logMore").prop('checked');
        let logLevel = $("#logLevel").val();

        if (allowOwnNetwork == null || allowOthers == false) {
            allowOwnNetwork = false;
        }
        
        if (maxNoInts == null || maxNoInts == "") {
            maxNoInts = 0;
        } else {
            maxNoInts = parseInt(maxNoInts);
        }

        if (maxNoNets == null || maxNoNets == "") {
            maxNoNets = 0;
        } else {
            maxNoNets = parseInt(maxNoNets);
        }

        if (logMore == false) {
            logLevel = "";
        }

        Meteor.call("new.config", host, user, pass, server, portNo, allowOthers, maxNoInts, allowOwnNetwork, maxNoNets, logMore, logLevel, function(err, result) {
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
        let allowOthers = $("#allowOthers").prop('checked');
        let allowOwnNetwork = $("#allowOwnNetwork").prop('checked');
        let maxNoInts = $("#maxInterfaces").val();
        let maxNoNets = $("#maxNetworks").val();
        let logMore = $("#logMore").prop('checked');
        let logLevel = $("#logLevel").val();

        if (allowOwnNetwork == null || allowOthers == false) {
            allowOwnNetwork = false;
        }

        if (maxNoInts == null || maxNoInts == "") {
            maxNoInts = 0;
        } else {
            maxNoInts = parseInt(maxNoInts);
        }

        if (maxNoNets == null || maxNoNets == "") {
            maxNoNets = 0;
        } else {
            maxNoNets = parseInt(maxNoNets);
        }

        if (logMore == false) {
            logLevel = "";
        }

        Meteor.call("edit.config", host, user, pass, server, portNo, allowOthers, maxNoInts, allowOwnNetwork, maxNoNets, logMore, logLevel, function(err, result) {
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

        let recipient = $("#recipientEmail").val();

        if (recipient == null || recipient == "") {
            showSnackbar("You must enter a recipient for your test email.", "red");
            return;
        }

        let Config = Configuration.findOne({});
        
        if (typeof Config.emailHost == 'undefined' || Config.emailHost == "" || Config.emailHost == null ) {
            showSnackbar("Confiuration for Email Host has not been found.  Please enter an Email Host!", "red");
        } else {
            Meteor.call("emailTest", recipient, function(err, result) {
                if (err) {
                    showSnackbar("Error Testing Email!", "red");
                    console.log("Error Testing Email: " + err);
                } else {
                    showSnackbar("Email Attempting to Send!", "green");
                }
            });
        }

        // send a test email using the saved creds.
        // console.log("Email Test clicked");
        // first see if creds exist.

    },
});