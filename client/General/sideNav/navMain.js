Template.navMain.events({
    'click  .navBtn' (event) {
        event.preventDefault();
        var clickedTarget = event.target.id;
        // console.log("User clicked: " + clickedTarget);
        closeSide();
        if (clickedTarget == 'mainMenu') {
            FlowRouter.go('/');
        } else {
            FlowRouter.go('/' + clickedTarget);
            document.getElementById("mySidenav").style.width = "0";
        }
    },
    'click .signIn': () => {
        closeSide();
        var signInModal = document.getElementById('signInModal');
        signInModal.style.display = "block";
    },
    'click .signOut': () => {
        closeSide();
        FlowRouter.go('/');
        Meteor.logout();
    },
    'click .closebtn': () => {
        closeSide();
    },
});

var closeSide = function() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
    document.body.style.backgroundColor = "white";
}
