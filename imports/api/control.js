import { Meter } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Control = new Mongo.Collection('control');

Control.allow({
    insert: function(userId, doc){
        // if use id exists, allow insert
        return !!userId;
    },
});

Meteor.methods({
    'add.control' (mpw) {
        check(mpw, String);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to add control information, make sure you are logged in.');
        }

        return Control.insert({
            mpw: mpw,
            addedOn: new Date(),
            addedBy: this.userId,
        });
    },
    'edit.control' (controlId, mpw) {
        check(controlId, String);
        check(mpw, String);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to edit control information, make sure you are logged in.');
        }

        return Control.update({ _id: controlId }, {
            $set: {
                mpw: mpw,
                updatedOn: new Date(),
                updatedBy: this.userId,
            }
        });
    },
});