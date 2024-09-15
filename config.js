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

var validators = {
    fakehost:               function(value) { return value.length > 0},
    cloakClient:            function(value) { return isValidIPaddress(value); },
    cloakServer:            function(value) { return isValidIPaddress(value); },
    cloakGateway:           function(value) { return isValidIPaddress(value); },
    cloakServerPrivate:     function(value) { return !window.wireguard.generateKeypairForPrivate(value).publicKey.includes("INCORRECT"); },
    cloakServerPublic:      function(value) { return !value.includes("INCORRECT"); },
    cloakUIDBase:           function(value) { return !value.includes("INCORRECT"); },
    wireguardClientPrivate: function(value) { return !window.wireguard.generateKeypairForPrivate(value).publicKey.includes("INCORRECT"); },
    wireguardClientPublic:  function(value) { return !value.includes("INCORRECT"); },
    wireguardServerPrivate: function(value) { return !window.wireguard.generateKeypairForPrivate(value).publicKey.includes("INCORRECT"); },
    wireguardServerPublic:  function(value) { return !value.includes("INCORRECT"); }
}

function isValidIPaddress(ipaddress) {  
    return (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress))
}



function isValid(key, value) {
    if (validators.hasOwnProperty(key)) {
        return (validators[key])(value)
    } else {
        true
    }
}

function anyPropertiesHasErrors(){
    var hasErrors = false
    for(let key in validators) {
        if (isValid(key, document.getElementById(key).value)){
            document.getElementById(key).style.color="green"
        } else {
            document.getElementById(key).style.color="red"
            hasErrors = true
        }
    }
    return hasErrors
}

function fill(){
    for (let key in params) {
        element=document.getElementById(key)
        if (element) {
            params[key]=element.value
        }
    }
}

/*
function zeroPad(num, places) {
    return String(num).padStart(places, '0')
}

function linesNumbers(str) {
    var n = str.split(/\r\n|\r|\n/).length
    return [...Array(n).keys()].map((i)=> zeroPad(i+1,3)).join("\n")
}
*/

function subst(string, data) {
    return string.replace(/:([a-zA-Z]+)/g, (m, i) => i in data ? "<b style='background-color:powderblue;' id='"+i+"_'>"+data[i]+"</b>" : m)
}

function onChange(key, value){
    if (anyPropertiesHasErrors()) {
        document.getElementById("client").style.userSelect = "none";
        document.getElementById("server").style.userSelect = "none";
        document.getElementById("configs").innerHTML="Configs copying blocked!<br> Please, fix all highlighted errors and fill required fileds."
        document.getElementById("configs").style.color="Red"
    } else {
        document.getElementById("client").style.userSelect = "text";
        document.getElementById("server").style.userSelect = "text";
        document.getElementById("configs").innerHTML="installation configs:"
        document.getElementById("configs").style.color="black"
    }

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
<pre><code># ------------------ 1.1 Install Cloak Client binary ---------------------
wget https://github.com/cbeuw/Cloak/releases/download/v2.7.0/ck-client-:clientOS-:clientArch-v2.7.0 -O ck-client
chmod +x ck-client
sudo mv ck-client /usr/bin/ck-client


# ------------------ 1.2 Create Cloak client config ----------------------
sudo mkdir -p /etc/cloak
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
EOF


# --------------- 1.3 Register Cloak Client as service -------------------
sudo tee /etc/systemd/system/cloak-client.service << EOF
[Unit]
Description=Cloak Client Service
After=network-online.target

[Service]
ExecStart=/usr/bin/ck-client -s :cloakServer -p 443 -i 127.0.0.1 -u -c /etc/cloak/cloak-client.json
WorkingDirectory=/tmp
StandardOutput=inherit
StandardError=inherit
OOMScoreAdjust=-100
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF


# ------------------ 1.4 Start Cloak Client service ----------------------
sudo systemctl daemon-reload
sudo systemctl enable cloak-client.service
sudo systemctl restart cloak-client.service
sudo systemctl status cloak-client.service --no-pager -l


# ------------------ 1.5 Install Wireguard Client ------------------------
sudo apt install -y wireguard openresolv iptables
  

# --------------- 1.6 Create Wireguard Client config ---------------------
sudo tee /etc/wireguard/wg0.conf << EOF
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


# --------------- 1.7 Start Wireguard Client service ---------------------
sudo systemctl enable wg-quick@wg0.service
sudo systemctl restart wg-quick@wg0.service
sudo systemctl status wg-quick@wg0.service --no-pager -l

  
# --------------- 1.8 Enable IPv4 Gateway Forwarding ---------------------
echo "net.ipv4.ip_forward=1"          | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.conf.all.forwarding=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p</code></pre>
  
`
  
let server = `
<pre><code># ----------------- 2.1 Install Cloak Server binary ----------------------
wget https://github.com/cbeuw/Cloak/releases/download/v2.7.0/ck-server-:serverOS-:serverArch-v2.7.0 -O ck-server
chmod +x ck-server
sudo mv ck-server /usr/bin/ck-server


# ----------------- 2.2 Create Cloak Server config -----------------------
sudo mkdir -p /etc/cloak
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

# ---------------- 2.3 Register Cloak Server service ---------------------
sudo tee /etc/systemd/system/cloak-server.service << EOF
[Unit]
Description=cloak-server
After=network.target
StartLimitIntervalSec=0
  
[Service]
ExecStart=/usr/bin/ck-server -c /etc/cloak/cloak-server.json
WorkingDirectory=/tmp
StandardOutput=inherit
StandardError=inherit
OOMScoreAdjust=-100
Restart=always
User=root
  
[Install]
WantedBy=multi-user.target
EOF


# ----------------- 2.4 Start Cloak Server service -----------------------
sudo systemctl daemon-reload
sudo systemctl enable cloak-server.service
sudo systemctl restart cloak-server.service
sudo systemctl status cloak-server.service --no-pager -l


# ---- 2.5 Allow incomming HTTPS connections on Cloak Server service -----
sudo ufw allow 443


# --------------- 2.6 Install Wireguard Server service -------------------
sudo apt install -y wireguard openresolv iptables


# ---------------- 2.7 Create Wireguard Server config --------------------
export default_interface=$(ip route | awk '/default/ {print $5; exit}')

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


# ---------------- 2.7 Start Wireguard Server service --------------------
sudo systemctl enable wg-quick@wg0.service
sudo systemctl restart wg-quick@wg0.service
sudo systemctl status wg-quick@wg0.service --no-pager -l
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
    anyPropertiesHasErrors();
};