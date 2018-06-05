#!/bin/bash

cd ~
wget https://github.com/woutervddn/scoreboard/archive/master.zip

unzip master.zip
rm master.zip

cd scoreboard

$(which bash) ./scripts/install.sh
