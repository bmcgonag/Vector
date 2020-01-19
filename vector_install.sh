#!/bin/bash

echo "Would you like to have the installation also create an NGinX Rerverse Proxy with LetsEncrypt Certificates? (Y/N) "
read installNginx

echo ""
echo ""

echo "Please enter your domain name for this server: "
read userDomain

echo "**********************************"
echo "*                                *"
echo "*    First we clean up a bit     *"
echo "*                                *"
echo "**********************************"
echo ""
echo ""
echo ""
sleep 3s

####################################
# We kill our node server main.js  #
####################################

echo "****  Kill the node server"

sudo pkill -f node
echo ""

echo "****************************************************"
echo ""
echo "**** Install and set some settings"

apt remove -y dnsmasq

# install OpenResolv for DNS handling
echo ''
echo ''
echo 'Install OpenResolv'
sleep 1
apt install openresolv -y

# Load Modules
echo ''
echo ''
echo 'Load the Modules for Wireguard'
sleep 1

echo '--> modprobe wireguard'
modprobe wireguard

echo '--> modprobe iptable_nat'
modprobe iptable_nat

echo '--> modprobe ip6table_nat'
modprobe ip6table_nat

# Enable IP Packet forwarding
echo ''
echo ''
echo 'Enable IP Packet Forwarding'
sleep 1

sysctl -w net.ipv4.ip_forward=1
sysctl -w net.ipv6.conf.all.forwarding=1

####################################
# remove the folders and old stuff #
####################################

cd
if [ -f ~/Vector.tar.gz ]
then
    echo "**** removing Vector.tar.gz"
    rm Vector.tar.gz
    echo ""
fi

if [ -d ~/Vector-Production ]
then
    echo "**** removing Vector-Production folder"
    rm -rf Vector-Production
    echo ""
fi

if [ -f ~/install_nvm.sh ]
then
    echo "**** removing install_nvm.sh file"
    rm install_nvm.sh
    echo ""
fi

if [ -f ~/.forever/forever.log ]
then
    echo "****  remove the current forever.log"
    sudo rm ~/.forever/forever.log
    echo ""
fi

###############################
# Install Wireguard with PPA  #
###############################

echo "***************************************"
echo "*                                     *"
echo "*  Wireguard is necessary for Vector  *"
echo "*           to work for you.          *"
echo "*                                     *"
echo "***************************************"

if [ ! -d /etc/wireguard ]
then
    echo ""
    echo ""
    echo "****    Ok, we will install wireguard"
    echo ""
    echo ""
    sudo add-apt-repository ppa:wireguard/wireguard
    sudo apt update
    sudo apt install wireguard -y
else
    echo ""
    echo ""
    echo "****    Wireguard appears to be installed - good!"
fi

########################################################################
echo ""
echo ""

if [ $installNginx = "Y" ] || [ $installNginx = "y" ]
then

    ###############################
    # Install NGinx as Rev Proxy  #
    ###############################

    echo "***************************************"
    echo "*                                     *"
    echo "*  NGinX is used as a reverse proxy   *"
    echo "*    for the Vector install.          *"
    echo "*                                     *"
    echo "***************************************"

    if ! which nginx > /dev/null 2>&1; then
        echo ""
        echo ""
        echo "****    Ok, we will install NGinX"
        echo ""
        echo ""
        sudo apt update
        sudo apt install nginx -y
    else
        echo ""
        echo ""
        echo "****    NGinX appears to be installed - good!"
    fi

    ###############################
    # Enable NGinX as a Service   #
    ###############################

    sudo service nginx start

    ###############################
    # Check the NGinX Status      #
    ###############################

    sudo service nginx status

    sleep 5s

    echo ""
    echo ""
    echo "****    Hopefully you don't see any errors above.  If you do"
    echo "****    please determine what caused the issue with NGinX starting,"
    echo ""
    echo ""
    sleep 5s


    ################################
    # Install LetsEncrypt Certbot  #
    ################################

    if ! which certbot > /dev/null 2>&1; 
    then
        echo ""
        echo ""
        echo "****  Installing Certbot for LetsEncrypt Now."
        sudo add-apt-repository ppa:certbot/certbot -y
        sudo apt update
        sudo apt install python-certbot-nginx
    else
        echo ""
        echo ""
        echo "****    Certbot appears to already be installed - good!"
    fi

    ################################
    # Setup NGinx Reverse Proxy    #
    ################################
    
    echo ""
    echo ""
    echo "In order for NGinX to work properly, and LetsEncrypt to get certificates for your site,"
    echo "you need to provide an FQDN (Fully Qualified Domain Name).  This must be a domain you"
    echo "own.  E.g. vector.my-great-domain.com, or just my-great-domain.com if this is your top"
    echo "level server.  The donain must have dns to point to this server before continuing."
    echo ""
    
    echo ""
    echo ""
    echo "****  Creating the NGinX configuration file for this site."
    echo ""
    echo ""
    
    echo "server {" >> /etc/nginx/sites-enabled/${userDomain}.conf
    echo "    listen 80;" >> /etc/nginx/sites-enabled/${userDomain}.conf
    echo "    server_name ${userDomain};" >> /etc/nginx/sites-enabled/${userDomain}.conf
    echo "" >> /etc/nginx/sites-enabled/${userDomain}.conf
    echo "    location / {" >> /etc/nginx/sites-enabled/${userDomain}.conf
    echo "        proxy_pass http://127.0.0.1:5000;" >> /etc/nginx/sites-enabled/${userDomain}.conf
    echo "           proxy_http_version 1.1;" >> /etc/nginx/sites-enabled/${userDomain}.conf
    echo "           proxy_set_header Upgrade \$http_upgrade;" >> /etc/nginx/sites-enabled/${userDomain}.conf
    echo "           proxy_set_header Connection 'upgrade';" >> /etc/nginx/sites-enabled/${userDomain}.conf
    echo "           proxy_set_header Host \$host;" >> /etc/nginx/sites-enabled/${userDomain}.conf
    echo "           proxy_cache_bypass \$http_upgrade;" >> /etc/nginx/sites-enabled/${userDomain}.conf
    echo "    }" >> /etc/nginx/sites-enabled/${userDomain}.conf
    echo "}" >> /etc/nginx/sites-enabled/${userDomain}.conf
    
    sleep 10s
    
    echo "****  Let's test our NGinX configuration."
    sudo nginx -t
    
    sleep 5s
    echo ""
    echo ""
    echo "****  The above should have given OK and Successful results."
    echo ""
    echo ""
    sleep 2s
    echo "****    Relad NGinX Configuration and service"
    echo ""
    echo ""
    sudo service nginx reload
    
    sleep 2s
    
    echo "****    Now we'll get the LetsEncrypt certificate."
    echo ""
    echo "****    You'll be asked for your email address, and other information during the certificate creation."
    echo ""
    sleep 4s
    
    sudo certbot --nginx -d $userDomain
    
    echo ""
    echo ""
    echo "****    Now let's make sure certbot can autorenew."
    echo ""
    echo ""
    sudo certbot renew --dry-run

