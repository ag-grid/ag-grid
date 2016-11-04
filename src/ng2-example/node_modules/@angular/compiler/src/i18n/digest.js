/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export function digestMessage(message) {
    return sha1(serializeNodes(message.nodes).join('') + ("[" + message.meaning + "]"));
}
/**
 * Serialize the i18n ast to something xml-like in order to generate an UID.
 *
 * The visitor is also used in the i18n parser tests
 *
 * @internal
 */
var _SerializerVisitor = (function () {
    function _SerializerVisitor() {
    }
    _SerializerVisitor.prototype.visitText = function (text, context) { return text.value; };
    _SerializerVisitor.prototype.visitContainer = function (container, context) {
        var _this = this;
        return "[" + container.children.map(function (child) { return child.visit(_this); }).join(', ') + "]";
    };
    _SerializerVisitor.prototype.visitIcu = function (icu, context) {
        var _this = this;
        var strCases = Object.keys(icu.cases).map(function (k) { return (k + " {" + icu.cases[k].visit(_this) + "}"); });
        return "{" + icu.expression + ", " + icu.type + ", " + strCases.join(', ') + "}";
    };
    _SerializerVisitor.prototype.visitTagPlaceholder = function (ph, context) {
        var _this = this;
        return ph.isVoid ?
            "<ph tag name=\"" + ph.startName + "\"/>" :
            "<ph tag name=\"" + ph.startName + "\">" + ph.children.map(function (child) { return child.visit(_this); }).join(', ') + "</ph name=\"" + ph.closeName + "\">";
    };
    _SerializerVisitor.prototype.visitPlaceholder = function (ph, context) {
        return "<ph name=\"" + ph.name + "\">" + ph.value + "</ph>";
    };
    _SerializerVisitor.prototype.visitIcuPlaceholder = function (ph, context) {
        return "<ph icu name=\"" + ph.name + "\">" + ph.value.visit(this) + "</ph>";
    };
    return _SerializerVisitor;
}());
var serializerVisitor = new _SerializerVisitor();
export function serializeNodes(nodes) {
    return nodes.map(function (a) { return a.visit(serializerVisitor, null); });
}
/**
 * Compute the SHA1 of the given string
 *
 * see http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 *
 * WARNING: this function has not been designed not tested with security in mind.
 *          DO NOT USE IT IN A SECURITY SENSITIVE CONTEXT.
 */
export function sha1(str) {
    var utf8 = utf8Encode(str);
    var words32 = stringToWords32(utf8);
    var len = utf8.length * 8;
    var w = new Array(80);
    var _a = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0], a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
    words32[len >> 5] |= 0x80 << (24 - len % 32);
    words32[((len + 64 >> 9) << 4) + 15] = len;
    for (var i = 0; i < words32.length; i += 16) {
        var _b = [a, b, c, d, e], h0 = _b[0], h1 = _b[1], h2 = _b[2], h3 = _b[3], h4 = _b[4];
        for (var j = 0; j < 80; j++) {
            if (j < 16) {
                w[j] = words32[i + j];
            }
            else {
                w[j] = rol32(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
            }
            var _c = fk(j, b, c, d), f = _c[0], k = _c[1];
            var temp = [rol32(a, 5), f, e, k, w[j]].reduce(add32);
            _d = [d, c, rol32(b, 30), a, temp], e = _d[0], d = _d[1], c = _d[2], b = _d[3], a = _d[4];
        }
        _e = [add32(a, h0), add32(b, h1), add32(c, h2), add32(d, h3), add32(e, h4)], a = _e[0], b = _e[1], c = _e[2], d = _e[3], e = _e[4];
    }
    var sha1 = words32ToString([a, b, c, d, e]);
    var hex = '';
    for (var i = 0; i < sha1.length; i++) {
        var b_1 = sha1.charCodeAt(i);
        hex += (b_1 >>> 4 & 0x0f).toString(16) + (b_1 & 0x0f).toString(16);
    }
    return hex.toLowerCase();
    var _d, _e;
}
function utf8Encode(str) {
    var encoded = '';
    for (var index = 0; index < str.length; index++) {
        var codePoint = decodeSurrogatePairs(str, index);
        if (codePoint <= 0x7f) {
            encoded += String.fromCharCode(codePoint);
        }
        else if (codePoint <= 0x7ff) {
            encoded += String.fromCharCode(0xc0 | codePoint >>> 6, 0x80 | codePoint & 0x3f);
        }
        else if (codePoint <= 0xffff) {
            encoded += String.fromCharCode(0xe0 | codePoint >>> 12, 0x80 | codePoint >>> 6 & 0x3f, 0x80 | codePoint & 0x3f);
        }
        else if (codePoint <= 0x1fffff) {
            encoded += String.fromCharCode(0xf0 | codePoint >>> 18, 0x80 | codePoint >>> 12 & 0x3f, 0x80 | codePoint >>> 6 & 0x3f, 0x80 | codePoint & 0x3f);
        }
    }
    return encoded;
}
// see https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
function decodeSurrogatePairs(str, index) {
    if (index < 0 || index >= str.length) {
        throw new Error("index=" + index + " is out of range in \"" + str + "\"");
    }
    var high = str.charCodeAt(index);
    var low;
    if (high >= 0xd800 && high <= 0xdfff && str.length > index + 1) {
        low = str.charCodeAt(index + 1);
        if (low >= 0xdc00 && low <= 0xdfff) {
            return (high - 0xd800) * 0x400 + low - 0xdc00 + 0x10000;
        }
    }
    return high;
}
function stringToWords32(str) {
    var words32 = Array(str.length >>> 2);
    for (var i = 0; i < words32.length; i++) {
        words32[i] = 0;
    }
    for (var i = 0; i < str.length; i++) {
        words32[i >>> 2] |= (str.charCodeAt(i) & 0xff) << 8 * (3 - i & 0x3);
    }
    return words32;
}
function words32ToString(words32) {
    var str = '';
    for (var i = 0; i < words32.length * 4; i++) {
        str += String.fromCharCode((words32[i >>> 2] >>> 8 * (3 - i & 0x3)) & 0xff);
    }
    return str;
}
function fk(index, b, c, d) {
    if (index < 20) {
        return [(b & c) | (~b & d), 0x5a827999];
    }
    if (index < 40) {
        return [b ^ c ^ d, 0x6ed9eba1];
    }
    if (index < 60) {
        return [(b & c) | (b & d) | (c & d), 0x8f1bbcdc];
    }
    return [b ^ c ^ d, 0xca62c1d6];
}
function add32(a, b) {
    var low = (a & 0xffff) + (b & 0xffff);
    var high = (a >> 16) + (b >> 16) + (low >> 16);
    return (high << 16) | (low & 0xffff);
}
function rol32(a, count) {
    return (a << count) | (a >>> (32 - count));
}
//# sourceMappingURL=digest.js.map