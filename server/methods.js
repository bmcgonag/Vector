import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import ShellJS from 'shelljs';
import { Control } from '../imports/api/control.js';

Meteor.methods({
    'delete.User' (userId) {
        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to delete users, make sure you are logged in.');
        }

        return Meteor.users.remove({ _id: userId });
    },
    'test.shell' () {
        ShellJS.exec("echo 'test'");
    },
    'createServer.Interface' (mode, ipv4, interfaceName, port) {
        // here we'll make the automated interface for the server.

        ShellJS.exec("echo '[Interface]' >> ~/" + interfaceName + ".conf");
        ShellJS.exec("echo 'Address = " + ipv4 + "' >> ~/" + interfaceName + ".conf");
        ShellJS.exec("echo 'Address = fd00::10:97:1/112' >> ~/" + interfaceName + ".conf");
        ShellJS.exec("echo 'SaveConfig = true' >> ~/" + interfaceName + ".conf");
        ShellJS.exec("echo 'PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE' >> ~/" + interfaceName + ".conf");
        ShellJS.exec("echo 'PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE' >> ~/" + interfaceName + ".conf");
        ShellJS.exec("echo 'ListenPort = " + port +"' ~/" + interfaceName + ".conf");
        ShellJS.exec("echo 'PrivateKey = ' >> ~/" + interfaceName + ".conf");
        ShellJS.exec("echo ' ' >> ~/" + interfaceName + ".conf");

        // now copy the file to /etc/wireguard (requires root / sudo access)
        ShellJS.exec("echo " + mpw + " | sudo -S cp ~/" + interfaceName + ".conf /etc/wireguard/");
    },
});