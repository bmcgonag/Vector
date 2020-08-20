pkill -f node
rm ~/.forever/forever.log
rm ~/Vector-Production/bundle/output.log
rm ~/Vector-Production/bundle/error.log
export MONGO_URL="mongodb://127.0.0.1:27017/vector"
export ROOT_URL="http://localhost"
export PORT=5000

cd ~/Vector-Production/bundle

# start the server using forever

forever start -l forever.log -o output.log -e error.log main.js