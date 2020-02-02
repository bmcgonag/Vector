

Template.myModal.onCreated(function() {
    
});

Template.myModal.onRendered(function() {
    $('.modal').modal();
});

Template.myModal.helpers({
    modalHeader: function() {
        return Session.get("confirmationDialogTitle");
    },
    modalBody: function() {
        return Session.get("confirmationDialogContent");
    }
});

Template.myModal.events({
    'click #continue' (event) {
        event.preventDefault();

        let callFunction = Session.get("eventConfirmCallBackFunction");
        let functionPassId = Session.get("eventConfirmNecessaryId"); // <-- this can be an actual ID, an object, a function, whatever...

        $("#genModal").modal('close');

        window[callFunction](functionPassId); // <-- calls the function and passed the Id on confirm.
        
    },
    'click #cancel' (event) {
        event.preventDefault();

        $("#genModal").modal('close');
    },
});
