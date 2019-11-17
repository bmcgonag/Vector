import { Interfaces } from '../../imports/api/interfaces.js';
import { InterfaceGroups } from '../../imports/api/interfaceGroups.js';

Template.vectorForm.onCreated(function() {
    this.subscribe("myInterfaces");
    this.subscribe("myGroups");
});

Template.vectorForm.onRendered(function() {
    $("select").material_select();
    setTimeout(function() {
        $("select").material_select();
        materialize.updateTextFields()
    }, 200);
});

Template.vectorForm.helpers({
    myGroups: function() {
        let myId = Meteor.userId();
        return InterfaceGroups.find({ groupUserId: myId });
    },
});

Template.vectorForm.events({

});