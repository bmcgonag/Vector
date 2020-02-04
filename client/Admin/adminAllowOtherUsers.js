import { Configuration } from '../../imports/api/configuration.js';

Template.adminAllowOtherUsers.onCreated(function() {
    this.subscribe("configuration");
});

Template.adminAllowOtherUsers.onRendered(function() {
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
});

Template.adminAllowOtherUsers.helpers({
    configInfo: function() {
        let configInfo = Configuration.findOne({});
        
        return configInfo;
    },
    allowOthers: function() {
        return Session.get("allowOthers");
    },
    allowOwnNetwork: function() {
        let allowOwn = Session.get("allowOwnNetwork");
        console.log("Session Allow Own: " + allowOwn);
        return allowOwn;
    }
});

Template.adminAllowOtherUsers.events({
    'click #allowOthers' (event) {
        let allowOthers = $("#allowOthers").prop('checked');
        Session.set("allowOthers", allowOthers);
    },
    'click #allowOwnNetwork' (event) {
        console.log("clicked.")
        let allowOwnNetwork = $("#allowOwnNetwork").prop('checked');
        console.log("allow own: " + allowOwnNetwork);
        Session.set("allowOwnNetwork", allowOwnNetwork);
    },
    'click #disallowCom' (event) {
        Session.set("confirmationDialogTitle", "NOTICE");
        Session.set("confirmationDialogContent", "Changing the Disallow Inter-Communication value after clients have been created with a specific value set, will not update the functionality of existing clients!");
        Session.set("eventConfirmCallBackFunction", "");
        Session.set("eventConfirmNecessaryId", "disallowCom");

        $("#genModal").modal('open');
    }
});