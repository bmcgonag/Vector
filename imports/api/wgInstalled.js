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
    'add.wgInstalled' (installed, typeInstall) {
        check(installed, Boolean);
        check(typeInstall, String);

        let installedId = WGInstalled.findOne({});

        if (typeof installedId == 'undefined') {
            return WGInstalled.insert({
                wgInstalled: installed,
                typeInstall: typeInstall,
                checkedOn: new Date(),
            });
        } else {
            Meteor.call("update.wgInstalled", installed, typeInstall, function(err, result) {
                if (err) {
                    console.log("Error calling update method from add method: " + err);
                } else {
                    console.log("Update method called successfully!");
                }
            });
        }
    },
    'update.wgInstalled' (installed, typeInstall) {
        check(installed, Boolean);
        check(typeInstall, String);

        let installedId = WGInstalled.findOne({})._id;

        return WGInstalled.update({ _id: installedId }, {
            $set: {
                wgInstalled: installed,
                typeInstall: typeInstall,
                checkedOn: new Date(),
            }
        });
    },
});