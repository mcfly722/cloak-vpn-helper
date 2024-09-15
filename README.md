# Cloak + Wireguard VPN Gateway helper
![Status: in progress](https://img.shields.io/badge/status-in%20progress-success.svg)
![version](https://img.shields.io/badge/version-1.2-blue)
[![License: GPL3.0](https://img.shields.io/badge/License-GPL3.0-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.html)
<br>
To configure new VPN Gateway, use: https://mcfly722.github.io/cloak-vpn-helper/
<br>
<br>
Many devices (like Samsung Smart TV) has no proxy settings to configure it using v2rayN tunneling, so for this kind devices separate VPN gateway required.<br>
This helper simplifies this installation using <a href="https://github.com/cbeuw/Cloak">Cloak</a> + <a href="https://www.wireguard.com/">WireGuard</a> VPN Tunnel. 
<br>
<br>
Helper generates required key pairs and gives you final bash scripts for final installation.<br>
Note: <b>all keys generates on client side (by your internet browser) and not transmitted to any servers! (it is zero trust configurator)</b>
## Troubleshooting
Cloak and Wireguard configs locations:
| Location | File |
| :------- | :--- |
| Local Gateway | /etc/cloak/cloak-client.json |
| Local Gateway | /etc/wireguard/wg0.conf |
| External VM | /etc/cloak/cloak-server.json |
| External VM | /etc/wireguard/wg0.conf |
<br>
### view logs

```
# view journals
sudo journalctl -u cloak-server.service -f
sudo journalctl -u cloak-client.service -f

# for internal gateway
ss -nltu 'sport = 1984'
sudo tcpdump -i any -nn src host <YOUR EXTERNAL VM IP> and port 443

# for remote VM
ss -nltu 'sport = 443'
ss -nltu 'sport = 51820'
sudo tcpdump -nei ens3 tcp port 443
sudo tcpdump -nei ens3 udp port 51820
```