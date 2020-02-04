import { Meter } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Configuration = new Mongo.Collection('configuration');

Configuration.allow({
    insert: function(userId, doc){
        // if use id exists, allow insert
        return !!userId;
    },
});

Meteor.methods({
    'new.config' (emailHost, emailUser, emailPassword, emailSmtpServer, emailSmtpPort, allowOthers, maxNumberInterfaces, allowOwnNetwork, maxNumberNetworks, logMore, logLevel, disallowCom) {
        check(emailHost, String);
        check(emailUser, String);
        check(emailPassword, String);
        check(emailSmtpServer, String);
        check(emailSmtpPort, String);
        check(allowOthers, Boolean);
        check(allowOwnNetwork, Boolean);
        check(maxNumberInterfaces, Number);
        check(maxNumberNetworks, Number);
        check(logMore, Boolean);
        check(logLevel, String);
        check(disallowCom, Boolean);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to setup admin values, make sure you are logged in.');
        }

        return Configuration.insert({
            emailHost: emailHost,
            emailUser: emailUser,
            emailPassword: emailPassword,
            emailSmtpServer: emailSmtpServer,
            emailSmtpPort: emailSmtpPort,
            allowOthers: allowOthers,
            maxNumberInterfaces: maxNumberInterfaces,
            allowOwnNetwork: allowOwnNetwork,
            maxNumberNetworks: maxNumberNetworks,
            logMore: logMore,
            logLevel: logLevel,
            disallowCom: disallowCom,
            addedOn: new Date(),
            addedBy: Meteor.user().emails[0].address,
            addedBy: this.userId,
        });
    },
    'edit.config' (emailHost, emailUser, emailPassword, emailSmtpServer, emailSmtpPort, allowOthers, maxNumberInterfaces, allowOwnNetwork, maxNumberNetworks, logMore, logLevel, disallowCom) {
        check(emailHost, String);
        check(emailUser, String);
        check(emailPassword, String);
        check(emailSmtpServer, String);
        check(emailSmtpPort, String);
        check(allowOthers, Boolean);
        check(allowOwnNetwork, Boolean);
        check(maxNumberInterfaces, Number);
        check(maxNumberNetworks, Number);
        check(logMore, Boolean);
        check(logLevel, String);
        check(disallowCom, Boolean);


        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to setup admin values, make sure you are logged in.');
        }

        let currConfig = Configuration.findOne();

        let configId = currConfig._id;

        return Configuration.update({ _id: configId }, {
            $set: {
                emailHost: emailHost,
                emailUser: emailUser,
                emailPassword: emailPassword,
                emailSmtpServer: emailSmtpServer,
                emailSmtpPort: emailSmtpPort,
                allowOthers: allowOthers,
                maxNumberInterfaces: maxNumberInterfaces,
                allowOwnNetwork: allowOwnNetwork,
                maxNumberNetworks: maxNumberNetworks,
                logMore: logMore,
                logLevel: logLevel,
                disallowCom: disallowCom,
                addedOn: new Date(),
                addedBy: Meteor.user().emails[0].address,
            }
        });
    },
    'delete.config' (configId) {
        check(configId, String);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to delete admin values, make sure you are logged in.');
        }

        return Configuration.remove({ _id: configId });
    },
});
