Vector
============

<br />

## Vector - A Web UI for the Server side of Wireguard
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
  * [Production Mode - Build](#prod-mode-build)
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

  2. NPM and NOdeJS installed on that server.  Currently you'll want NPM version 5.10 and NOde version 8.11.3 - Here are some instructions on how to install NodeJS on Ubuntu 18.04.  It's from Digital Ocean, but it applies regardless.

    https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04

  3. You'll need to install MongoDB, either on this same server, or on another server, and know how to point to it (it's not hard, really).

    sudo apt install mongodb

<a id="prod-mode-setup" name="prod-mode-setup"></a>
### Setup and Install - Production Mode
  
  4. Go to the Releases section here on GitHub and get the latest release .tar.gz file, and if you wish, the associated install script. 

  NOTE: the install script is currently geared toward a Ubuntu or Debian based install.  

    https://github.com/bmcgonag/Vector/releases/

  5. There are two options:  The easiest is to get the bash script and run it. It attempts to install all of the associated softwre needed to run the server including: Vector, MongoDB, Wireguard, NodeJS, NPM, and Forever. If it fails, the end of the script will help you get it running.

  The other option is to do the setup manually, in which case you need to install the following:

  - NodeJS 8.11.3 and the associated NPM version.
  - MongoDB
  - Forever (from npm, globally)
  - Wireguard from the ppa (the snap version of Wireguard is not supported at this time)
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

 
  8.  Next we need to install Wireguard (the whole point of this server, of course)

  Run the following commands to install wireguard.

      sudo apt-add-repository ppa:wireguard/wireguard

      sudo apt update

      sudo apt install wireguard -y
  
  Now Wireguard should be installed. You can test it by running the `wg` command.

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

      npm install --proeuction

  This will install all of the npm dependencies we need to run Vector.

  Now, go back two directory levels to Vector-Production/bundle

      cd ~/Vector-Production/bundle

  Before we continue, we need to set some environmental variables.  These are important!

  First the Mongo URL, this is the server and database that we want to use for Vector.  If you are running the Mongo DB and Vector application on the same server, then this is what you'll enter.

      export MONGO_URL="mongodb://127.0.0.1:27017/vector"

  Next, we need the Root URL (the main url where your Vector site can be reached).  It's very important that this be an FQDN, and that the server hostname be the same as the FQDN (e.g. vector.<my super great domain>.com, or something like that).  This FQDN is how vector is able to tell your client interface config where to connect to your Wireguard server.

      export ROOT_URL="http://vector.<my super great domain>.com"

  Finally, you need to set the port you want the server to run on.  I recommend just staing with port 5000, but it's really up to you.

      export PORT=5000

  11. We start our server. 

  We will use the Forever NPM package to start our server and keep it up and running for us.  

  Note: Make sure you're in the Vector-Production/bundle directory when you run the following command:

      forever start -l forever.log -o output.log -e error.log main.js

  Finally, a note of warning.  If you reboot the server, or kill the node processes for some reason, please remove the forever.log file from ~/.forever/ before trying to restart the forever service, or it will gripe at you.
  






<a id="prod-mode-forever" name="prod-mode-forever"></a>
### Production Mode - Run It Forever
   13. Install "forever" from npm onto your production server.

    `npm i -g forever`

>
> NOTE: you need to run the -g option with root privileges. (this may require `sudo` or whatever varian of it for your chosen OS)
>

    Forever is an application that will watch your app and make sure it comes back up should it crash for some reason.

    14. We need to build the meteor app to run for production.  It's not hard, just takes some time.

    From the app directory created when you cloned the git repo, run the following command.  Notice that I'm telling the app to build in a different directory than the one I'm in.

<a id="prod-mode-build" name="prod-mode-build"></a>
#### Production Mode - Build
    `meteor build --directory ../Vector-node`

    This 'compiles' the app and minifies all the css and js as well as makes the actual nodejs capable version.

    15. When it's done, move back one directory, and into the newly created build directory.

    `cd ../Vector-node`

    16. Now, do an `ls` and notice the `bundle` directory.

    `cd bundle`

    17. Now we need to install dependencies.

    `cd programs/server`  --> so the full path we are in is `~/hostUp-node/bundle/programs/server`

    `npm install`

    This will install all npm dependencies for the production system.

    18. Now we need to set some environmental variables for our app to use when running.

    First let's set the MONGO_URL (tell the app where to connect to our Mongo DB).  Remember this can be run locally, but certainly doesn't have to be, so yoru MONBO_URL may refer to a different server URL or IP.

<a id="env-vars" name="env-vars"></a>
#### Set Some Environment Variables
    `export MONGO_URL="mongodb://127.0.0.1:27017/Vector"`

    This command tells the system to find mongodb on our local server, and to use port 27017 (however, if you told mongo to run on a different port, then please change that number to match the port number you selected), and to use a database called "Vector".

    19. Now we'll tell our app what it's main URL is (basically what a user will type into their browser to get to our web based application).

    `export ROOT_URL="http://<your web site name or IP>"`

    20. Now, we tell our app that it should run on a port.  If you want someone one to just type the name of your site and get straight to your app, then use port 80.  Any other port (besides 443) will need the user to enter the port after your web site name like this `http://<my-site-name>:port`

    >
    > NOTE: you can also setup NGinX web server to act as a reverse proxy to your site.  There are several tutorials on this, as well as tutorials on using LetsEncrypt to get a free SSL Certificate.   I highly recommend doing this if you intend to have a production site.
    >

    `export PORT=3000`

    ### Now try the site.
    We can run a very simple test to make sure we've set everything up properly.

    Move back to the `bundle` directory:

    `cd ..`  <-- move back one folder level

    `cd ..`  <-- move back one folder level again.  We should now be in the bundle directory

    Now, Run the command:

    `node main.js`

    from the `bundle` directory in our production app main directory.

    Give it about 10 seconds, then if you don't get any errors in the terminal, go to your web site or IP.  Don't forget, that if you didn't specify a port, use port 3000, and if you specified a port other than 3000, enter that port after your site name and a colon.

    The site should come up to a login / welcome page.

    If it does AWESOME!

    If not, it's time for trouble shooting.

    ### Make the Site Stay Up And Running Unattended
    Now, we want our site to continue running.  The issue with the `node` command, is that when we close our terminal, it will kill our node command.

    For this we use a tool called "forever".

    So, first, in the terminal do the key combo `CTRL+C`, this will tell our node app to stop.

    Next we want to start the app again using "forever".

    It's easy.

    `forever start -l forever.log -o output.log -e error.log main.js`

    What this says is start our main.js with the forever command.  Output anything that forever would put out to the terminal window into a file called forever.log, and any normal output from our app to output.log, and any errors that happen to a file called error.log.

    In my setup the file forever.log is located in /home/<my user>/.forever

    When you hit enter, it should start.  Now you can close the terminal window and still get to your web application.

    Enjoy!

<a id="to-do-still" name="to-do-still"></a>
## To Do Still 

<a id="contribute" name="contribute"></a>
## Contribute
I'm always 100% open to contributions from anyone willing to help out, learn or otherwise.
