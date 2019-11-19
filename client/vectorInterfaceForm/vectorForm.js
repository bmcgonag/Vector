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
        let duplicateIp = false;
        let duplicateName = false;

        let lastInterface = Interfaces.find({}).fetch();

        if (deviceName == null || deviceName == "") {
            showSnackbar("Device Name is Required!", "red");
            $("#deviceName").focus();
            return;
        } else {
            if (ipAdd == "" || ipAdd == null) {
                console.log("Creating an IP - not filled in.");
                checkIP();
                checkDuplicates(deviceName, deviceOS, deviceGroup, ipAdd);
                if (duplicateIp == true) {
                    showSnackbar("The Selected IP Appears to be a Duplicate!", "red");
                    return;
                } else if (duplicateName == true) {
                    showSnackbar("The Selected Interface Name Appears to be a Duplicate", "red");
                    return;
                } else {
                    writeInterfaceData(deviceName, deviceOS, deviceGroup, ipAdd);
                }
            }
        }
    },
    "click #cancelInterface" (event) {
        event.preventDefault();
        $("#deviceOS").val("");
        $("#deviceName").val("");
        $("#deviceGroup").val("");
        $("#ipAdd").val("");

        Session.set("showForm", false);
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

    let lastInterface = Interfaces.findOne({}, {sort: {addedOn: -1, limit: 1}});
    if (typeof lastInterface == 'undefined') {
        // no interfaces exist.
        let ipAdd = threeOcts + "2";
        console.log("Full IP is new and will be: " + ipAdd);
        Session.set("fullIp", ipAdd);
        return ipAdd;
    } else {
        console.dir(lastInterface);
        let lastIp = lastInterface.interfaceIP;
        console.log("Last IP: " + lastIp);

        // now split the last IP by the periods
        let ipclientParts = lastIp.split(".");
        let ip4thOctet = ipclientParts[3];
        let ip4th = parseInt(ip4thOctet);
        let newIP4th = ip4th + 1;
        let newIP = threeOcts + newIP4th;
        console.log("New IP: " + newIP);
        console.log("-----------------------");
        Session.set("fullIp", newIP);
        return newIP;
    }
}

checkDuplicates = function(deviceName, deviceOS, deviceGroup, ipAdd) {
    if (typeof lastInterface != 'undefined') {
        let noInterfaces = lastInterface.length;
        for (i=0; i<noInterfaces; i++) {
            if (lastInterface[i].interfaceIP == ipAdd) {
                duplicateIp = true;
                return;
            }
            if (lastInterface[i].interfaceName == deviceName) {
                duplicateName = true;
                return;
            }
        }
    }
}

writeInterfaceData = function(deviceName, deviceOS, deviceGroup, ipAdd) {
    Meteor.call('add.deviceInterface', deviceName, deviceOS, deviceGroup, ipAdd, function(err, result) {
        if (err) {
            console.log("Error adding interface to db: " + err);
            showSnackbar("Error Adding Interface", "red");
        } else {
            showSnackbar("Interface Added.", "green");
            Session.set("showForm", false);
        }
    });
}