

Template.myModal.onCreated(function() {
    
});

Template.myModal.onRendered(function() {
    $('.modal').modal();
});

Template.myModal.helpers({
    modalHeader: function() {
        return Session.get("modalHeader");
    },
    modalBody: function() {
        return Session.get("modalBody");
    }
});

Template.myModal.events({
    'click #continue' (event) {
        let callingId = Session.get("callingId");
        let callingModule = Session.get("callingModule");
        let callingAction = Session.get("callingAction");

        // now take the action for the id and module, and perform it.
        
    },
    'click #cancel' (event) {
        event.preventDefault();

        var myCalledModal = document.getElementById('genModal');
        myCalledModal.style.display = 'none';
    },
});
