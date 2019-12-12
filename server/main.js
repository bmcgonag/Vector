import { Meteor } from 'meteor/meteor';
import { Configuration } from '../imports/api/configuration.js';
import ShellJS from 'shelljs';
import { WGInstalled } from '../imports/api/wgInstalled.js';
import { Interfaces } from '../imports/api/interfaces.js';

Meteor.startup(() => {
  // code to run on server at startup
  try {
    // need to check to see if wireguard appears to be installed.
    let installed;
    let isInstalled = ShellJS.exec("[ -d /etc/wireguard ] && echo 'Directory found' || echo 'Directory /etc/wireguard not found'");
    // console.log("----    Is Installed: " + isInstalled.stdout);
    let isthere = isInstalled.stdout.replace(/(\r\n|\n|\r)/gm, "");
    // console.log(isthere);
    let typeInstall;

    // should I ping for connections?
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
          console.log("Error adding installed state: " + err);
        }
      });
    }, 750);

    // check to see if the message settings are set, adn if not, notify the end user admin.
    let msgSettings = Configuration.findOne({});
    if (typeof msgSettings.emailUser == 'undefined' || msgSettings.emailUser == null || msgSettings.emailUser == "") {
      // msg settings not set, route user to setup for message settings.
      console.log("Didn't find email settings.");
    } else {
        let user = msgSettings.emailUser;
        console.log("Found User: " + user);
        Meteor.call('setEmailFromServer', msgSettings);
    }
  } catch (error) {
      console.log("Error caught in server/main.js: " + error);
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
  },
});


startPing = function() {
  console.log("    ----    told to start ping");
  // start our timer, then ping each device listed in Interfaces collection for connectivity

  let handle = Meteor.setInterval(function() {
    let onlineIds = [];
    let pingInterfaces = Interfaces.find({ checkOnline: true }).count();
    console.log("Ping Interface count: " + pingInterfaces);
    if (pingInterfaces > 0) {
      let interfaceList = Interfaces.find({ checkOnline: true }).fetch();
      // console.dir(interfaceList[0]);

      let interfaceListCount = interfaceList.length;
    
      // console.log("Interface count: " + interfaceListCount);

      for (i=0; i < interfaceListCount; i++) {
        let intId = interfaceList[i]._id;
        ShellJS.exec("ping -c 2 " + interfaceList[i].interfaceIP, function(code, stdout, stderr) {
          if (stderr) {
            console.log("Error attempting to ping " + interfaceList[i].interfaceIP);
          } else if (stdout) {
            // console.log("----------------------");
            // console.log("Ping StdOut: ");
            // console.log("");
            // console.dir(stdout);
            // console.log("");
            let output = stdout.split(" ");
            // console.log("");
            // console.log("============================================")
            // console.log("Output is:");
            // console.dir(output);
            let outputLength = output.length;
            for (j=0; j<outputLength; j++) {
              if (output[j] == "received,") {
                if (parseInt(output[j-1]) > 0) {
                  pingSuccess = true;
                } else {
                  pingSuccess = false;
                }
              }
            }
            console.log("Ping found: " + pingSuccess);
          }
        });
        onlineIds.push(intId);
      }
    } else {
      console.log("No Ping!");
    }

    if (onlineIds.length > 0) {
      Meteor.call("markInt.online", onlineIds, function(err, result) {
        if (err) {
          console.log("Error adding online to interface: " + err);
        } else {
          console.log("Online status should now be set.");
        }
      });
    }
  }, 30000); // re-run every 10 minutes
}
