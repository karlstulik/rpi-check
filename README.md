# rpi-check

<p> Raspberry Pi system overview for NodeJS , viewed as a website.</p>
<p>
<b>Consists:</b><br>
CPU Usage and Temperature<br>
RAM Usage<br>
HDD Usage<br>
GPIO Tester<br>
</p>
<p>
<b>Uses:</b><br>
NodeJS<br>
AngularJS<br>
Socket.IO <i>for realtime updates</i><br>
</p>

<hr>
<h3>Requirements:</h3>
<p>NodeJS</p>
<code>wget https://nodejs.org/dist/v6.9.1/node-v6.9.1-linux-armv7l.tar.gz</code> Download File, check for updates.<br>
<code>tar -xvf node-v6.9.1-linux-armv7l.tar.gz</code> Extract Files<br>
<code>cd node-v6.9.1-linux-armv7l</code><br>
<code>sudo cp -R * /usr/local/</code> Copies Files<br>
<code>cd ..</code><br>
<code>sudo rm -R node-v6.9.1-linux-armv7l.tar.gz</code> Removes Old Downloaded File<br>
<code>sudo rm -R node-v6.9.1-linux-armv7l</code> Removes Old Folder<br>
<hr>

<h3>Install:</h3>
<code>sudo git clone https://github.com/karlstulik/rpi-check.git</code> (requires git)<br>
<code>cd rpi-check</code><br>
<code>sudo npm install -g gulp-cli bower</code><br>
<code>sudo npm install</code><br>
<code>bower install</code><br>
<code>sudo gulp</code><b> or </b><code>sudo node server</code><br>
<hr>

<p>Go to Raspberry Pi website. eg: 192.168.0.5:3000</p>










