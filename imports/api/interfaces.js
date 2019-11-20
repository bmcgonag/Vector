import { Meter } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { ServerInfo } from './serverInfo.js';

export const Interfaces = new Mongo.Collection('interfaces');

Interfaces.allow({
    insert: function(userId, doc){
        // if use id exists, allow insert
        return !!userId;
    },
});

Meteor.methods({
    'add.interface' (interfaceName, interfaceOS, interfaceGroup, interfaceIP, interfaceIPv6, interfacePrivateKey, interfacePublicKey, interfaceDNS, interfaceDNSv6) {
        check(interfaceName, String);
        check(interfaceOS, String);
        check(interfaceGroup, String);
        check(interfaceIP, String);
        check(interfaceIPv6, String);
        check(interfacePrivateKey, String);
        check(interfacePublicKey, String);
        check(interfaceDNS, String);
        check(interfaceDNSv6, String);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to setup interfaces, make sure you are logged in.');
        }

        let myId = this.userId;

        let serverInfo = ServerInfo.findOne({});

        let port = serverInfo.port;

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
            addedOn: new Date(),
            interfaceUser: Meteor.user().emails[0].address,
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

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to edit interfaces, make sure you are logged in.');
        }

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

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to edit interfaces, make sure you are logged in.');
        }

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
            throw new Meteor.Error('User is not allowed to delete interfaces, make sure you are logged in.');
        }

        Interfaces.remove({ _id: interfaceId });
    },
});