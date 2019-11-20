import { Interfaces } from '../../imports/api/interfaces.js';

Template.clientCard.onCreated(function() {
    this.subscribe("myInterfaces");
});

Template.clientCard.onRendered(function() {

});

Template.clientCard.helpers({
    clientData: function() {
        return Interfaces.find({});
    },
});

Template.clientCard.events({

});