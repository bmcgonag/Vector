import { InterfaceGroups } from '../../imports/api/interfaceGroups.js';

Template.vectorGroupGrid.onCreated(function() {
    this.subscribe("myGroups");
});

Template.vectorGroupGrid.onRendered(function() {
    Session.set("mode", "new");
});

Template.vectorGroupGrid.helpers({
    myGroups: function() {
        let myId = Meteor.userId();
        return InterfaceGroups.find({ groupUserId: myId });
    },
    groupMode: function() {
        let mode = Session.get("mode");
    },
});

Template.vectorGroupGrid.events({
    'click .deleteGroup' (event) {
        let groupId = this._id;

        // send this to a dialog and ensure the user wants to 
        // really delete the group.

    },
    'click .editGroup' (event) {
        let groupId = this._id;

        Session.set("mode", "edit");
    }
});