import { Meteor } from 'meteor/meteor';
import { Configuration } from '../imports/api/configuration.js';
import ShellJS, { config } from 'shelljs';
import { WGInstalled } from '../imports/api/wgInstalled.js';
import { Interfaces } from '../imports/api/interfaces.js';
import { ServerInfo } from '../imports/api/serverInfo.js';

Meteor.startup(() => {
  // code to run on server at startup
  try {
    let Configs = Configuration.findOne({});

    if (typeof Configs == 'undefined') {
      Meteor.call('new.config', "", "", "", "", "", false, 0, false, 0, false, "", function(err, result) {
        if (err) {
          console.log("Error setting initial configuration: " + err);
        } else {
          console.log("Initial Config Set.");
          Configs = Configuration.findOne({});
        }
      });
    }

    // let's see which user I am.
    ShellJS.exec("whoami", function(code, stdout, stderr) {
        if (stdout) {
            console.log("I am : " + stdout);
        } else if (stderr) {
            console.log("Error on whoamI cmd: " + stderr);
        }
    });
    
    // need to check to see if wireguard appears to be installed.
    let installed;
    let isInstalled = ShellJS.exec("[ -d /etc/wireguard ] && echo 'Directory found' || echo 'Directory /etc/wireguard not found'");
    if (Configs.logLevel == "Verbose") {
      console.log("INFO:   ----    Is Installed: " + isInstalled.stdout);
    }
    
    let isthere = isInstalled.stdout.replace(/(\r\n|\n|\r)/gm, "");
    if (Configs.logLevel == "Verbose") {
      console.log("INFO:    " + isthere);
    }
    
    let typeInstall;

    // start checking if machines are online
    startPing();

    // start checking for interfaces that are temporary, or temporarily disabled
    Meteor.setInterval(function() {
      // console.log("Starting Enabled / Disabled Checking...")
      checkEnabledDisabled();
    }, 300000);

    // ****    we wait for 200 milliseconds to give the command time to complete, then check
    // ****    and set the value appropriately
    Meteor.setTimeout(function() {
      if (isthere == "Directory found") {
        installed = true;
      } else {
        installed = false;
      }
      
      if (isthere == "Directory found") {
        typeInstall = "apt";
      } else {
        typeInstall = "none";
      }
  
      Meteor.call('add.wgInstalled', installed, typeInstall, function(err, result) {
        if (err) {
          if (Configs.logLevel == "Verbose" || Configsl.logLevel == "Error") {
            console.log("ERROR:   Error adding installed state: " + err);
          }
        }
      });
    }, 750);

    // check to see if the message settings are set, adn if not, notify the end user admin.
    let msgSettings = Configuration.findOne({});
    if (typeof msgSettings.emailUser == 'undefined' || msgSettings.emailUser == null || msgSettings.emailUser == "") {
      // msg settings not set, route user to setup for message settings.
        if (Configs.logLevel == "Verbose") {
          console.log("INFO:   Didn't find email settings.");
        }
    } else {
        let user = msgSettings.emailUser;
        if (Configs.logLevel == "Verbose") {
          console.log("INFO:   Found User: " + user);
        }
        Meteor.call('setEmailFromServer', msgSettings);
    }
  } catch (error) {
    let Configs = Configuration.findOne({});
      if (Configs.logLevel == "Error" || Configs.logLevel == "Verbose") {
        console.log("ERROR:   Error caught in server/main.js: " + error);
      }
  }
});

Meteor.methods({
  'setEmailFromServer' (msgSettings) {
    let Configs = Configuration.findOne({});

    if (Configs.logLevel == "Verbose") {
      console.log("INFO:    Getting message setting setup.");
    }
      
    if (typeof msgSettings != 'undefined') {
        if (Configs.logLevel == "Verbose") {
          console.log("INFO:   " + msgSettings.emailUser);
        }
        smtp = {
            username: msgSettings.emailUser,
            password: msgSettings.emailPassword,
            server: msgSettings.emailSmtpServer,
            port: msgSettings.emailSmtpPort
        }
        process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
        if (Configs.logLevel == "Verbose") {
          console.log("INFO:    " + process.env.MAIL_URL);
        }
    }
  }
});

async function startPing() {
  let Configs = Configuration.findOne({});

  if (Configs.logLevel == "Verbose") {
    console.log("INFO:    ----    told to start ping");
  }

  // start our timer, then ping each device listed in Interfaces collection for connectivity

  Meteor.setInterval(async function() {
    if (Configs.logLevel == "Verbose") {
      console.log("INFO:   Starting nMap function: ");
    }
    
    await startStatus();

    return true;
  }, 60000); // re-run every minute
}

