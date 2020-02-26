import { Interfaces } from '../../imports/api/interfaces.js';
import { ServerInfo } from '../../imports/api/serverInfo.js';
import { saveAs } from 'file-saver';


Template.clientCard.onCreated(function() {
    this.subscribe("myInterfaces");
    this.subscribe("myServerInfo");
});

Template.clientCard.onRendered(function() {
    // get the hostname of the server
    setTimeout(function() {
        $("select").material_select();
    }, 100);
    let myhost = location.hostname;
});

Template.clientCard.helpers({
    clientData: function() {
        return Interfaces.find({});
    },
    clientQR: function() {
        let interfaceId = this._id;
        let thisInterface;

        let myhost = location.hostname;

        let interfaceInfo = Interfaces.findOne({ _id: interfaceId });
        let serverInfo = ServerInfo.findOne({});

        let qrBlob = "[Interface]\nPrivateKey = " + interfaceInfo.interfacePrivateKey + "\nDNS = " + interfaceInfo.interfaceDNS + "\n" + "Address = " + interfaceInfo.interfaceIP + "/22," + interfaceInfo.interfaceIPv6 +"/112\n\n[Peer]\nPublicKey = " + serverInfo.publicKey + "\nEndpoint = " + myhost + ":" + interfaceInfo.interfacePort + "\nAllowedIPs = 0.0.0.0/0, ::/0";

        return qrBlob;
    },
});

Template.clientCard.events({
    "click #downloadInterface" (event) {
        event.preventDefault();

        let interfaceId = this._id;

        let myhost = location.hostname;

        let interfaceInfo = Interfaces.findOne({ _id: interfaceId });
        let serverInfo = ServerInfo.findOne({});

        var blob = new Blob(
            ["[Interface]\nPrivateKey = " + interfaceInfo.interfacePrivateKey + "\nDNS = " + interfaceInfo.interfaceDNS + "\n" + "Address = " + interfaceInfo.interfaceIP + "/22," + interfaceInfo.interfaceIPv6 +"/112\n\n[Peer]\nPublicKey = " + serverInfo.publicKey + "\nEndpoint = " + myhost + ":" + interfaceInfo.interfacePort + "\nAllowedIPs = 0.0.0.0/0, ::/0"], 
            {type: "text/plain;charset=utf-8"});
        
        saveAs(blob, interfaceInfo.interfaceName + ".conf");
    },
    "click #removeClient" (event) {
        event.preventDefault();

        // first remove the client from the DB
        let clientId = this._id;

        Meteor.call("delete.interface", clientId, function(err, result) {
            if (err) {
                console.log("Error removing interface: " + err);
                showSnackbar("Error Removing Client Interface!", "red");
            } else {
                showSnackbar("Client Interface Removed Successfully!", "green");
            }
        });
    },
    "click .switch" (event) {
        let interfaceId = this._id;
        let newCheck = $('#'+interfaceId).prop('checked');
        console.log("new check value is: " + newCheck);

        Meteor.call("changeOnline.check", interfaceId, newCheck, function(err, result) {
            if (err) {
                console.log("ERROR:   Error updating the interface for online checking: " + err);
                showSnackbar("Error Updating Interface!");
            } else {
                showSnackbar("Interface Updated Successfully!");
            }
        });
    },
    "click #disableInterface" (event) {
        event.preventDefault();

        let disabledTil = parseInt($("#disabledTil").val());
        let disabledTilFrame = $("#disabledTilFrame").val();
        let disabledIntReason = $("#disabledIntReason").val();

        if (disabledTil == "" || disabledTil == null) {
            showSnackbar("You must prvoide a time to disable til (0 = forever)", "orange");
            $("#disabledTil").focus();
            return;
        } else if (disabledTilFrame == "" || disabledTilFrame == null) {
            showSnackbar("You must provide a time frame type for disable, even if it's forever.", "orange");
            $("#disabledTilFrame").focus();
            return;
        } else if (disabledIntReason == "" || disabledIntReason == null) {
            showSnackbar("You need to provide a reason for disabling the interface.", "orange");
            $("#disabledIntReason").focus();
            return;
        } else {
            Meteor.call("disable.interface", this._id, disabledTil, disabledTilFrame, disabledIntReason, function(err, result) {
                if (err) {
                    showSnackbar("Error Disabling Interface!", "red");
                } else {
                    showSnackbar("Disabled successfully!", "green");
                }
            });
        }
    }
});