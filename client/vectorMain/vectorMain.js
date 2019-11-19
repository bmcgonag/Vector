Template.vectorMain.onCreated(function() {

});

Template.vectorMain.onRendered(function() {
    $('.collapsible').collapsible();
    Session.set("showForm", false);
});

Template.vectorMain.helpers({
    showForm: function() {
        return Session.get("showForm");
    },
});

Template.vectorMain.events({
    "click #addInterfaceClient" (event) {
        Session.set("showForm", true);
    },
});
