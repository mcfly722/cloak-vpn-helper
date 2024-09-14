var params = {
    fakehost: '',
    cloakClient: '',
    cloakServer: '',
    cloakGateway: '',
    cloakEncryptionMethod: '',
    cloakNumberOfConnections: '',
    cloakServerPrivate: '',
    cloakServerPublic: '',
    cloakUID: '',
    cloakUIDBase: '',
    wireguardClientPrivate: '',
    wireguardClientPublic: '',
    wireguardServerPrivate: '',
    wireguardServerPublic: '',
    wireguardMTU: '',
    clientArch: '',
    serverArch: '',
    clientOS: '',
    serverOS: ''
}

function fill(){
    for (let key in params) {
        element=document.getElementById(key)
        if (element) {
            params[key]=element.value
        }
    }
}

function subst(string, data) {
    return string.replace(/:([a-zA-Z]+)/g, (m, i) => i in data ? "<b style='background-color:powderblue;' id='"+i+"_'>"+data[i]+"</b>" : m)
}

function onChange(key, value){
    params[key]=value
    var elms = document.querySelectorAll("[id='"+key+"_']")
    Array.from(elms, element => {
        element.innerText=value
    });
}

function updateWGClient(privateKey){
    wgClient = window.wireguard.generateKeypairForPrivate(privateKey)
    document.getElementById("wireguardClientPublic").value  = wgClient.publicKey;
    onChange("wireguardClientPrivate",wgClient.privateKey);
    onChange("wireguardClientPublic" ,wgClient.publicKey);
}

function updateWGServer(privateKey){
    wgServer = window.wireguard.generateKeypairForPrivate(privateKey)
    document.getElementById("wireguardServerPublic").value  = wgServer.publicKey;
    onChange("wireguardServerPrivate",wgServer.privateKey);
    onChange("wireguardServerPublic" ,wgServer.publicKey);
}

function regenerateWGClient(){
    var wgClient = window.wireguard.generateKeypair()
    
    document.getElementById("wireguardClientPrivate").value = wgClient.privateKey;
    document.getElementById("wireguardClientPublic").value  = wgClient.publicKey;
    onChange("wireguardClientPrivate",wgClient.privateKey);
    onChange("wireguardClientPublic" ,wgClient.publicKey);
}

function regenerateWGServer(){
    var wgServer = window.wireguard.generateKeypair()
    document.getElementById("wireguardServerPrivate").value = wgServer.privateKey;
    document.getElementById("wireguardServerPublic").value  = wgServer.publicKey;
    onChange("wireguardServerPrivate",wgServer.privateKey);
    onChange("wireguardServerPublic" ,wgServer.publicKey);
}

function updateCloakServer(privateKey){
    cloakServer = window.wireguard.generateKeypairForPrivate(privateKey)
    document.getElementById("cloakServerPublic").value  = cloakServer.publicKey;
    onChange("cloakServerPrivate",cloakServer.privateKey);
    onChange("cloakServerPublic" ,cloakServer.publicKey);
}

function regenerateCloakServer(){
    var cloakServer = window.wireguard.generateKeypair()
    document.getElementById("cloakServerPrivate").value = cloakServer.privateKey;
    document.getElementById("cloakServerPublic").value  = cloakServer.publicKey;
    onChange("cloakServerPrivate",cloakServer.privateKey);
    onChange("cloakServerPublic" ,cloakServer.publicKey);
}

function updateCloakUID(cloakUID){
    document.getElementById("cloakUIDBase").value = window.cloak.hexToBase64(cloakUID);
    onChange('cloakUIDBase', document.getElementById("cloakUIDBase").value);
}

function regenerateCloakUID(){
    var cloakUID = window.cloak.generateUID()
    document.getElementById("cloakUID").value = cloakUID
    document.getElementById("cloakUIDBase").value = window.cloak.hexToBase64(cloakUID)
    onChange('cloakUIDBase', document.getElementById("cloakUIDBase").value);
}

function regenerateWireguard(){
    regenerateWGClient();
    regenerateWGServer();
}

function regenerateCloak(){
    regenerateCloakServer();
    regenerateCloakUID();
}


