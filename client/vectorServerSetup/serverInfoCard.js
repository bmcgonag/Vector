import { ServerInfo } from '../../imports/api/serverInfo.js';

Template.serverInfoCard.onCreated(function() {
    this.subscribe("myServerInfo");
});

Template.serverInfoCard.onRendered(function() {
    Session.set("editServerShow", false);
});

Template.serverInfoCard.helpers({
    serverData: function() {
        return ServerInfo.findOne({});
    },
});

Template.serverInfoCard.events({
    'click #editServerInfoLink' (event) {
        event.preventDefault();
        Session.set("editServerShow", true);
    },
});