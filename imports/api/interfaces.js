import { Meter } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Interfaces = new Mongo.Collection('interfaces');

Interfaces.allow({
    insert: function(userId, doc){
        // if use id exists, allow insert
        return !!userId;
    },
});

Meteor.methods({
    'add.interface' (interfaceName, interfaceDevice, interfaceOS, interfaceIP, interfaceIPv6, interfacePrivateKey, interfacePublicKey, interfaceDNS1, interfaceDNS2, interfaceDNSv61, interfaceDNSv62) {
        check(interfaceName, String);
        check(interfaceDevice, String);
        check(interfaceOS, String);
        check(interfaceIP, String);
        check(interfaceIPv6, String);
        check(interfacePrivateKey, String);
        check(interfacePublicKey, String);
        check(interfaceDNS1, String);
        check(interfaceDNS2, String);
        check(interfaceDNSv61, String);
        check(interfaceDNSv62, String);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to setup interfaces, make sure you are logged in.');
        }

        let myId = this.userId;

        Interfaces.insert({
            interfaceName: interfaceName,
            interfaceDevice: interfaceDevice,
            interfaceOS: interfaceOS,
            interfaceIP: interfaceIP,
            interfaceIPv6: interfaceIPv6,
            interfacePrivateKey: interfacePrivateKey,
            interfacePublicKey: interfacePublicKey,
            interfaceDNS1: interfaceDNS1,
            interfaceDNS2: interfaceDNS2,
            interfaceDNSv61: interfaceDNSv61,
            interfaceDNSv62: interfaceDNSv62,
            addedOn: new Date(),
            interfaceUser: Meteor.user().emails[0].address,
            interfaceUserId: myId,
        });
    },
    'edit.interface' (interfaceId, interfaceName, interfaceDevice, interfaceOS, interfaceIP, interfaceIPv6, interfacePrivateKey, interfacePublicKey, interfaceDNS1, interfaceDNS2, interfaceDNSv61, interfaceDNSv62) {
        check(interfaceId, String);
        check(interfaceName, String);
        check(interfaceDevice, String);
        check(interfaceOS, String);
        check(interfaceIP, String);
        check(interfaceIPv6, String);
        check(interfacePrivateKey, String);
        check(interfacePublicKey, String);
        check(interfaceDNS1, String);
        check(interfaceDNS2, String);
        check(interfaceDNSv61, String);
        check(interfaceDNSv62, String);

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
                interfaceDNS1: interfaceDNS1,
                interfaceDNS2: interfaceDNS2,
                interfaceDNSv61: interfaceDNSv61,
                interfaceDNSv62: interfaceDNSv62,
                updatedOn: new Date(),
            }
        });
    },
    'delete.interface' (interfaceId) {
        check(interfaceId, String);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to delete interfaces, make sure you are logged in.');
        }

        Interfaces.remove({ _id: interfaceId });
    },
});