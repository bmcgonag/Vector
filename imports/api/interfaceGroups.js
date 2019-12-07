import { Meter } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const InterfaceGroups = new Mongo.Collection('interfaceGroups');

InterfaceGroups.allow({
    insert: function(userId, doc){
        // if use id exists, allow insert
        return !!userId;
    },
});

Meteor.methods({
    'add.group' (groupName) {
        check(groupName, String);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to setup interface groups, make sure you are logged in.');
        }

        let myId = Meteor.userId();

        return InterfaceGroups.insert({
            groupName: groupName,
            addedOn: new Date(),
            groupUser: Meteor.user().emails[0].address,
            groupUserId: myId,
        });
    },
    'edit.group' (groupId, groupName) {
        check(groupId, String);
        check(groupName, String);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to edit interface groups, make sure you are logged in.');
        }

        return InterfaceGroups.update({ _id: groupId }, {
            $set: {
                groupName: groupName,
                updatedOn: new Date(),
            }
        });
    },
    'delete.group' (groupId) {
        check(groupId, String);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to delete interface groups, make sure you are logged in.');
        }

        return InterfaceGroups.remove({ _id: groupId });
    }
});