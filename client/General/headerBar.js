import { Configuration } from '../../imports/api/configuration.js';

Template.headerBar.onCreated(function() {
	this.subscribe("configuration");
});

Template.headerBar.onRendered(function() {
    $('.sidenav').sidenav();
    setTimeout(function() {
        $('.sidenav').sidenav();
    }, 100)
});

Template.headerBar.helpers({
	myConfig: function() {
        return Configuration.findOne({});
    },
});

Template.headerBar.events({
	'click  .navBtn' (event) {
        event.preventDefault();
        var clickedTarget = event.target.id;
        // console.log("User clicked: " + clickedTarget);
        if (clickedTarget == 'mainMenu') {
            FlowRouter.go('/');
        } else {
            FlowRouter.go('/' + clickedTarget);
        }
    },
    'click .signOut': () => {
        FlowRouter.go('/');
        Meteor.logout();
    },
});
