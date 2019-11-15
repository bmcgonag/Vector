import { Meteor } from 'meteor/meteor';
import { Configuration } from '../imports/api/configuration.js';

Meteor.startup(() => {
  // code to run on server at startup
  try {
    let msgSettings = Configuration.findOne({});
    if (typeof msgSettings.emailUser == 'undefined' || msgSettings.emailUser == null || msgSettings.emailUser == "") {
      // msg settings not set, route user to setup for message settings.
      // console.log("Didn't find email settings.");
    } else {
        let user = msgSettings.emailUser;
        // console.log("Found User: " + user);
        Meteor.call('setEmailFromServer', msgSettings);
    }

    // need to add a check for the existence of wireguard on the server
    // if it doesn't exist, then tell the user.
    
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
