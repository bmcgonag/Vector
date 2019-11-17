import { InterfaceGroups } from '../../imports/api/interfaceGroups.js';

Template.vectorGroupGrid.onCreated(function() {
    this.subscribe("myGroups");
});

Template.vectorGroupGrid.onRendered(function() {

});

Template.vectorGroupGrid.helpers({
    myGroups: function() {
        let myId = Meteor.userId();
        return InterfaceGroups.find({ groupUserId: myId });
    },
});

Template.vectorGroupGrid.events({
    'click .deleteGroup' (event) {
        let groupId = this._id;

        console.log("Delete groupId is: " + groupId);
    },
    'click .editGroup' (event) {
        let groupId = this._id;

        console.log("Edit groupId is: " + groupId);
    }
});