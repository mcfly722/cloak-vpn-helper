# Cloak + Wireguard VPN Gateway helper
![Status: done](https://img.shields.io/badge/status-done-success.svg)
![version](https://img.shields.io/badge/version-1.2-blue)
[![License: GPL3.0](https://img.shields.io/badge/License-GPL3.0-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.html)
<br>
## Problem
Many devices (like Samsung Smart TV) has no proxy settings to configure it through v2rayN proxy, so for this kind devices separate VPN gateway required.<br>
<br>
This helper simplifies this IP VPN Gateway installation (Used <a href="https://github.com/cbeuw/Cloak">Cloak</a> + <a href="https://www.wireguard.com/">WireGuard</a>). 
<br>
<br>
Finally, data flows through the following chain:
- LAN: Smart TV or other device (in device network settings you should configure new VPN Gateway IP)
- LAN: VPN Gateway
- LAN: WireGuard client
- LAN: Cloak client
- Censored Internet
- Remote: Cloak server
- Remote: WireGuard server
- Free Internet

<br>
Helper generates required key pairs and gives you final bash scripts for deployment.<br>
Note: <b>all keys generates on client side (by your internet browser) and not transmitted to any servers! (it is zero trust configurator)</b>

<br>
Helper site: <a href="https://mcfly722.github.io/cloak-vpn-helper">https://mcfly722.github.io/cloak-vpn-helper</a>




## Supported OS

| OS | bit | Architecture | Tested |
| -- | --- | ------------ | ------ |
| Raspberry Pi OS | x64 | arm64 | ✔ |
| Ubuntu 24.04 | x64 | amd64 | ✔ |
| Ubuntu 22.04 | x64 | amd64 | ✔ |



## Debug & Troubleshooting

Cloak and Wireguard configs locations:
| Location | File |
| :------- | :--- |
| Local Gateway | /etc/cloak/cloak-client.json |
| Local Gateway | /etc/wireguard/wg0.conf |
| External VM | /etc/cloak/cloak-server.json |
| External VM | /etc/wireguard/wg0.conf |


useful commands:
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