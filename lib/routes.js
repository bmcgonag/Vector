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
        BlazeLayout.render('MainLayout', { main: 'serverMain' });
    }
});

FlowRouter.route('/configSystem', {
    name: 'adminConfig',
    action() {
        BlazeLayout.render('MainLayout', { main: 'adminConfig' });
    }
});

FlowRouter.route('/adminInfo', {
    name: 'adminConfig',
    action() {
        BlazeLayout.render('MainLayout', { main: 'adminInfo' });
    }
});
