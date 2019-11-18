import { Meter } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const ServerInfo = new Mongo.Collection('serverInfo');

ServerInfo.allow({
    insert: function(userId, doc){
        // if use id exists, allow insert
        return !!userId;
    },
});

Meteor.methods({
    'add.serverInfo' (ipAddress, interfaceName, port, privateKey, publicKey) {
        check(ipAddress, String);
        check(interfaceName, String);
        check(port, String);
        check(privateKey, String);
        check(publicKey, String);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to setup interfaces, make sure you are logged in.');
        }

        let myId = this.userId;

        return ServerInfo.insert({
            ipAddress: ipAddress,
            serverInterfaceName: interfaceName,
            port: port,
            privateKey: privateKey,
            publicKey: publicKey,
            serverUserId: myId,
            addedOn: new Date(),
            serverUser: Meteor.user().emails[0].address,
        });
    },
    'edit.serverInfo' (infoId, ipAddress, interfaceName) {

    },
    'delete.serverInfo' (infoId) {

    }
});