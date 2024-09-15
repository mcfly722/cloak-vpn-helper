(function() {
    function getRanHex(size) {
        let result = [];
        let hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
      
        for (let n = 0; n < size; n++) {
            result.push(hexRef[Math.floor(Math.random() * 16)]);
        }
        return result.join('');
    }
    function hex2a(hexx) {
        var hex = hexx.toString();//force conversion
        var str = '';
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }
    window.cloak = {
        generateUID: function() {
            return getRanHex(16);
        },
        hexToBase64: function(hex) {
            if (hex.length <= 0) {
                return "INCORRECT HEX REPRESENTATION"
            }
            return btoa(hex2a(hex.toUpperCase()))
        }

    }
})();