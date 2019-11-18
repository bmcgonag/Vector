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
        // We need to create our Public and Private keys
        let mpw = Control.findOne({}).mpw;
        console.log("mpw: " + mpw);

        ShellJS.exec("umask 077");
        ShellJS.exec("wg genkey | tee ~/privatekey | wg pubkey > ~/publickey");
        let privKey = ShellJS.exec("cat ~/privatekey");
        let pubKey = ShellJS.exec("cat ~/publickey");
        let myPrivKey = privKey.stdout.replace(/(\r\n|\n|\r)/gm, "");
        let myPubKey = pubKey.stdout.replace(/(\r\n|\n|\r)/gm, "");

        if (privKey == null || privKey == "" || pubKey == null || pubKey == "") {
            // report the error, and go back.
            console.log("    ****    ERROR: Unable to make Private / Public Key pari for Wireguard server.");
            return;
        } else {
            // here we'll make the automated interface for the server.
            ShellJS.exec("echo '[Interface]' >> ~/" + interfaceName + ".conf");
            ShellJS.exec("echo 'Address = " + ipv4 + "' >> ~/" + interfaceName + ".conf");
            ShellJS.exec("echo 'Address = fd00::10:97:1/112' >> ~/" + interfaceName + ".conf");
            ShellJS.exec("echo 'SaveConfig = true' >> ~/" + interfaceName + ".conf");
            ShellJS.exec("echo 'PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE' >> ~/" + interfaceName + ".conf");
            ShellJS.exec("echo 'PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE' >> ~/" + interfaceName + ".conf");
            ShellJS.exec("echo 'ListenPort = " + port +"' ~/" + interfaceName + ".conf");
            ShellJS.exec("echo 'PrivateKey = " + myPrivKey + "' >> ~/" + interfaceName + ".conf");
            ShellJS.exec("echo ' ' >> ~/" + interfaceName + ".conf");
    
            // now copy the file to /etc/wireguard (requires root / sudo access)
            ShellJS.exec("echo " + mpw + " | sudo -S cp ~/" + interfaceName + ".conf /etc/wireguard/");
    
            Meteor.call("add.serverInfo", ipv4, interfaceName, port, myPrivKey, myPubKey, function(err, result) {
                if (err) {
                    console.log("Error adding Server Info: " + err);
                } else {
                    console.log("Server Info added successfully!");
                }
            });
        }  
    },
    'add.mpd' (mpd) {
        Meteor.call("add.control", mpd, function(err, result) {
            if (err) {
                console.log("Error adding mpd to db: " + err);
            }
        });
    },
});