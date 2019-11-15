

Template.headerBar.onCreated(function() {

});

Template.headerBar.onRendered(function() {

});

Template.headerBar.helpers({

});

Template.headerBar.events({
	"click #signIn": function() {
		var signInModal = document.getElementById('signInModal');
		signInModal.style.display = "block";
	},
});
