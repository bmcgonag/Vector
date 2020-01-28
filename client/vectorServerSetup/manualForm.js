import { ServerInfo } from '../../imports/api/serverInfo.js';

Template.manualForm.onCreated(function() {
    this.subscribe("myServerInfo");
});

Template.manualForm.onRendered(function() {

});

Template.manualForm.helpers({

});

Template.manualForm.events({
    'click #saveServer' (event) {
        event.preventDefault();

        let ipv4 = $("#serverIPv4").val();
        let interfaceName = $("#serverIFName").val();
        let portNo = $("#listenPort").val();

        if (ipv4 == "" || ipv4 == null) {
            ipv4 = "10.100.100.1";
        }

        if (interfaceName == "" || interfaceName == null) {
            isMainThread = "wg0";
        }

        if (portNo == null || portNo == "") {
            portNo = "51820";
        }

        Session.set("ipv4", ipv4);
        Session.set("interfaceName", interfaceName);
        Session.set("portNo", portNo);

        // Meteor.call("createServer.Interface", "manual", ipv4, interfaceName, portNo, function(err, result) {
        //     if (err) {
        //         console.log("Error creating server interface file manually: " + err);
        //         showSnackbar("Error Creating Server Interface!", "red");
        //     } else {
        //         showSnackbar("Creating Server Interface!", "green");
        //         Session.set("showManualSetup", false);
        //     }
        // });
    }
});