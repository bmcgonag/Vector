import { ServerInfo } from '../../imports/api/serverInfo.js';

Template.serverInfoCard.onCreated(function() {
    this.subscribe("myServerInfo");
});

Template.serverInfoCard.onRendered(function() {

});

Template.serverInfoCard.helpers({
    serverData: function() {
        return ServerInfo.findOne({});
    },
});

Template.serverInfoCard.events({

});