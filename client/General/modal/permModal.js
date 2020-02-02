

Template.permModal.onCreated(function() {

});

Template.permModal.onRendered(function() {
    $('.modal').modal();
});

Template.permModal.helpers({

});

Template.permModal.events({
    'click #cancel' (event) {
        event.preventDefault();

        $("#permModal").modal('close');
    },
    'click #continue' (event) {
        event.preventDefault();

        // get the values for the server config
        let setupType = Session.get("setupType");
        let ipv4Server = Session.get("ipv4Server");
        let serverIntName = Session.get("serverIntName");
        let serverListenPort = Session.get("serverListenPort");

        // get the super user passwordd
        let supw = $("#supw").val();

        // call the method and pass the values
        createServerConfirm(supw, setupType, ipv4Server, serverIntName, serverListenPort);

        $("#permModal").modal('close');
    }
});