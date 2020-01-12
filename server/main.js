import { Meteor } from 'meteor/meteor';
import { Configuration } from '../imports/api/configuration.js';
import ShellJS from 'shelljs';
import { WGInstalled } from '../imports/api/wgInstalled.js';
import { Interfaces } from '../imports/api/interfaces.js';
import { ServerInfo } from '../imports/api/serverInfo.js';

Meteor.startup(() => {
  // code to run on server at startup
  try {
    // need to check to see if wireguard appears to be installed.
    let installed;
    let isInstalled = ShellJS.exec("[ -d /etc/wireguard ] && echo 'Directory found' || echo 'Directory /etc/wireguard not found'");
    // console.log("INFO:   ----    Is Installed: " + isInstalled.stdout);
    let isthere = isInstalled.stdout.replace(/(\r\n|\n|\r)/gm, "");
    // console.log("INFO:   " + isthere);
    let typeInstall;

    startPing();

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
          console.log("ERROR:   Error adding installed state: " + err);
        }
      });
    }, 750);

    // check to see if the message settings are set, adn if not, notify the end user admin.
    let msgSettings = Configuration.findOne({});
    if (typeof msgSettings.emailUser == 'undefined' || msgSettings.emailUser == null || msgSettings.emailUser == "") {
      // msg settings not set, route user to setup for message settings.
      // console.log("INFO:   Didn't find email settings.");
    } else {
        let user = msgSettings.emailUser;
        // console.log("INFO:   Found User: " + user);
        Meteor.call('setEmailFromServer', msgSettings);
    }
  } catch (error) {
      console.log("ERROR:   Error caught in server/main.js: " + error);
  }
});

Meteor.methods({
  'setEmailFromServer' (msgSettings) {
      console.log("Getting message setting setup.");
      if (typeof msgSettings != 'undefined') {
          // console.log(msgSettings.emailUser);
          smtp = {
              username: msgSettings.emailUser,
              password: msgSettings.emailPassword,
              server: msgSettings.emailSmtpServer,
              port: msgSettings.emailSmtpPort
          }
          process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
          // console.log(process.env.MAIL_URL);
      }
  }
});

async function startPing() {
  console.log("    ----    told to start ping");
  // start our timer, then ping each device listed in Interfaces collection for connectivity

  Meteor.setInterval(async function() {
    console.log("INFO:   Starting nMap function: ");
    
    await startStatus();

    return true;
  }, 60000); // re-run every minute
}

async function checkStatus() {
  let onlineIds = [];
  let results = {};
  let serverIP = ServerInfo.findOne({});
  let servIp = serverIP.ipAddress;
  let ipParts = servIp.split(".");
  let servIp3Oct = ipParts[0] + "." + ipParts[1] + "." + ipParts[2];

  console.log("INFO:   About to run Shell command.");
  console.log("INFO:   3 oct = " + servIp3Oct);
  console.log("----    ----    ----    ----   ----");
  var output = ShellJS.exec("nmap -n -sn " + servIp3Oct + ".0/24 -oG - | awk '/Up$/{print $2}'", function(code, stdout, stderr) {
    console.log("INFO:   Running nmap search now.");
  });

  output.stdout.on("data", function(data) {
    console.log("SUCCESS:   Got data from stdout: ");
    console.dir(data);

    let ipsarr = data.split("\n");
    results.onlineIds = ipsarr;
    insertResults(results);
  });

  output.stderr.on("data", function(data) {
    // console.log("---    ***    ---");
    // console.log("ERROR:   Error running nmap.");
    // console.dir(data);
  });
}

async function startStatus() {
  let results = await checkStatus();
}

async function insertResults(results) {
  console.log("INFO:   Online IDs: ");
  console.dir(results.onlineIds);
  console.log("-----------------------------------");
  
  Meteor.call("markInt.online", results.onlineIds, function(err, result) {
    if (err) {
      console.log("ERROR:   Error adding online to interface: " + err);
    } else {
      // console.log("INFO:   Online status should now be set.");
    }
  });
}