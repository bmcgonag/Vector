FlowRouter.route('/', {
    name: 'home',
    action() {
        BlazeLayout.render('MainLayout', { main: "vectorMain" });
    }
});

FlowRouter.route('/userDash', {
    name: 'home',
    action() {
        BlazeLayout.render('MainLayout', { main: "vectorMain" });
    }
});

FlowRouter.route('/vectorGroup', {
    name: 'vectorGroup',
    action() {
        BlazeLayout.render('MainLayout', { main: "vectorGroup" });
    }
});

FlowRouter.route("/serverConfig", {
    name: 'serverSetup',
    action() {
        BlazeLayout.render('MainLayout', { main: 'serverSetup' });
    }
});
