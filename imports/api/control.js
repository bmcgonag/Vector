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

        let myControl = Control.findOne({});

        if (typeof myControl != 'undefined') {
            // we should update instead of insert.
            Meteor.call('edit.control', myControl._id, mpw, function(err, result) {
                if (err) {
                    console.log("Error passing control from insert to update: " + err);
                }
            });
        } else {
            return Control.insert({
                mpw: mpw,
                exists: true,
                addedOn: new Date(),
                addedBy: Meteor.userId(),
            });
        }
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