import { Configuration } from '../../imports/api/configuration.js';

Template.headerBar.onCreated(function() {
	this.subscribe("configuration");
});

Template.headerBar.onRendered(function() {
	$('.sidenav').sidenav();
});

Template.headerBar.helpers({
	myConfig: function() {
        return Configuration.findOne({});
    },
});

Template.headerBar.events({
	"click #signIn": function() {
		var signInModal = document.getElementById('signInModal');
		signInModal.style.display = "block";
	},
	'click  .navBtn' (event) {
        event.preventDefault();
        var clickedTarget = event.target.id;
        // console.log("User clicked: " + clickedTarget);
        if (clickedTarget == 'mainMenu') {
            FlowRouter.go('/');
        } else {
            FlowRouter.go('/' + clickedTarget);
            document.getElementById("mySidenav").style.width = "0";
        }
    },
    'click .signIn': () => {
        var signInModal = document.getElementById('signInModal');
        signInModal.style.display = "block";
    },
    'click .signOut': () => {
        FlowRouter.go('/');
        Meteor.logout();
    },
});