fi

########################################################################

#############################
# install node js using NVM #
#############################

if [ ! -d ~/.nvm ]
then
    echo ""
    echo "****  install nvm and node js"
    curl -sSL https://raw.githubusercontent.com/creationix/nvm/v0.35.1/install.sh | bash
    sleep 3s
    echo ""
    echo ""

    # try to set the install to be used without logging out

    echo "source ~/.profile attempt 1"
    source ~/.profile
else
    echo ""
    echo ""
    echo "****    NVM appears to be installed - good!"
fi

# now install the proper node version with nvm

    echo ""
    echo ""
    source ~/.profile
    echo "****    Attempt to install NodeJS 8.11.3 usign NVM"
    nvm install 8.11.3
    echo ""
    echo ""

    sleep 2s
    # now tell nvm to use the latest installed version
    nvm use 8.11.3
    echo ""
    echo ""
    sleep 1s

    echo "****  check the node version we installed."
    # check the node version
    sleep 1s
    echo "node version = "
    node -v

    echo ""


# install forever

if [ ! -d ~/.forever ]
then
    echo "****  install forever from npm"
    npm i forever -g
else
    echo "****    forever appears to be already installed - good."
fi

# install mongodb
if [ ! -d ~/.mongorc.js ]
then
    echo "****  install mongodb"
    sudo apt install -y mongodb
else
    echo ""
    echo "****    MongoDB appears to be installed - good."
    echo ""
fi

# install nmap
echo ""
if [ ! -f /usr/bin/nmap ]
then
    echo "****  install nmap"
    sudo apt install -y nmap
else
    echo ""
    echo "****    nmap appears to be installed - good."
    echo ""
fi

echo ""
echo "**** download Vector release from github."
echo ""
sleep 2s 
# get the tar file from github
wget https://github.com/bmcgonag/Vector/releases/download/0.4.0/Vector.tar.gz

echo "**** extracting Vector into Vector-Production"
echo ""
# untar the file
mkdir Vector-Production
tar -zxf Vector.tar.gz --directory ~/Vector-Production

echo "**** installing npm dependencies for Vector."
echo ""

# install npm dependencies
cd ./Vector-Production/bundle/programs/server/

npm install --production


cd ..
cd ..

# set env vars
export MONGO_URL="mongodb://127.0.0.1:27017/vector"
export ROOT_URL="http://localhost"
export PORT=5000

# start the server using forever

forever start -l forever.log -o output.log -e error.log main.js

    echo ""
    echo ""
    echo " ********************************************************** "
    echo ""
    echo ""
    echo "If you got any error about not finding node, run the"
    echo "following commands to start your server."
    echo ""
    echo ""
    echo "source ~/.profile"
    echo ""
    echo "nvm install 8.11.3"
    echo ""
    echo "nvm use 8.11.3"
    echo ""
    echo "npm i forever -g"
    echo ""
    echo "then re-run this start script."
    echo ""
    echo ""
    echo " ********************************************************** "
