var postSignUp = function(userId, info) {
    if (Meteor.users.find().count() > 1) {
        Roles.addUsersToRoles(userId, 'nonPaidUser');
    } else if (Meteor.users.find().count() === 1){
        Roles.addUsersToRoles(userId, 'Admin');
    }
};

var onLogOut = function() {
    FlowRouter.go('/');
};

AccountsTemplates.configure({
    postSignUpHook: postSignUp,
    // onLogoutHook: onLogOut,
    sendVerificationEmail: true,
});

Accounts.emailTemplates.from = 'no-reply@hostup.gmail.com';
Accounts.emailTemplates.siteName = 'Host Up';

Accounts.emailTemplates.verifyEmail = {
    subject() {
        return 'Confirm Your Email Address Please';
    },
    text(user, url) {
        let emailAddress = user.emails[0].address,
          urlWithoutHash = url.replace('#/', ''),
          supportEmail = "no-reply@hostup.gmail.com",
          emailBody = "Thank you for signing up to use Host Up!\n\n You signed up with " + emailAddress + " . Please confirm your email address.\n\n We will not enroll you in any mailing lists, nor will we ever share you email address or personal information for any reason.\n\n You can confirm you address by clicking the following link: \n\n " + urlWithoutHash

        return emailBody;
    },
}
