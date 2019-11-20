import { Interfaces } from "../../imports/api/interfaces.js";
import { InterfaceGroups } from "../../imports/api/interfaceGroups.js";

Template.vectorMain.onCreated(function() {
    this.subscribe("myInterfaces");
    this.subscribe("myGroups");
});

Template.vectorMain.onRendered(function() {
    $('.collapsible').collapsible();
    Session.set("showForm", false);
    $('.collapsible').collapsible();
});

Template.vectorMain.helpers({
    showForm: function() {
        return Session.get("showForm");
    },
    clients: function() {
        let thisGroup = this.groupName;
        return Interfaces.find({ interfaceGroup: thisGroup });
    },
    clientGroups: function() {
        return InterfaceGroups.find({});
    },
    noMachines: function() {
        let thisGroup = this.groupName;
        return Interfaces.find({ interfaceGroup: thisGroup }).count();
    },
});

Template.vectorMain.events({
    "click #addInterfaceClient" (event) {
        Session.set("showForm", true);
    },
});
