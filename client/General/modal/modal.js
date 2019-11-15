

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
        
    },
    'click #cancel' (event) {
        event.preventDefault();

        var myCalledModal = document.getElementById('genModal');
        myCalledModal.style.display = 'none';
    },
});
