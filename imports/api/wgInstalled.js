import { Meter } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const WGInstalled = new Mongo.Collection('wgInstalled');

WGInstalled.allow({
    insert: function(userId, doc){
        // if use id exists, allow insert
        return !!userId;
    },
});

Meteor.methods({
    'add.wgInstalled' (installed) {
        check(installed, Boolean);

        let installedId = WGInstalled.findOne({});

        if (typeof installedId == 'undefined' || installedId == null || installedId == "") {
            return WGInstalled.insert({
                wgInstalled: installed,
                checkedOn: new Date(),
            });
        } else {
            Meteor.call("update.wgInstalled", installed, function(err, result) {
                if (err) {
                    console.log("Error calling update method from add method: " + err);
                } else {
                    console.log("Update method called successfully!");
                }
            });
        }
    },
    'update.wgInstalled' (installed) {
        check(installed, Boolean);

        let installedId = WGInstalled.findOne({})._id;

        return WGInstalled.update({ _id: installedId }, {
            $set: {
                wgInstalled: installed,
                checkedOn: new Date(),
            }
        });
    },
});