import { Meteor } from 'meteor/meteor';
import { Configuration } from '../imports/api/configuration.js';
import ShellJS from 'shelljs';
import { WGInstalled } from '../imports/api/wgInstalled.js';

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
    }, 200);

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
