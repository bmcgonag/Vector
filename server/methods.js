import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import ShellJS from 'shelljs';
import { Control } from '../imports/api/control.js';
import { WGInstalled } from '../imports/api/wgInstalled.js';

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
        let installed = WGInstalled.findOne({});

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
            // ShellJS.exec("echo '[Interface]' >> ~/" + interfaceName + ".conf");
            // ShellJS.exec("echo 'Address = " + ipv4 + "' >> ~/" + interfaceName + ".conf");
            // ShellJS.exec("echo 'Address = fd00::10:100:1/112' >> ~/" + interfaceName + ".conf");
            // ShellJS.exec("echo 'SaveConfig = true' >> ~/" + interfaceName + ".conf");
            // ShellJS.exec("echo 'PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE' >> ~/" + interfaceName + ".conf");
            // ShellJS.exec("echo 'PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE' >> ~/" + interfaceName + ".conf");
            // ShellJS.exec("echo 'ListenPort = " + port +"' ~/" + interfaceName + ".conf");
            // ShellJS.exec("echo 'PrivateKey = " + myPrivKey + "' >> ~/" + interfaceName + ".conf");
            // ShellJS.exec("echo '' >> ~/" + interfaceName + ".conf");

            ShellJS.exec("echo " + mpw + " | sudo -S echo '[Interface]' >> /etc/wireguard/" + interfaceName + ".conf");
            ShellJS.exec("echo " + mpw + " | sudo -S echo 'Address = " + ipv4 + "' >> /etc/wireguard/" + interfaceName + ".conf");
            ShellJS.exec("echo " + mpw + " | sudo -S echo 'Address = fd00::10:100:1/112' >> /etc/wireguard/" + interfaceName + ".conf");
            ShellJS.exec("echo " + mpw + " | sudo -S echo 'SaveConfig = true' >> /etc/wireguard/" + interfaceName + ".conf");
            ShellJS.exec("echo " + mpw + " | sudo -S echo 'PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE' >> /etc/wireguard/" + interfaceName + ".conf");
            ShellJS.exec("echo " + mpw + " | sudo -S echo 'PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE' >> /etc/wireguard/" + interfaceName + ".conf");
            ShellJS.exec("echo " + mpw + " | sudo -S echo 'ListenPort = " + port +"' >> /etc/wireguard/" + interfaceName + ".conf");
            ShellJS.exec("echo " + mpw + " | sudo -S echo 'PrivateKey = " + myPrivKey + "' >> /etc/wireguard/" + interfaceName + ".conf");
            ShellJS.exec("echo " + mpw + " | sudo -S echo '' >> /etc/wireguard/" + interfaceName + ".conf");
    
            // now copy the file to /etc/wireguard (requires root / sudo access)
            // if Wireguard is installed with apt, we need to put this in /etc/wireguard,
        
            if (installed.typeInstall == "apt") {
                myWgLocation = "/etc/wireguard/";
            } else {
                console.log("Error - WG Does not aappear to be installed.");
            }
            // console.log("About to copy the server interface file to /etc/wireguard/");
            // console.log("------------------------------------------");
            // console.log("echo " + mpw + " | sudo -S cp ~/" + interfaceName + ".conf /etc/wireguard/");
            // ShellJS.exec("echo " + mpw + " | sudo -S cp ~/" + interfaceName + ".conf /etc/wireguard/");

            // bring up the wireguard interface we just created.
            Meteor.setTimeout(function() {
                console.log("**** ---- ---- ---- ---- ---- ****");
                console.log("echo " + mpw + " | sudo -S wg-quick up " + interfaceName);
                ShellJS.exec("echo " + mpw + " | sudo -S wg-quick up " + interfaceName);
            }, 1500);
    
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
    'add.deviceInterface' (deviceName, deviceOS, deviceGroup, ipv4, ipv6, dnsPref) {
        check(deviceName, String);
        check(deviceOS, String);
        check(deviceGroup, String);
        check(ipv4, String);
        check(ipv6, String);
        check(dnsPref, String);

        // let's create our client private key and client public key
        ShellJS.exec("wg genkey | tee ~/" + deviceName + "-privatekey | wg pubkey > ~/" + deviceName + "-publickey");
        let privKey = ShellJS.exec("cat ~/" + deviceName + "-privatekey");
        let pubKey = ShellJS.exec("cat ~/" + deviceName + "-publickey");
        let myPrivKey = privKey.stdout.replace(/(\r\n|\n|\r)/gm, "");
        let myPubKey = pubKey.stdout.replace(/(\r\n|\n|\r)/gm, "");

        if (privKey == null || privKey == "" || pubKey == null || pubKey == "") {
            // report the error, and go back.
            console.log("    ****    ERROR: Unable to make Client Private / Public Key for Wireguard client " + deviceName);
            return;
        } else {
            Meteor.call('add.interface', deviceName, deviceOS, deviceGroup, ipv4, ipv6, myPrivKey, myPubKey, dnsPref, "0::0", function(err, result) {
                if (err) {
                    console.log("Error adding client interface: " + err);
                } else {
                    console.log("Inteface for " + interfaceName + " added Successfully.");
                    // now add the interface to the server
                    ShellJS.exec('sudo wg set wg0 peer ' + myPubKey + ' allowed-ips ' + ipv4 + '/24,fd00::10:97:2/64');
                }
            });
        }
    },
    "install.wg" () {
        // we will attempt to install wireguard using a snap isntall first.
        let mpw = Control.findOne({}).mpw;

        return ShellJS.exec("echo " + mpw + " | sudo -S add-apt-repository ppa:wireguard/wireguard; echo " + mpw + " | sudo -S apt install wireguard -y");
    },
});