import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import ShellJS from 'shelljs';
import { WGInstalled } from '../imports/api/wgInstalled.js';
import { ServerInfo } from '../imports/api/serverInfo.js';
import { Interfaces } from '../imports/api/interfaces.js';

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
        let installed = WGInstalled.findOne({});

        ShellJS.exec("umask 077");
        ShellJS.exec("wg genkey | tee ~/privatekey | wg pubkey > ~/publickey");
        let privKey = ShellJS.exec("cat ~/privatekey");
        let pubKey = ShellJS.exec("cat ~/publickey");
        let myPrivKey = privKey.stdout.replace(/(\r\n|\n|\r)/gm, "");
        let myPubKey = pubKey.stdout.replace(/(\r\n|\n|\r)/gm, "");

        console.log("=======================================================");
        console.log("");
        console.log(ipv4);
        console.log("");
        console.log("=======================================================");
        console.log("");

        if (privKey == null || privKey == "" || pubKey == null || pubKey == "") {
            // report the error, and go back.
            console.log("    ****    ERROR: Unable to make Private / Public Key pari for Wireguard server.");
            return;
        } else {
            // here we'll make the automated interface for the server.
            ShellJS.exec("echo '[Interface]' >> $HOME/" + interfaceName + ".conf");
            ShellJS.exec("echo 'Address = " + ipv4 + "/24' >> $HOME/" + interfaceName + ".conf");
            ShellJS.exec("echo 'Address = fd00::10:100:1/112' >> $HOME/" + interfaceName + ".conf");
            ShellJS.exec("echo 'SaveConfig = true' >> $HOME/" + interfaceName + ".conf");
            ShellJS.exec("echo 'PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE' >> $HOME/" + interfaceName + ".conf");
            ShellJS.exec("echo 'PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE' >> $HOME/" + interfaceName + ".conf");
            ShellJS.exec("echo 'ListenPort = " + port + "' >> $HOME/" + interfaceName + ".conf");
            ShellJS.exec("echo 'PrivateKey = " + myPrivKey + "' >> $HOME/" + interfaceName + ".conf");
    
            // now copy the file to /etc/wireguard (requires root / sudo access)
            // if Wireguard is installed with apt, we need to put this in /etc/wireguard,
        
            if (installed.typeInstall == "apt") {
                myWgLocation = "/etc/wireguard/";
            } else {
                console.log("Error - WG Does not aappear to be installed.");
            }

            // console.log("About to copy the server interface file to /etc/wireguard/");
            // console.log("------------------------------------------");
            console.log("");
            console.log("cp ~/" + interfaceName + ".conf /etc/wireguard/");
            console.log("");
            ShellJS.exec("cp ~/" + interfaceName + ".conf /etc/wireguard/");

            // bring up the wireguard interface we just created.
            Meteor.setTimeout(function() {
                console.log("**** ---- ---- ---- ---- ---- ****");
                
                ShellJS.exec("systemctl start wg-quick@" + interfaceName, function(code, stdout, stderr) {
                    if (stderr) {
                        console.log("Error on systemctl start wg-quick: " + stderr);
                    } else if (stdout) {
                        console.log("Output of systemctl start wg-quick: " + stdout);
                    }
                });

                ShellJS.exec("systemctl enable wg-quick@" + interfaceName, function(code, stdout, stderr) {
                    if (stderr) {
                        console.log("Error on systemctl enable wg-quick: " + stderr);
                    } else if (stdout) {
                        console.log("Error on systemctl enable wg-quick: " + stdout);
                    }
                });

                console.log("systemctl start wg-quick@" + interfaceName);
                console.log("systemctl enable wg-quick@" + interfaceName);
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
    'add.deviceInterface' (deviceName, deviceOS, deviceGroup, ipv4, ipv6, dnsPref, customDNS, checkOnline, manKeyPub, manKeyPri) {
        check(deviceName, String);
        check(deviceOS, String);
        check(deviceGroup, String);
        check(ipv4, String);
        check(ipv6, String);
        check(dnsPref, String);
        check(customDNS, String);
        check(manKeyPub, String);
        check(manKeyPri, String);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to setup interfaces, make sure you are logged in.');
        }

        // get a few bits of information we'll need for adding our peer.
        let serverInfo = ServerInfo.findOne({});

        let myId = Meteor.userId();

        if (dnsPref == "Custom") {
            dnsPref = customDNS;
            console.log("DNS Preference marekd as Custom with IPs of: " + dnsPref);
        }
        
        // let's get the first three octets from our IPv4 string
        let ipParts = ipv4.split(".");
        let threeOcts = ipParts[0] + "." + ipParts[1] + "." + ipParts[2] + ".";

        // let's create our client private key and client public key
        if (manKeyPub == null || manKeyPri == null || manKeyPub == "" || manKeyPri == "") {
            ShellJS.exec("wg genkey | tee ~/" + deviceName + "-privatekey | wg pubkey > ~/" + deviceName + "-publickey");
        }

        Meteor.setTimeout(function() {
            let privKey;
            let pubkey;
            let myPrivKey;
            let myPubKey;
            if (manKeyPub == null || manKeyPri == null || manKeyPub == "" || manKeyPri == "") {
                privKey = ShellJS.exec("cat ~/" + deviceName + "-privatekey");
                pubKey = ShellJS.exec("cat ~/" + deviceName + "-publickey");
                myPrivKey = privKey.stdout.replace(/(\r\n|\n|\r)/gm, "");
                myPubKey = pubKey.stdout.replace(/(\r\n|\n|\r)/gm, "");
            } else {
                myPrivKey = manKeyPri;
                myPubKey = manKeyPub;
            }
    
            if (typeof myPrivKey == "undefined" || myPrivKey == null || myPrivKey == "" || typeof myPubKey == "undefined" || myPubKey == null || myPubKey == "") {
                // report the error, and go back.
                console.log("    ****    ERROR: Unable to make Client Private / Public Key for Wireguard client " + deviceName);
                return;
            } else {
                Meteor.call('add.interface', deviceName, deviceOS, deviceGroup, ipv4, ipv6, myPrivKey, myPubKey, dnsPref, "0::0", myId, checkOnline, function(err, result) {
                    if (err) {
                        console.log("Error adding client interface: " + err);
                    } else {
                        // now add the interface to the server
                         
                        // console.log('wg set wg0 peer ' + myPubKey + ' allowed-ips ' + ipv4 + '/32');
                        ShellJS.exec('wg set wg0 peer ' + myPubKey + ' allowed-ips ' + ipv4 + '/32', function(code, stdout, stderr) {
                            if (stderr) {
                                console.log("error on wg set peer: " + stderr);
                            } else if (stdout) {
                                console.log("output from wg set peer: " + stdout);
                            }
                        });
                        Meteor.setTimeout(function() {
                            // console.log('wg-quick save wg0');
                            ShellJS.exec('wg-quick save wg0', function(code, stdout, stderr) {
                                if (stderr) {
                                    console.log("Error on wg-quick save: " + stderr);
                                } else if (stdout) {
                                    console.log("Output from wg-quick save: " + stdout);
                                }
                            });
                        }, 250);
                        return;
                    }
                });
            }
        }, 250);
    },
    "install.wg" () {
        // we will attempt to install wireguard using a snap isntall first.
        return ShellJS.exec("add-apt-repository ppa:wireguard/wireguard; apt install wireguard -y");
    },
    "remove.wgClient" (intPubKey, clientIntName) {
        let serverInfo = ServerInfo.findOne({});

        let intName = serverInfo.serverInterfaceName;
        console.log("Running cmd: ");
        console.log("wg set " + intName + " peer " + intPubKey + " remove");
        console.log("");
        console.log("----------------------------------------------------");
        ShellJS.exec("wg set " + intName + " peer " + intPubKey + " remove", function(code, stdout, stderr) {
            if (stderr) {
                console.log("Error running cmd to remove client interface: " + stderr);
            } else if (stdout) {
                console.log("Output from running cmd to remove client interface: " + stdout);
            }
        });
        return;

    }
});

