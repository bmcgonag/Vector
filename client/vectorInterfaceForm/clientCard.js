import { Interfaces } from '../../imports/api/interfaces.js';
import { ServerInfo } from '../../imports/api/serverInfo.js';
import { saveAs } from 'file-saver';


Template.clientCard.onCreated(function() {
    this.subscribe("myInterfaces");
    this.subscribe("myServerInfo");
});

Template.clientCard.onRendered(function() {
    // get the hostname of the server
    let myhost = location.hostname;
});

Template.clientCard.helpers({
    clientData: function() {
        return Interfaces.find({});
    },
    clientQR: function() {
        let interfaceId = this._id;
        let thisInterface;
        // console.log("Interface ID: " + interfaceId);

        let myhost = location.hostname;

        let interfaceInfo = Interfaces.findOne({ _id: interfaceId });
        let serverInfo = ServerInfo.findOne({});

        let blob = "[Interface]\nPrivateKey = " + interfaceInfo.interfacePrivateKey + "\nDNS = " + interfaceInfo.interfaceDNS + "\n" + "Address = " + interfaceInfo.interfaceIP + "/22," + interfaceInfo.interfaceIPv6 +"/112\n\n[Peer]\nPublicKey = " + serverInfo.publicKey + "\nEndpoint = " + myhost + ":" + interfaceInfo.interfacePort + "\nAllowedIPs = 0.0.0.0/0, ::/0";

        return blob;
    },
});

Template.clientCard.events({
    "click #downloadInterface" (event) {
        event.preventDefault();

        let interfaceId = this._id;
        // console.log("Interface ID: " + interfaceId);

        let myhost = location.hostname;

        let interfaceInfo = Interfaces.findOne({ _id: interfaceId });
        let serverInfo = ServerInfo.findOne({});

        var blob = new Blob(
            ["[Interface]\nPrivateKey = " + interfaceInfo.interfacePrivateKey + "\nDNS = " + interfaceInfo.interfaceDNS + "\n" + "Address = " + interfaceInfo.interfaceIP + "/22," + interfaceInfo.interfaceIPv6 +"/112\n\n[Peer]\nPublicKey = " + serverInfo.publicKey + "\nEndpoint = " + myhost + ":" + interfaceInfo.interfacePort + "\nAllowedIPs = 0.0.0.0/0, ::/0"], 
            {type: "text/plain;charset=utf-8"});
        console.dir(blob);
        
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
    }
});