function update(){

    let client = `
<h3>1. Local Gateway</h3>
  
<h4>1.1 Install Cloak Client binary</h4>
<pre><code>curl -L https://github.com/cbeuw/Cloak/releases/download/v2.7.0/ck-client-:clientOS-:clientArch-v2.7.0 > ck-client
chmod +x ck-client
  
sudo mv ck-client /usr/bin/ck-client
sudo mkdir -p /etc/config/cloak</code></pre>
  
<h4>1.2 Create Cloak client config</h4>
<pre><code>sudo mkdir -p /etc/cloak
 
sudo tee /etc/cloak/cloak-client.json << EOF
{
    "Transport": "direct",
    "ProxyMethod": "wireguard",
    "EncryptionMethod": ":cloakEncryptionMethod",
    "UID": ":cloakUIDBase",
    "PublicKey": ":cloakServerPublic",
    "ServerName": ":fakehost",
    "NumConn": :cloakNumberOfConnections,
    "KeepAlive": 0,
    "BrowserSig": "chrome",
    "StreamTimeout": 300
}
EOF</code></pre>
  
<h4>1.3 Register Cloak Client as service</h4>
<pre><code>sudo tee /lib/systemd/system/cloak-client.service << EOF
[Unit]
Description=Cloak Client Service
After=network-online.target

[Service]
ExecStart=/usr/bin/ck-client -s :cloakServer -p 443 -i 127.0.0.1 -u -c /etc/cloak/cloak-client.json
WorkingDirectory=/tmp
StandardOutput=inherit
StandardError=inherit
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF
</code></pre>
  
<h4>1.4 Start Cloak Client service</h4>
<pre><code>sudo systemctl daemon-reload
sudo systemctl enable cloak-client.service
sudo systemctl restart cloak-client.service
sudo systemctl status cloak-client.service
</code></pre>
  
<h4>1.5 Install Wireguard Client</h4>
<pre><code>sudo apt install -y wireguard openresolv iptables</code></pre>
  
<h4>1.6 Create Wireguard Client config</h4>
<pre><code>sudo tee /etc/wireguard/client-wg0.conf << EOF
[Interface]
PrivateKey = :wireguardClientPrivate
Address = 10.1.1.2/32
MTU = :wireguardMTU
  
PostUp = iptables -t nat -A POSTROUTING -o wg0 -j MASQUERADE
PostUp = ip route add :cloakServer/32 via :cloakGateway
  
PostDown = iptables -t nat -D POSTROUTING -o wg0 -j MASQUERADE
PostDown = ip route del :cloakServer/32 via :cloakGateway
  
[Peer]
PublicKey = :wireguardServerPublic
Endpoint = :cloakClient:1984
AllowedIPs = 0.0.0.0/0
EOF
</code></pre>
  
<h4>1.7 Start Wireguard Client service</h4>
<pre><code>sudo systemctl enable wg-quick@wg0.service
sudo systemctl restart wg-quick@wg0.service
sudo systemctl status wg-quick@wg0.service</code></pre>
  
<h4>1.8 Enable IPv4 Gateway Forwarding</h4>
<pre><code>echo "net.ipv4.ip_forward=1"          | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.conf.all.forwarding=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p</code></pre>
  
`
  
let server = `
<h3>2. Outgoing VM</h3>
  
<h4>2.1 Install Cloak Server binary</h4>
<pre><code>wget https://github.com/cbeuw/Cloak/releases/download/v2.7.0/ck-server-:serverOS-:serverArch-v2.7.0 -O ck-server
  
chmod +x ck-server
sudo mv ck-server /usr/bin/ck-server</code></pre>
  
<h4>2.2 Create Cloak Server config</h4>
<pre><code>sudo mkdir -p /etc/cloak
sudo tee /etc/cloak/cloak-server.json << EOF
{
    "ProxyBook": {
        "wireguard": [
            "udp",
            "127.0.0.1:51820"
        ]
    },
    "BindAddr": [
        ":cloakServer:443"
    ],
    "BypassUID": [
        ":cloakUIDBase"
    ],
    "RedirAddr": ":fakehost",
    "PrivateKey": ":cloakServerPrivate"
}
EOF    
</code></pre>


<h4>2.3 Register Cloak Server service</h4>
<pre><code>sudo tee /etc/systemd/system/cloak-server.service << EOF
[Unit]
Description=cloak-server
After=network.target
StartLimitIntervalSec=0
  
[Service]
Type=simple
ExecStart=/usr/bin/ck-server -c /etc/cloak/cloak-server.json
Restart=always
  
[Install]
WantedBy=multi-user.target
EOF
</code></pre>


<h4>2.4 Start Cloak Server service</h4>
<pre><code>sudo systemctl daemon-reload
sudo systemctl enable cloak-server.service
sudo systemctl restart cloak-server.service
sudo systemctl status cloak-server.service</code></pre>


<h4>2.5 Allow incomming HTTPS connections on Cloak Server service</h4>
<pre><code>sudo ufw allow 443</code></pre>


<h4>2.6 Install Wireguard Server service</h4>
<pre><code>sudo apt install -y wireguard openresolv iptables</code></pre>


<h4>2.7 Create Wireguard Server config</h4>
<pre><code>export default_interface=$(ip route | awk '/default/ {print $5; exit}')
  
sudo tee /etc/wireguard/wg0.conf << EOF
[Interface]
PrivateKey = :wireguardServerPrivate
Address = 10.1.1.1/24
ListenPort = 51820
PostUp = iptables -I INPUT -p udp --dport 51820 -j ACCEPT
PostUp = iptables -I FORWARD -i $default_interface -o wg0 -j ACCEPT
PostUp = iptables -I FORWARD -i wg0 -j ACCEPT
PostUp = iptables -t nat -A POSTROUTING -o $default_interface -j MASQUERADE
PostDown = iptables -D INPUT -p udp --dport 51820 -j ACCEPT
PostDown = iptables -D FORWARD -i $default_interface -o wg0 -j ACCEPT
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT
PostDown = iptables -t nat -D POSTROUTING -o $default_interface -j MASQUERADE
  
[Peer]
PublicKey = :wireguardClientPublic
AllowedIPs = 10.1.1.2/32
EOF
</code></pre>
  
<h4>2.7 Start Wireguard Server service</h4>
<pre><code>sudo systemctl enable wg-quick@wg0.service
sudo systemctl restart wg-quick@wg0.service
sudo systemctl status wg-quick@wg0.service
sudo wg</code></pre>
`
  
    document.getElementById("client").innerHTML = subst(client, params);
    document.getElementById("server").innerHTML = subst(server, params);
}

window.onload = function() {
    regenerateWireguard();
    regenerateCloak();
    fill();
    update();    
};

