import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import ShellJS, { config } from 'shelljs';
import { WGInstalled } from '../imports/api/wgInstalled.js';
import { ServerInfo } from '../imports/api/serverInfo.js';
import { Interfaces } from '../imports/api/interfaces.js';
import { Configuration } from '../imports/api/configuration.js';
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
        let installed = WGInstalled.findOne({});
        let Configs = Configuration.findOne({});
        let Controls = Control.findOne({});

        let myMachineUser;
        let mysudopass = Controls.mpw;

        // let's see which user I am.
        ShellJS.exec("whoami", function(code, stdout, stderr) {
            if (stdout) {
                console.log("I am : " + stdout);
                myMachineUser = stdout;
            } else if (stderr) {
                console.log("Error on whoamI cmd: " + stderr);
            }
        });

        if (typeof Configs.logLevel == "undefined") {
            console.log("You must setup the system Configuration before creating your server interface!");
        } else {
            ShellJS.exec("umask 077");
            ShellJS.exec("wg genkey | tee ~/privatekey | wg pubkey > ~/publickey");
            let privKey = ShellJS.exec("cat ~/privatekey");
            let pubKey = ShellJS.exec("cat ~/publickey");
            let myPrivKey = privKey.stdout.replace(/(\r\n|\n|\r)/gm, "");
            let myPubKey = pubKey.stdout.replace(/(\r\n|\n|\r)/gm, "");
    
            if (Configs.logLevel == "Verbose") {
                console.log("=======================================================");
                console.log("");
                console.log(ipv4);
                console.log("");
                console.log("=======================================================");
                console.log("");
            }
    
            if (privKey == null || privKey == "" || pubKey == null || pubKey == "") {
                // report the error, and go back.
                if (Configs.logLevel == "Verbose" || Configs.logLevel == "Error") {
                    console.log("    ****    ERROR: Unable to make Private / Public Key pari for WireGuard server.");
                }
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
                // if WireGuard is installed with apt, we need to put this in /etc/wireguard,
            
                if (installed.typeInstall == "apt") {
                    myWgLocation = "/etc/wireguard/";
                } else {
                    if (Configs.logLevel == "Error" || Configs.logLevel == "Verbose") {
                        console.log("Error - WG Does not aappear to be installed.");
                    }
                }
    
                if (Configs.logLevel == "Verbose") {
                    console.log("About to copy the server interface file to /etc/wireguard/");
                    console.log("------------------------------------------");
    
                    console.log("");
                    console.log("echo '" + sudoUserPW + "' | sudo -S cp ~/" + interfaceName + ".conf /etc/wireguard/");
                    console.log("");
                }
    
                // if (myMachineUser == "root") {
                    ShellJS.exec("cp ~/" + interfaceName + ".conf /etc/wireguard/");
                // } else {
                //     ShellJS.exec("echo '" + mysudopass + "' | sudo -S cp ~/" + interfaceName + ".conf /etc/wireguard/");
                // }
                
    
                // bring up the WireGuard interface we just created.
                Meteor.setTimeout(function() {
                    ShellJS.exec("systemctl start wg-quick@" + interfaceName, function(code, stdout, stderr) {
                        if (stderr) {
                            if (Configs.logLevel == "Verbose" || Configs.logLevel == "Error") {
                                console.log("Error on systemctl start wg-quick: " + stderr);
                            }
                        } else if (stdout) {
                            if (Configs.logLevel == "Verbose") {
                                console.log("Output of systemctl start wg-quick: " + stdout);
                            }
                        }
                    });
    
                    ShellJS.exec("systemctl enable wg-quick@" + interfaceName, function(code, stdout, stderr) {
                        if (stderr) {
                            if (Configs.logLevel == "Verbose" || Configs.logLevel == "Error") {
                                console.log("Error on systemctl enable wg-quick: " + stderr);
                            }
                        } else if (stdout) {
                            if (Configs.logLevel == "Verbose") {
                                console.log("Error on systemctl enable wg-quick: " + stdout);
                            }
                        }
                    });
    
                    if (Configs.logLevel == "Verbose") {
                        console.log("systemctl start wg-quick@" + interfaceName);
                        console.log("systemctl enable wg-quick@" + interfaceName);
                    }
                }, 1500);
        
                Meteor.call("add.serverInfo", ipv4, interfaceName, port, myPrivKey, myPubKey, function(err, result) {
                    if (err) {
                        console.log("Error adding Server Info: " + err);
                    } else {
                        if (Configs.logLevel == "Verbose") {
                            console.log("Server Info added successfully!");
                        } 
                    }
                });
            }
        }          
    },
    'add.deviceInterface' (deviceName, deviceOS, deviceGroup, ipv4, ipv6, dnsPref, customDNS, checkOnline, manKeyPub, validTil, validTilFrame) {
        check(deviceName, String);
        check(deviceOS, String);
        check(deviceGroup, String);
        check(ipv4, String);
        check(ipv6, String);
        check(dnsPref, String);
        check(customDNS, String);
        check(manKeyPub, String);
        check(validTil, String);
        check(validTilFrame, String);

        validTil = parseInt(validTil);

        if (!this.userId) {
            throw new Meteor.Error('User is not allowed to setup interfaces, make sure you are logged in.');
        }

        // get a few bits of information we'll need for adding our peer.
        let serverInfo = ServerInfo.findOne({});
        let Configs = Configuration.findOne({});

        if (Configs.logLeve == "Verbose") {
            console.log("****----    Passed Arguements to Interface Write Method    ----****");
            console.log("");
            console.log("Valid Til:" + validTil);
            console.log("Valid Til Frame: " + validTilFrame);
        }

        let myId = Meteor.userId();

        if (dnsPref == "Custom") {
            dnsPref = customDNS;
            if (Configs.logLevel == "Verbose") {
                console.log("DNS Preference marekd as Custom with IPs of: " + dnsPref);
            }
        }
        
        // let's get the first three octets from our IPv4 string
        let ipParts = ipv4.split(".");
        let threeOcts = ipParts[0] + "." + ipParts[1] + "." + ipParts[2] + ".";

        // let's create our client private key and client public key
        if (manKeyPub == null || manKeyPub == "") {
            ShellJS.exec("wg genkey | tee ~/" + deviceName + "-privatekey | wg pubkey > ~/" + deviceName + "-publickey");
        }

        Meteor.setTimeout(function() {
            let privKey;
            let pubkey;
            let myPrivKey;
            let myPubKey;
            if (manKeyPub == null || manKeyPub == "") {
                privKey = ShellJS.exec("cat ~/" + deviceName + "-privatekey");
                pubKey = ShellJS.exec("cat ~/" + deviceName + "-publickey");
                myPrivKey = privKey.stdout.replace(/(\r\n|\n|\r)/gm, "");
                myPubKey = pubKey.stdout.replace(/(\r\n|\n|\r)/gm, "");
            } else {
                myPrivKey = "";
                myPubKey = manKeyPub;
            }
    
            if (typeof myPrivKey == "undefined" || myPrivKey == null || typeof myPubKey == "undefined" || myPubKey == null || myPubKey == "") {
                // report the error, and go back.
                if (Configs.logLevel == "Error" || Configs.logLevel == "Verbose") {
                    console.log("    ****    ERROR: Unable to make Client Private / Public Key for WireGuard client " + deviceName);
                }
                return;
            } else {
                Meteor.call('add.interface', deviceName, deviceOS, deviceGroup, ipv4, ipv6, myPrivKey, myPubKey, dnsPref, "0::0", myId, checkOnline, validTil, validTilFrame, function(err, result) {
                    if (err) {
                        if (Configs.logLevel == "Error" || Configs.logLevel == "Verbose") {
                            console.log("Error adding client interface: " + err);
                        }
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
                            console.log('wg-quick save wg0');
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
        // we will attempt to install WireGuard using a snap isntall first.
        return ShellJS.exec("sudo add-apt-repository ppa:wireguard/wireguard && sudo apt install wireguard -y");
    },
    "remove.wgClient" (intPubKey, clientIntName) {
        let serverInfo = ServerInfo.findOne({});
        let Configs = Configuration.findOne({});

        let intName = serverInfo.serverInterfaceName;
        if (Configs.logLevel == "Verbose") {
            console.log("Running cmd: ");
            console.log("wg set " + intName + " peer " + intPubKey + " remove");
            console.log("");
            console.log("----------------------------------------------------");
        }
        ShellJS.exec("wg set " + intName + " peer " + intPubKey + " remove", function(code, stdout, stderr) {
            if (stderr) {
                if (Configs.logLevel == "Error" || Configs.logLevel == "Verbose") {
                    console.log("Error running cmd to remove client interface: " + stderr);
                }
            } else if (stdout) {
                if (Configs.logLevel == "Verbose") {
                    console.log("Output from running cmd to remove client interface: " + stdout);
                }
            }
        });
        return;
    }
});
