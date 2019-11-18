import { Interfaces } from '../../imports/api/interfaces.js';
import { InterfaceGroups } from '../../imports/api/interfaceGroups.js';
import { ServerInfo } from '../../imports/api/serverInfo.js';

Template.vectorForm.onCreated(function() {
    this.subscribe("myInterfaces");
    this.subscribe("myGroups");
    this.subscribe("myServerInfo");
});

Template.vectorForm.onRendered(function() {
    $("select").material_select();
    setTimeout(function() {
        $("select").material_select();
        materialize.updateTextFields()
    }, 200);
});

Template.vectorForm.helpers({
    myGroups: function() {
        let myId = Meteor.userId();
        return InterfaceGroups.find({ groupUserId: myId });
    },
    currentServerIP: function() {
        let serverInfo = ServerInfo.findOne({});
        if (typeof serverInfo != 'undefined') {
            let ip = serverInfo.ipAddress;
            Session.set("ipv4Server", ip);
            return ip;
        } else {
            return "No Server IP Found";
        }
    },
    suggestedIp: function() {
        return Session.get("fullIp");
    },
});

Template.vectorForm.events({
    "click #autoIp" (event) {
        event.preventDefault();
        checkIP();
        
    },
    "click #saveInterface" (event) {
        event.preventDefault();

        let deviceOS = $("#deviceOS").val();
        let deviceName = $("#deviceName").val();
        let deviceGroup = $("#deviceGroup").val();
        let ipAdd = $("#ipAdd").val();

        if (deviceName == null || deviceName == "") {
            showSnackbar("Device Name is Required!", "red");
            return;
        }

        if (ipAdd == "" || ipAdd == null) {
            console.log("Creating an IP - not filled in.");
            checkIP();
        }

        Meteor.call('add.deviceInterface', deviceName, deviceOS, deviceGroup, fullIp, function(err, result) {
            if (err) {
                console.log("Error adding interface to db: " + err);
                showSnackbar("Error Adding Interface", "red");
            } else {
                showSnackbar("Interface Added.", "green");
            }
        });

    },
    "click #cancelInterface" (event) {
        event.preventDefault();
        
    },
});

checkIP = function() {
    // let's autogenerate an IPv4 address
    let serverIp = Session.get("ipv4Server");
    let ipParts = serverIp.split(".");
    let threeOcts = ipParts[0] + "." + ipParts[1] + "." + ipParts[2] + ".";
    
    // - pull the last entry, and check the IP
    // - give the next IP in the list.
    // - check and make sure that IP isn't already in use.
    // - repeat as neded.

    let lastInterface = Interfaces.findOne({}, {sort: {DateTime: -1, limit: 1}});
    if (typeof lastInterface == 'undefined') {
        // no interfaces exist.
        fullIp = threeOcts + "2";
        console.log("Full IP is new and will be: " + fullIp);
        Session.set("fullIp", fullIp);
        return fullIp;
    } else {
        let lastIp = lastInterface.ipAddress;
        console.log("Last IP: " + lastIp);
    }
}