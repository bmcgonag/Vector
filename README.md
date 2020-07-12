Vector
============

### NOTE: Important!

I have recently found that while the setup still seems to work correctly and Wireguard server can be created from my application, I am unable to ping the server from a connected client, nor to run any traffic through the server to the internet.  

I am investigating this issue, but currently do not know what the fix is or might be.

If you are able to help me solve this problem, it is greatly appreciated.

<br />

## Vector - A Web UI for the Server side of WireGuard
#### Written with MeteorJS using NodeJS, HTML5, Javascript

<a id="Vector-toc" name="Vector-toc"></a>
## Table of Contents
* [Running in Dev Mode](#dev-mode)
* [User Basics](#user-basics)
* [Demo Site] < coming soon >
* [Configuration](#config)
* [Production Mode](#prod-mode)
  * [Production Mode - Need to Install](#prod-mode-needs)
  * [Production Mode - Run It Forever](#prod-mode-forever)
    * [Production Mode - Set Some Environment Variables](#env-vars)
* [To Do Still](#to-do-still)
* [Contribute](#contribute)

<br />

<a id="dev-mode" name="dev-mode"></a>
### Running in Dev Mode

To run Vector in Dev mode you'll need to do the following:

1. Get Meteor Installed

    Windows - There's an installer out there.
    Mac and Linux use this command:

`curl https://install.meteor.com/ | sh`

2. Clone this repo
3. cd into the cloned repo directory
4. run the command

`meteor npm install`

5. now run the command

`meteor`

If you get any errors, such as needing to install babel-runtime, or bcrypt, just use the commands provided in the terminal, then run the `meteor` command again to make sure it starts.

Once it's running you should see this in your terminal:

```
[[[[[ ~/Vector ]]]]]

=> Started proxy.
=> Started MongoDB.

=> Started your app.

=> App running at: http://localhost:3000/
```

Or something very similar.

<a id="user-basics" name="user-basics"></a>
### User Basics
Now you can navigate to localhost:3000 as indicated to see the page.  Use the Menu icon in the upper left of the screen to get to the Vector Screen.  Register if you don't have an account already, then sign in.



<a id="config" name="config"></a>
### Configuration


#### Email Setup

##### Example

<a id="prod-mode" name="prod-mode"></a>
### Production Use
To run this project in a production environment, you'll want to get a few things installed.  I'm going to use instructions for a Linux / Ubuntu 18.04 LTS server.

I do run all of my public servers on Digital Ocean.

<a id="prod-mode-needs" name="prod-mode-needs"></a>
### What you need
  1. A server running some fairly recent form of linux. First, Update the server to the latest files.

    sudo apt update && sudo apt upgrade -y

<a id="prod-mode-setup" name="prod-mode-setup"></a>
### Setup and Install - Production Mode
  
  4. Go to the Releases section here on GitHub and get the latest release .tar.gz file, and if you wish, the associated install script. 

  NOTE: the install script is currently geared toward a Ubuntu or Debian based install.  

    https://github.com/bmcgonag/Vector/releases/

  5. There are two options:  The easiest is to get the bash script and run it. It attempts to install all of the associated softwre needed to run the server including: Vector, MongoDB, WireGuard, NodeJS, NPM, and Forever. If it fails, the end of the script will help you get it running.

  The other option is to do the setup manually, in which case you need to install the following:
  
  https://youtu.be/M5ChwB-JD2c
  
  A Video Where I run through the install using the script below.

  - NodeJS 8.11.3 and the associated NPM version.
  - MongoDB
  - Forever (from npm, globally)
  - WireGuard from the ppa (the snap version of WireGuard is not supported at this time)
  - Finally, Vector

  6. Install NodeJS and NPM

  I prefer to use NVM (Node Version Manager) to do this. 

  run the following

      curl -sSL https://raw.githubusercontent.com/creationix/nvm/v0.35.1/install.sh | bash

  After install, you need to tell the eystem to use the nvm module:

      source ~/.profile

  Now you can use NVM to install NodeJS

      nvm install 8.11.3

  then tell nvm to use node 8.11.3

      nvm use 8.11.3

  You should get no errors on this, but if you do, just log out, and back in, then try those last 2 commands again.  

  Node should now be installed, and you can confirm this by doing:

      node -v

  You should get 8.11.3


  7.  Now we can install Forever, which keeps the node service up and running for (except after a reboot). 

  Do the following command:

      npm i forever -g

  This should install the forever package globally.

 
  8.  Next we need to install WireGuard (the whole point of this server, of course)

  Run the following commands to install wireguard.

      sudo apt-add-repository ppa:wireguard/wireguard

      sudo apt update

      sudo apt install wireguard -y
  
  Now WireGuard should be installed. You can test it by running the `wg` command.

      wg

  You shouldn't get anything back in the terminal, but you also should not get an error about the command being unrecognized.

  9. Now, we neeed to install MongoDB

  To install MongoDB, just do:

      sudo apt install mongodb -y
  Make sure Mongo is installed by doing 

  mongo -v

  10.  Finally, we need to install Vector.

  Get the latest release from https://github.com/bmcgoang/vector/releases

  Download the tar.gz of the latest build.  NOTE: this build is for Linux x64 architecture only (today).  

  Unzip the tar.gz file to a folder called Vector-Production in your home directory. 

      tar -xzf Vector.tar.gz --directory ~/Vector-Production

  change into the Vector-Production folder, and go all the way to the directory Vector-Production/bundle/programs/server/, and run an npm install

      cd ~/Vector-Production/bundle/programs/server

      npm install --production

  This will install all of the npm dependencies we need to run Vector.

  Now, go back two directory levels to Vector-Production/bundle

      cd ~/Vector-Production/bundle

<a id="env-vars" name="env-vars"></a>
#### Set Some Environment Variables

  Before we continue, we need to set some environmental variables.  These are important!

  First the Mongo URL, this is the server and database that we want to use for Vector.  If you are running the Mongo DB and Vector application on the same server, then this is what you'll enter.

      export MONGO_URL="mongodb://127.0.0.1:27017/vector"

  Next, we need the Root URL (the main url where your Vector site can be reached).  It's very important that this be an FQDN, and that the server hostname be the same as the FQDN (e.g. vector.<my super great domain>.com, or something like that).  This FQDN is how vector is able to tell your client interface config where to connect to your WireGuard server.

      export ROOT_URL="http://vector.<my super great domain>.com"

  Finally, you need to set the port you want the server to run on.  I recommend just staing with port 5000, but it's really up to you.

      export PORT=5000

<a id="prod-mode-forever" name="prod-mode-forever"></a>
### Production Mode - Run It Forever

  11. We start our server. 

  We will use the Forever NPM package to start our server and keep it up and running for us.  

  Note: Make sure you're in the Vector-Production/bundle directory when you run the following command:

      forever start -l forever.log -o output.log -e error.log main.js

  Finally, a note of warning.  If you reboot the server, or kill the node processes for some reason, please remove the forever.log file from ~/.forever/ before trying to restart the forever service, or it will gripe at you.
  
<a id="to-do-still" name="to-do-still"></a>
## To Do Still 

- I want to add an option to the install script to install Pi-hole as the DNS, and make sure it's an option for Custom in the Vector project.
- Add the ability to have NginX and LetsEncrypt setup with the script.
- [x] Offer to show Online / Offline for client machines based on a ping every minute to each IP.

<a id="contribute" name="contribute"></a>
## Contribute
I'm always 100% open to contributions from anyone willing to help out, learn or otherwise.

## Contributors:
Thanks to @johnzzzzz for his help in testing new releases, feedback, and great ideas for enhancements.  