async function checkStatus() {
  try {
    let onlineIds = [];
    let results = {};
    let serverIP = ServerInfo.findOne({});
    
    let Configs = Configuration.findOne({});
  
    if (typeof serverIp != 'undefined' && serverIp != null && serverIp != "") {
      let servIp = serverIP.ipAddress;
      let ipParts = servIp.split(".");
      let servIp3Oct = ipParts[0] + "." + ipParts[1] + "." + ipParts[2];

      if (Configs.logLevel == "Verbose") {
        console.log("INFO:   About to run Shell command.");
        console.log("INFO:   3 oct = " + servIp3Oct);
        console.log("----    ----    ----    ----   ----");
      }
    
      var output = ShellJS.exec("nmap -n -sn " + servIp3Oct + ".0/24 -oG - | awk '/Up$/{print $2}'", function(code, stdout, stderr) {
        if (Configs.logLevel == "Verbose") {
          console.log("INFO:   Running nmap search now.");
        }
      }); 
    
      output.stdout.on("data", function(data) {
        if (Configs.logLevel == "Verbose") {
          console.log("SUCCESS:   Got data from stdout: ");
          console.dir(data);
        }
    
        let ipsarr = data.split("\n");
        results.onlineIds = ipsarr;
        insertResults(results);
      });
    
      output.stderr.on("data", function(data) {
        if (Configs.logLevel == "Verbose") {
          console.log("---    ***    ---");
          console.log("ERROR:   Error running nmap.");
          console.dir(data);
        }
      });
    }
    
  } catch (err) {
    console.log("ERROR:    " + err);
  }
  
}

async function startStatus() {
  let results = await checkStatus();
}

async function insertResults(results) {
  let Configs = Configuration.findOne({});

  if (Configs.logLevel == "Verbose") {
    console.log("INFO:   Online IDs: ");
    console.dir(results.onlineIds);
    console.log("-----------------------------------");
  }
  
  Meteor.call("markInt.online", results.onlineIds, function(err, result) {
    if (err) {
      if (Configs.logLevel == "Error" || Configs.logLevel == "Verbose") {
        console.log("ERROR:   Error adding online to interface: " + err);
      }
    } else {
      if (Configs.logLevel == "Verbose") {
        console.log("INFO:   Online status should now be set.");
      }
    }
  });
}

async function checkEnabledDisabled() {
  let configs = Configuration.findOne({});
  let serverInfo = ServerInfo.findOne({});

  if (configs.logLevel == "Verbose") {
    console.log("INFO:    In the checkEnabledDisabled method.");
  }

  // check to see if any interfaces are set to disabled, or are temporary
  let disabledIntCount = Interfaces.find({ isDisabled: true }).count();
  let tempIntCount = Interfaces.find({ isTemp: true }).count();

  if (configs.logLevel == "Verbose") {
    console.log("");
    console.log("VALIDATION:    Disabled Interface Count:    " + disabledIntCount);
    console.log("VALIDATION:    Temporary Interface Count:   " + tempIntCount);
    console.log("");
  }

  // if any are disabled, see if they should be re-enabled yet
  if (disabledIntCount != 0) {
    let disabledInts = Interfaces.find({ isDisabled: true }).fetch();
    for (i=0; i < disabledIntCount; i++) {
      // check to see if the temp disabled date is passed, and if so, re-enable the interface.
      let thisCheckIt = new Date();
      let thisCheck = moment().toISOString(thisCheckIt);
      if (thisCheck >= disabledInts[i].disabledTilDateTime) {
        let intName = serverInfo.serverInterfaceName;
        let intPubKey = disabledInts[i].interfacePublicKey;
        let ipv4 = disabledInts[i].interfaceIP;

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
      } else {
        if (config.logLevel == "Verbose") {
          console.log("INFO:    " + disabledInts[i].interfaceName + " is not due for re-enablement.");
        }
      }
    }
    return;
  }

  // if any are temporary, see if they should be expired and removed yet
  if (tempIntCount != 0) {
    let tempInts = Interfaces.find({ isTemp: true }).fetch();
    for (i=0; i<tempIntCount; i++) {
      // check to see if the temporary interface should be removed according to the current date/time.
      let checkTemp = new Date();
      let checkTempNow = moment().toISOString(checkTemp);
      if (checkTempNow >= tempInts[i].validTilDateTime) {
        let intName = serverInfo.serverInterfaceName;
        let intPubKey = tempInts[i].interfacePublicKey;

        if (configs.logLevel == "Verbose") {
            console.log("Running cmd: ");
            console.log("wg set " + intName + " peer " + intPubKey + " remove");
            console.log("");
            console.log("----------------------------------------------------");
        }
        ShellJS.exec("wg set " + intName + " peer " + intPubKey + " remove", function(code, stdout, stderr) {
            if (stderr) {
                if (configs.logLevel == "Error" || configs.logLevel == "Verbose") {
                    console.log("Error running cmd to remove client interface: " + stderr);
                }
            } else if (stdout) {
                if (configs.logLevel == "Verbose") {
                    console.log("Output from running cmd to remove client interface: " + stdout);
                }
            }
        });
      } else {
        if (configs.logLevel == "Verbose") {
          console.log("INFO:    " + tempInts[i].interfaceName + " has not expired yet.");
        }
      }
    }
    return;
  }
}