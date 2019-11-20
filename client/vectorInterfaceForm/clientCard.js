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
    console.log("");
    console.log("--------------------------");
    console.log("hostname: " + myhost);
    console.log("");
});

Template.clientCard.helpers({
    clientData: function() {
        return Interfaces.find({});
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
});