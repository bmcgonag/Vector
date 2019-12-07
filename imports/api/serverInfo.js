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
            throw new Meteor.Error('User is not allowed to add server info, make sure you are logged in.');
        }

        let infoExists = ServerInfo.findOne({});

        if (typeof infoExists != 'undefined' && infoExists != null && infoExists != "") {
            // need to call the update method instead.
            let infoId = infoExists._id;
            Meteor.call("edit.serverInfo", infoId, ipAddress, interfaceName, port, privateKey, publicKey, function(err, result) {
                if (err) {
                    console.log("Error calling update from add server info: " + err);
                }
            });
        } else {
            let myId = Meteor.userId();

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
        }
    },
    'edit.serverInfo' (infoId, ipAddress, interfaceName, port, privateKey, publicKey) {
        check(infoId, String);
        check(ipAddress, String);
        check(interfaceName, String);
        check(port, String);
        check(privateKey, String);
        check(publicKey, String);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to edit server info, make sure you are logged in.');
        }

        return ServerInfo.update({ _id: infoId }, {
            $set: {
                ipAddress: ipAddress,
                serverInterfaceName: interfaceName,
                port: port,
                privateKey: privateKey,
                publicKey: publicKey,
                updatedByUserId: myId,
                updatedOn: new Date(),
                updatedByUser: Meteor.user().emails[0].address,
            }
        });
    },
    'delete.serverInfo' (infoId) {
        check(infoId, String);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to delete server info, make sure you are logged in.');
        }

        return ServerInfo.remove({ _id: infoId });
    },
});