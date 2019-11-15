Template.menuBtn.events({
    'click .menu': () => {
        // // console.log('menu clicked');
        // document.getElementById("mySidenav").style.width = "275px";

        document.getElementById("mySidenav").style.width = "250px";
        document.getElementById("main").style.marginLeft = "250px";
        document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
    },
});
