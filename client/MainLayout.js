import { WGInstalled } from '../imports/api/wgInstalled.js';
import { Control } from '../imports/api/control.js';

Template.MainLayout.onCreated(function() {
    this.subscribe("wgInstall");
    this.subscribe("myControl");
});

Template.MainLayout.onRendered(function() {
    Session.set("ip6pattern", "fd00::10:10:");
});

Template.MainLayout.helpers({
    wgInstall: function() {
        return WGInstalled.findOne({});
    },
    controlExists: function() {
        let existing = Control.findOne({});
        if (typeof existing == 'undefined') {
            return false;
        } else {
            return existing.exists;
        }
    },
});

Template.MainLayout.events({
    "click .fixMPW" (event) {
        FlowRouter.go('/configSystem');
    },
});