import { Interfaces } from '../../imports/api/interfaces.js';

Template.vectorGroup.onCreated(function() {
    this.subscribe("myGroups");
});

Template.vectorGroup.onRendered(function() {

});

Template.vectorGroup.helpers({

});

Template.vectorGroup.events({
    'click #saveGroup' (event) {
        event.preventDefault();

        let groupName = $("#groupName").val();

        if (groupName == "" || groupName == null) {
            showSnackbar("Group Name is Required in Order to Save!", "orange");
        } else {
            Meteor.call("add.group", groupName, function(err, result) {
                if (err) {
                    console.log("Error adding Group Name: " + err);
                    showSnackbar("Error Adding Group Name.", "red");
                } else {
                    $("#groupName").val("");
                    showSnackbar("Group Name Added Successfully!", "green");
                }
            });
        }
    },
    'click #cancelGroup' (event) {
        event.preventDefault();
        $("#groupName").val("");
    }
});