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
    Session.set("fullIp", "");
    Session.set("duplicateIp", false);
    Session.set("duplicateName", false);
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
        Session.set("fullIp", "");
        setTimeout(function() {
            checkIP();
        }, 100);
    },
    "click #saveInterface" (event) {
        event.preventDefault();

        let deviceOS = $("#deviceOS").val();
        let deviceName = $("#deviceName").val();
        let deviceGroup = $("#deviceGroup").val();
        let ipAdd = $("#ipAdd").val();
        Session.set("duplicateIp", false);
        Session.set("duplicateName", false);;

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
                writeInterfaceData(deviceName, deviceOS, deviceGroup, ipAdd);
            } else {
                checkDuplicates(deviceName, deviceOS, deviceGroup, ipAdd);
                writeInterfaceData(deviceName, deviceOS, deviceGroup, ipAdd);
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
        let ipAdd = threeOcts + newIP4th;
        console.log("New IP: " + ipAdd);
        console.log("-----------------------");
        Session.set("fullIp", ipAdd);
        return ipAdd;
    }
}

checkDuplicates = function(deviceName, deviceOS, deviceGroup, ipAdd) {
    let lastInterface = Interfaces.find({}).fetch();
    if (typeof lastInterface != 'undefined') {
        let noInterfaces = lastInterface.length;
        for (i=0; i<noInterfaces; i++) {
            if (lastInterface[i].interfaceIP == ipAdd) {
                Session.set("duplicateIp", true);
            }
            if (lastInterface[i].interfaceName == deviceName) {
                Session.set("duplicateName", true);
            }
        }
    }
    return;
}

writeInterfaceData = function(deviceName, deviceOS, deviceGroup, ipAdd) {
    // for the record I hate this approach, and will change it when I come up
    // with a better way.
    let duplicateName = Session.get("duplicateName");
    let duplicateIp = Session.get("duplicateIp");
    if (ipAdd == null || ipAdd == "") {
        ipAdd = Session.get("fullIp");
    }
    if (duplicateName == true) {
        showSnackbar("Duplicate Device Name - Please Fix It!", "orange");
        return;
    } else if (duplicateIp == true) {
        showSnackbar("Duplicate IP Address - Please Fix It!", "orange");
        return;
    } else {
        setTimeout(function() {
            console.log("At Write - IP Address is: " + ipAdd)
            Meteor.call('add.deviceInterface', deviceName, deviceOS, deviceGroup, ipAdd, function(err, result) {
                if (err) {
                    console.log("Error adding interface to db: " + err);
                    showSnackbar("Error Adding Interface", "red");
                } else {
                    showSnackbar("Interface Added.", "green");
                    $("#ipAdd").val("");
                    $("#deviceName").val("");
                    Session.set("showForm", false);
                }
            });
        }, 250);
    }
}