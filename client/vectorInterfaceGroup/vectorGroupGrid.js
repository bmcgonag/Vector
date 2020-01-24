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

        Session.set("confirmationDialogTitle", "Confirm - Potentially Destructive Action");
        Session.set("confirmationDialogContent", "You are about to delete an Interface Group.  This action will not remove groups from your current interfaces, but may result in an inability for your to view those interfaces.  It is highly recommeneded that you first change the assigned group of any interfaces in this group. Do you wish to continue?");
        Session.set("eventConfirmCallBackFunction", "deleteInterfaceGroup");
        Session.set("eventConfirmNecessaryId", groupId);

        $("#genModal").modal('open');

    },
    'click .editGroup' (event) {
        let groupId = this._id;

        Session.set("mode", "edit");
    }
});

deleteInterfaceGroup = function(groupId) {
    Meteor.call("delete.group", groupId, function(err, result) {
        if (err) {
            showSnackbar("Error Occurred while Removing Group!", "red");
            console.log("ERROR:    **** Error removing group: " + err);
        } else {
            showSnackbar("Group Successfully Removed!", "green");
        }
    });
}