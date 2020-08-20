

Template.adminInfo.onCreated(function() {
    
});

Template.adminInfo.onRendered(function() {
    
});

Template.adminInfo.helpers({
    
});

Template.adminInfo.events({
    'click #restartVectorServer' (event) {
        event.preventDefault();

        Meteor.call("restartVector", function(err, result) {
            if (err) {
                showSnackbar("Error occurred restarting Vecotr.", "red");
                console.log("Error restarting Vector: " + err);
            } else {
                showSnackbar("Vector Restart Called!", "green");
            }
        });
    }, 
});
