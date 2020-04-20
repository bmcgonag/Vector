import { Meter } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { ServerInfo } from './serverInfo.js';
import moment from 'moment';

export const Interfaces = new Mongo.Collection('interfaces');

Interfaces.allow({
    insert: function(userId, doc){
        // if use id exists, allow insert
        return !!userId;
    },
});

Meteor.methods({
    'add.interface' (interfaceName, interfaceOS, interfaceGroup, interfaceIP, interfaceIPv6, interfacePrivateKey, interfacePublicKey, interfaceDNS, interfaceDNSv6, myId, checkOnline, validTil, validTilFrame) {
        check(interfaceName, String);
        check(interfaceOS, String);
        check(interfaceGroup, String);
        check(interfaceIP, String);
        check(interfaceIPv6, String);
        check(interfacePrivateKey, String);
        check(interfacePublicKey, String);
        check(interfaceDNS, String);
        check(interfaceDNSv6, String);
        check(myId, String);
        check(checkOnline, Boolean);
        check(validTil, String);
        check(validTilFrame, String);
        

        let serverInfo = ServerInfo.findOne({});

        let port = serverInfo.port;

        if (validTil == "" || validTil == null) {
            let isTemp = false;
            let validTilDateTime = null;
            let validTilFrame = null;
        } else {
            let isTemp = true;
            let validTilDateTime = moment().add(validTil, validTilFrame).toISOString();
            let validOn = moment().toISOString(new Date());
        }
        
        
        Interfaces.insert({
            interfaceName: interfaceName,
            interfaceOS: interfaceOS,
            interfaceGroup: interfaceGroup,
            interfaceIP: interfaceIP,
            interfaceIPv6: interfaceIPv6,
            interfacePort: port,
            interfacePrivateKey: interfacePrivateKey,
            interfacePublicKey: interfacePublicKey,
            interfaceDNS: interfaceDNS,
            interfaceDNSv6: interfaceDNSv6,
            checkOnline: checkOnline,
            validTil: validTil,
            validTilFrame: validTilFrame,
            validTilDateTime: validTilDateTime,
            validOn: validOn,
            isTemp: isTemp,
            status: "offline",
            addedOn: new Date(),
            disabledTil: -1,
            disabledTilFrame: "",
            disabledOn: "",
            disabledTilDateTime: "",
            disabledIntReason: "",
            isDisabled: false,
            interfaceUserId: myId,
        });
    },
    'edit.interface' (interfaceId, interfaceName, interfaceDevice, interfaceOS, interfaceIP, interfaceIPv6, interfacePrivateKey, interfacePublicKey, interfaceDNS, interfaceDNSv6) {
        check(interfaceId, String);
        check(interfaceName, String);
        check(interfaceDevice, String);
        check(interfaceOS, String);
        check(interfaceIP, String);
        check(interfaceIPv6, String);
        check(interfacePrivateKey, String);
        check(interfacePublicKey, String);
        check(interfaceDNS, String);
        check(interfaceDNSv6, String);

        Interfaces.update({ _id: interfaceId }, {
            set: {
                interfaceName: interfaceName,
                interfaceDevice: interfaceDevice,
                interfaceOS: interfaceOS,
                interfaceIP: interfaceIP,
                interfaceIPv6: interfaceIPv6,
                interfacePrivateKey: interfacePrivateKey,
                interfacePublicKey: interfacePublicKey,
                interfaceDNS: interfaceDNS,
                interfaceDNSv6: interfaceDNSv6,
                updatedOn: new Date(),
            }
        });
    },
    'edit.InterfacePorts' (interfaceId) {
        check(interfaceId, String);

        let serverInfo = ServerInfo.findOne({});

        let port = serverInfo.port;

        // update all interface ports to this value - basically if the Server port is changed.
        return Interfaces.update({ _id: interfaceId }, {
            $set: {
                interfacePort: port,
            }
        }, { multi: true });
    },
    'delete.interface' (interfaceId) {
        check(interfaceId, String);

        if (!this.userId) {
            throw new Meteor.Error("User is not authorized to delete interfaces. Please make sure you are logged in.");
        }

        let interfaceInfo = Interfaces.findOne({ _id: interfaceId });

        let intPubKey = interfaceInfo.interfacePublicKey;
        let intName = interfaceInfo.interfaceName;

        Interfaces.remove({ _id: interfaceId });

        // now remove the interface from the wg interface
        Meteor.call("remove.wgClient", intPubKey, intName, function(err, result) {
            if (err) {
                console.log("Error in method 'remove.wgClient' on server: " + err);
            } else {
                console.log("Attempted to remove interface " + intName + " from server configuration file.");
            }
        });
    },
    "markInt.online" (onlineIds) {
        check(onlineIds, [String]);

        // how many ips do we have to deal with?
        let count = onlineIds.length;
        console.log("INFO:   Online IDs count: " + count);

        // let's get our server info so we can avoid
        // our server ip (it should always be online)
        let serverInfo = ServerInfo.findOne({});

        // now let's set all machines to offline real quick
        // then we'll set those we found back to online
        Meteor.call("markInt.offline");

        // loop through the onine machine ips, and set them
        // to an online status.
        for (i=0; i < count; i++) {
            if (onlineIds[i] == "" || onlineIds[i] == serverInfo.ipAddress) {
                // not adding this one.
            } else {
                console.log("INFO:   Placing ID " + onlineIds[i] + " in ONLINE status."); 
                Interfaces.update({ interfaceIP: onlineIds[i]}, {
                    $set: {
                        status: "online",
                    }
                });
            }
        }
    },
    "markInt.offline" () {
        console.log("INFO:   Marking Interfaces Offline.");
        return Interfaces.update({}, {
            $set: {
                status: "offline",
            }
        }, { multi: true });
    },
    "changeOnline.check" (intId, newCheck) {
        check(intId, String);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to edit interface information, make sure you are logged in.');
        }

        return Interfaces.update({ _id: intId }, {
            $set: {
                checkOnline: newCheck,
            }
        });
    },
    'disable.interface' (intId, disabledTil, disabledTilFrame, disabledIntReason) {
        check(intId, String);
        check(disabledTil, Number);
        check(disabledTilFrame, String);
        check(disabledIntReason, String);

        // need to add a momentjs calculation to a date time for below.
        let disabledDateTime = moment().add(disabledTil, disabledTilFrame).toISOString();
        let disabledOn = moment().toISOString(new Date());
        
        return Interfaces.update({ _id: intId }, {
            $set: {
                disabledTil: disabledTil,
                isDisabled: true,
                disabledTilFrame: disabledTilFrame,
                disabledIntReason: disabledIntReason, 
                disabledOn: disabledOn,
                disabledTilDateTime: disabledDateTime,
            }
        });
    }
 });