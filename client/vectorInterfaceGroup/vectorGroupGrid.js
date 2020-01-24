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
        let modeId = Session.get("editGroupId");
        if (this._id == modeId) {
            let modeInfo = { "mode": mode, "modeId":modeId };
            return modeInfo;
        }
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
        Session.set("editGroupId", groupId);
    },
    'click .cancelEditGroupName' (event) {
        event.preventDefault();

        Session.set("mode", "new");
    },
    'click .editGroupName' (event) {
        event.preventDefault();
        let newName = $("#groupNameEdit").val();
        let groupNameId = this._id;

        // now call a modal to confirm the change.

        Session.set("newGroupName", newName);
        Session.set("confirmationDialogTitle", "Confirm Change of Group Name");
        Session.set("confirmationDialogContent", "You are about to change a group name.  All interfaces associated to this group name will be moved to the new group name. Do you wish to continue?");
        Session.set("eventConfirmCallBackFunction", "changeInterfaceGroup");
        Session.set("eventConfirmNecessaryId", groupNameId);

        $("#genModal").modal('open');
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

changeInterfaceGroup = function(groupNameId) {
    let newGroupName = Session.get("newGroupName");
    Meteor.call("edit.group", groupNameId, newGroupName, function(err, result) {
        if (err) {
            showSnackbar("Error Occurred while Changing the Group Name!", "red");
            console.log("ERROR:    **** Error changing group name: " + err);
        } else {
            showSnackbar("Group Name Updated Successfully!", "green");
            Session.set("mode", "new");
        }
    });
}