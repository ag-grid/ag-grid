/**
          * @ag-grid-enterprise/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v31.1.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');

var MD5 = /** @class */ (function () {
    function MD5() {
        this.ieCompatibility = false;
    }
    MD5.prototype.init = function () {
        this.ieCompatibility = (this.md5('hello') != '5d41402abc4b2a76b9719d911017c592');
    };
    MD5.prototype.md5cycle = function (x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];
        a = this.ff(a, b, c, d, k[0], 7, -680876936);
        d = this.ff(d, a, b, c, k[1], 12, -389564586);
        c = this.ff(c, d, a, b, k[2], 17, 606105819);
        b = this.ff(b, c, d, a, k[3], 22, -1044525330);
        a = this.ff(a, b, c, d, k[4], 7, -176418897);
        d = this.ff(d, a, b, c, k[5], 12, 1200080426);
        c = this.ff(c, d, a, b, k[6], 17, -1473231341);
        b = this.ff(b, c, d, a, k[7], 22, -45705983);
        a = this.ff(a, b, c, d, k[8], 7, 1770035416);
        d = this.ff(d, a, b, c, k[9], 12, -1958414417);
        c = this.ff(c, d, a, b, k[10], 17, -42063);
        b = this.ff(b, c, d, a, k[11], 22, -1990404162);
        a = this.ff(a, b, c, d, k[12], 7, 1804603682);
        d = this.ff(d, a, b, c, k[13], 12, -40341101);
        c = this.ff(c, d, a, b, k[14], 17, -1502002290);
        b = this.ff(b, c, d, a, k[15], 22, 1236535329);
        a = this.gg(a, b, c, d, k[1], 5, -165796510);
        d = this.gg(d, a, b, c, k[6], 9, -1069501632);
        c = this.gg(c, d, a, b, k[11], 14, 643717713);
        b = this.gg(b, c, d, a, k[0], 20, -373897302);
        a = this.gg(a, b, c, d, k[5], 5, -701558691);
        d = this.gg(d, a, b, c, k[10], 9, 38016083);
        c = this.gg(c, d, a, b, k[15], 14, -660478335);
        b = this.gg(b, c, d, a, k[4], 20, -405537848);
        a = this.gg(a, b, c, d, k[9], 5, 568446438);
        d = this.gg(d, a, b, c, k[14], 9, -1019803690);
        c = this.gg(c, d, a, b, k[3], 14, -187363961);
        b = this.gg(b, c, d, a, k[8], 20, 1163531501);
        a = this.gg(a, b, c, d, k[13], 5, -1444681467);
        d = this.gg(d, a, b, c, k[2], 9, -51403784);
        c = this.gg(c, d, a, b, k[7], 14, 1735328473);
        b = this.gg(b, c, d, a, k[12], 20, -1926607734);
        a = this.hh(a, b, c, d, k[5], 4, -378558);
        d = this.hh(d, a, b, c, k[8], 11, -2022574463);
        c = this.hh(c, d, a, b, k[11], 16, 1839030562);
        b = this.hh(b, c, d, a, k[14], 23, -35309556);
        a = this.hh(a, b, c, d, k[1], 4, -1530992060);
        d = this.hh(d, a, b, c, k[4], 11, 1272893353);
        c = this.hh(c, d, a, b, k[7], 16, -155497632);
        b = this.hh(b, c, d, a, k[10], 23, -1094730640);
        a = this.hh(a, b, c, d, k[13], 4, 681279174);
        d = this.hh(d, a, b, c, k[0], 11, -358537222);
        c = this.hh(c, d, a, b, k[3], 16, -722521979);
        b = this.hh(b, c, d, a, k[6], 23, 76029189);
        a = this.hh(a, b, c, d, k[9], 4, -640364487);
        d = this.hh(d, a, b, c, k[12], 11, -421815835);
        c = this.hh(c, d, a, b, k[15], 16, 530742520);
        b = this.hh(b, c, d, a, k[2], 23, -995338651);
        a = this.ii(a, b, c, d, k[0], 6, -198630844);
        d = this.ii(d, a, b, c, k[7], 10, 1126891415);
        c = this.ii(c, d, a, b, k[14], 15, -1416354905);
        b = this.ii(b, c, d, a, k[5], 21, -57434055);
        a = this.ii(a, b, c, d, k[12], 6, 1700485571);
        d = this.ii(d, a, b, c, k[3], 10, -1894986606);
        c = this.ii(c, d, a, b, k[10], 15, -1051523);
        b = this.ii(b, c, d, a, k[1], 21, -2054922799);
        a = this.ii(a, b, c, d, k[8], 6, 1873313359);
        d = this.ii(d, a, b, c, k[15], 10, -30611744);
        c = this.ii(c, d, a, b, k[6], 15, -1560198380);
        b = this.ii(b, c, d, a, k[13], 21, 1309151649);
        a = this.ii(a, b, c, d, k[4], 6, -145523070);
        d = this.ii(d, a, b, c, k[11], 10, -1120210379);
        c = this.ii(c, d, a, b, k[2], 15, 718787259);
        b = this.ii(b, c, d, a, k[9], 21, -343485551);
        x[0] = this.add32(a, x[0]);
        x[1] = this.add32(b, x[1]);
        x[2] = this.add32(c, x[2]);
        x[3] = this.add32(d, x[3]);
    };
    MD5.prototype.cmn = function (q, a, b, x, s, t) {
        a = this.add32(this.add32(a, q), this.add32(x, t));
        return this.add32((a << s) | (a >>> (32 - s)), b);
    };
    MD5.prototype.ff = function (a, b, c, d, x, s, t) {
        return this.cmn((b & c) | ((~b) & d), a, b, x, s, t);
    };
    MD5.prototype.gg = function (a, b, c, d, x, s, t) {
        return this.cmn((b & d) | (c & (~d)), a, b, x, s, t);
    };
    MD5.prototype.hh = function (a, b, c, d, x, s, t) {
        return this.cmn(b ^ c ^ d, a, b, x, s, t);
    };
    MD5.prototype.ii = function (a, b, c, d, x, s, t) {
        return this.cmn(c ^ (b | (~d)), a, b, x, s, t);
    };
    MD5.prototype.md51 = function (s) {
        var n = s.length;
        var state = [1732584193, -271733879, -1732584194, 271733878];
        var i;
        for (i = 64; i <= s.length; i += 64) {
            this.md5cycle(state, this.md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < s.length; i++) {
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        }
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            this.md5cycle(state, tail);
            for (i = 0; i < 16; i++) {
                tail[i] = 0;
            }
        }
        tail[14] = n * 8;
        this.md5cycle(state, tail);
        return state;
    };
    /* there needs to be support for Unicode here, * unless we pretend that we can redefine the MD-5
     * algorithm for multi-byte characters (perhaps by adding every four 16-bit characters and
     * shortening the sum to 32 bits). Otherwise I suthis.ggest performing MD-5 as if every character
     * was two bytes--e.g., 0040 0025 = @%--but then how will an ordinary MD-5 sum be matched?
     * There is no way to standardize text to something like UTF-8 before transformation; speed cost is
     * utterly prohibitive. The JavaScript standard itself needs to look at this: it should start
     * providing access to strings as preformed UTF-8 8-bit unsigned value arrays.
     */
    MD5.prototype.md5blk = function (s) {
        var md5blks = [];
        /* Andy King said do it this way. */
        for (var i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i)
                + (s.charCodeAt(i + 1) << 8)
                + (s.charCodeAt(i + 2) << 16)
                + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    };
    MD5.prototype.rhex = function (n) {
        var hex_chr = '0123456789abcdef'.split('');
        var s = '', j = 0;
        for (; j < 4; j++) {
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
                + hex_chr[(n >> (j * 8)) & 0x0F];
        }
        return s;
    };
    MD5.prototype.hex = function (x) {
        for (var i = 0; i < x.length; i++) {
            x[i] = this.rhex(x[i]);
        }
        return x.join('');
    };
    MD5.prototype.md5 = function (s) {
        return this.hex(this.md51(s));
    };
    MD5.prototype.add32 = function (a, b) {
        return this.ieCompatibility ? this.add32Compat(a, b) : this.add32Std(a, b);
    };
    /* this function is much faster, so if possible we use it. Some IEs are the only ones I know of that
     need the idiotic second function, generated by an if clause.  */
    MD5.prototype.add32Std = function (a, b) {
        return (a + b) & 0xFFFFFFFF;
    };
    MD5.prototype.add32Compat = function (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF), msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    };
    return MD5;
}());

var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
// move to general utils
function missingOrEmpty(value) {
    return value == null || value.length === 0;
}
var LICENSE_TYPES = {
    '01': 'GRID',
    '02': 'CHARTS',
    '0102': 'BOTH'
};
var LicenseManager = /** @class */ (function () {
    function LicenseManager(document) {
        this.watermarkMessage = undefined;
        this.totalMessageLength = 124;
        this.document = document;
        this.md5 = new MD5();
        this.md5.init();
    }
    LicenseManager.prototype.validateLicense = function () {
        var licenseDetails = this.getLicenseDetails(LicenseManager.licenseKey);
        var currentLicenseName = "AG Grid ".concat(licenseDetails.currentLicenseType === 'BOTH' ? 'and AG Charts ' : '', "Enterprise");
        var suppliedLicenseName = licenseDetails.suppliedLicenseType === undefined ? '' : "AG ".concat(licenseDetails.suppliedLicenseType === 'BOTH' ? 'Grid and AG Charts' : licenseDetails.suppliedLicenseType === 'GRID' ? 'Grid' : 'Charts', " Enterprise");
        if (licenseDetails.missing) {
            if (!this.isWebsiteUrl() || this.isForceWatermark()) {
                this.outputMissingLicenseKey(currentLicenseName);
            }
        }
        else if (licenseDetails.expired) {
            var gridReleaseDate = LicenseManager.getGridReleaseDate();
            var formattedReleaseDate = LicenseManager.formatDate(gridReleaseDate);
            this.outputExpiredKey(licenseDetails.expiry, formattedReleaseDate, currentLicenseName, suppliedLicenseName);
        }
        else if (!licenseDetails.valid) {
            this.outputInvalidLicenseKey(!!licenseDetails.incorrectLicenseType, currentLicenseName, suppliedLicenseName);
        }
        else if (licenseDetails.isTrial && licenseDetails.trialExpired) {
            this.outputExpiredTrialKey(licenseDetails.expiry, currentLicenseName, suppliedLicenseName);
        }
    };
    LicenseManager.extractExpiry = function (license) {
        var restrictionHashed = license.substring(license.lastIndexOf('_') + 1, license.length);
        return new Date(parseInt(LicenseManager.decode(restrictionHashed), 10));
    };
    LicenseManager.extractLicenseComponents = function (licenseKey) {
        // when users copy the license key from a PDF extra zero width characters are sometimes copied too
        // carriage returns and line feeds are problematic too
        // all of which causes license key validation to fail - strip these out
        var cleanedLicenseKey = licenseKey.replace(/[\u200B-\u200D\uFEFF]/g, '');
        cleanedLicenseKey = cleanedLicenseKey.replace(/\r?\n|\r/g, '');
        // the hash that follows the key is 32 chars long
        if (licenseKey.length <= 32) {
            return { md5: null, license: licenseKey, version: null, isTrial: null };
        }
        var hashStart = cleanedLicenseKey.length - 32;
        var md5 = cleanedLicenseKey.substring(hashStart);
        var license = cleanedLicenseKey.substring(0, hashStart);
        var _a = __read(LicenseManager.extractBracketedInformation(cleanedLicenseKey), 3), version = _a[0], isTrial = _a[1], type = _a[2];
        return { md5: md5, license: license, version: version, isTrial: isTrial, type: type };
    };
    LicenseManager.prototype.getLicenseDetails = function (licenseKey) {
        var currentLicenseType = LicenseManager.chartsLicenseManager ? 'BOTH' : 'GRID';
        if (missingOrEmpty(licenseKey)) {
            return {
                licenseKey: licenseKey,
                valid: false,
                missing: true,
                currentLicenseType: currentLicenseType
            };
        }
        var gridReleaseDate = LicenseManager.getGridReleaseDate();
        var _a = LicenseManager.extractLicenseComponents(licenseKey), md5 = _a.md5, license = _a.license, version = _a.version, isTrial = _a.isTrial, type = _a.type;
        var valid = (md5 === this.md5.md5(license)) && licenseKey.indexOf("For_Trialing_ag-Grid_Only") === -1;
        var trialExpired = undefined;
        var expired = undefined;
        var expiry = null;
        var incorrectLicenseType = false;
        var suppliedLicenseType = undefined;
        function handleTrial() {
            var now = new Date();
            trialExpired = (expiry < now);
            expired = undefined;
        }
        if (valid) {
            expiry = LicenseManager.extractExpiry(license);
            valid = !isNaN(expiry.getTime());
            if (valid) {
                expired = (gridReleaseDate > expiry);
                switch (version) {
                    case "legacy":
                    case "2": {
                        if (isTrial) {
                            handleTrial();
                        }
                        break;
                    }
                    case "3": {
                        if (missingOrEmpty(type)) {
                            valid = false;
                        }
                        else {
                            suppliedLicenseType = type;
                            if ((type !== LICENSE_TYPES['01'] && type !== LICENSE_TYPES['0102']) ||
                                (currentLicenseType === 'BOTH' && suppliedLicenseType !== 'BOTH')) {
                                valid = false;
                                incorrectLicenseType = true;
                            }
                            else if (isTrial) {
                                handleTrial();
                            }
                        }
                    }
                }
            }
        }
        if (!valid) {
            return {
                licenseKey: licenseKey,
                valid: valid,
                incorrectLicenseType: incorrectLicenseType,
                currentLicenseType: currentLicenseType,
                suppliedLicenseType: suppliedLicenseType
            };
        }
        return {
            licenseKey: licenseKey,
            valid: valid,
            expiry: LicenseManager.formatDate(expiry),
            expired: expired,
            version: version,
            isTrial: isTrial,
            trialExpired: trialExpired,
            incorrectLicenseType: incorrectLicenseType,
            currentLicenseType: currentLicenseType,
            suppliedLicenseType: suppliedLicenseType
        };
    };
    LicenseManager.prototype.isDisplayWatermark = function () {
        return this.isForceWatermark() || (!this.isLocalhost() && !this.isWebsiteUrl() && !missingOrEmpty(this.watermarkMessage));
    };
    LicenseManager.prototype.getWatermarkMessage = function () {
        return this.watermarkMessage || '';
    };
    LicenseManager.prototype.getHostname = function () {
        var win = (this.document.defaultView || window);
        var loc = win.location;
        var _a = loc.hostname, hostname = _a === void 0 ? '' : _a;
        return hostname;
    };
    LicenseManager.prototype.isForceWatermark = function () {
        var win = (this.document.defaultView || window);
        var loc = win.location;
        var pathname = loc.pathname;
        return pathname ? pathname.indexOf('forceWatermark') !== -1 : false;
    };
    LicenseManager.prototype.isWebsiteUrl = function () {
        var hostname = this.getHostname();
        return hostname.match(/^((?:\w+\.)?ag-grid\.com)$/) !== null;
    };
    LicenseManager.prototype.isLocalhost = function () {
        var hostname = this.getHostname();
        return hostname.match(/^(?:127\.0\.0\.1|localhost)$/) !== null;
    };
    LicenseManager.formatDate = function (date) {
        var monthNames = [
            'January', 'February', 'March',
            'April', 'May', 'June', 'July',
            'August', 'September', 'October',
            'November', 'December'
        ];
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
        return day + ' ' + monthNames[monthIndex] + ' ' + year;
    };
    LicenseManager.getGridReleaseDate = function () {
        return new Date(parseInt(LicenseManager.decode(LicenseManager.RELEASE_INFORMATION), 10));
    };
    LicenseManager.decode = function (input) {
        var keystr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var t = '';
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        var e = input.replace(/[^A-Za-z0-9+/=]/g, '');
        while (f < e.length) {
            s = keystr.indexOf(e.charAt(f++));
            o = keystr.indexOf(e.charAt(f++));
            u = keystr.indexOf(e.charAt(f++));
            a = keystr.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u != 64) {
                t = t + String.fromCharCode(r);
            }
            if (a != 64) {
                t = t + String.fromCharCode(i);
            }
        }
        t = LicenseManager.utf8_decode(t);
        return t;
    };
    LicenseManager.utf8_decode = function (input) {
        input = input.replace(/rn/g, 'n');
        var t = '';
        for (var n = 0; n < input.length; n++) {
            var r = input.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
            }
            else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128);
            }
            else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128);
            }
        }
        return t;
    };
    LicenseManager.setChartsLicenseManager = function (dependantLicenseManager) {
        this.chartsLicenseManager = dependantLicenseManager;
    };
    LicenseManager.setLicenseKey = function (licenseKey) {
        this.licenseKey = licenseKey;
        if (this.chartsLicenseManager) {
            this.chartsLicenseManager.setLicenseKey(licenseKey, true);
        }
    };
    LicenseManager.extractBracketedInformation = function (licenseKey) {
        // legacy no trial key
        if (!licenseKey.includes("[")) {
            return ["legacy", false, undefined];
        }
        var matches = licenseKey.match(/\[(.*?)\]/g).map(function (match) { return match.replace("[", "").replace("]", ""); });
        if (!matches || matches.length === 0) {
            return ["legacy", false, undefined];
        }
        var isTrial = matches.filter(function (match) { return match === 'TRIAL'; }).length === 1;
        var rawVersion = matches.filter(function (match) { return match.indexOf("v") === 0; })[0];
        var version = rawVersion ? rawVersion.replace('v', '') : 'legacy';
        var type = LICENSE_TYPES[matches.filter(function (match) { return LICENSE_TYPES[match]; })[0]];
        return [version, isTrial, type];
    };
    LicenseManager.prototype.centerPadAndOutput = function (input) {
        var paddingRequired = this.totalMessageLength - input.length;
        console.error(input.padStart(paddingRequired / 2 + input.length, '*').padEnd(this.totalMessageLength, '*'));
    };
    LicenseManager.prototype.padAndOutput = function (input, padding, terminateWithPadding) {
        if (padding === void 0) { padding = '*'; }
        if (terminateWithPadding === void 0) { terminateWithPadding = ''; }
        console.error(input.padEnd(this.totalMessageLength - terminateWithPadding.length, padding) + terminateWithPadding);
    };
    LicenseManager.prototype.outputInvalidLicenseKey = function (incorrectLicenseType, currentLicenseName, suppliedLicenseName) {
        if (incorrectLicenseType) {
            // TC4, TC5,TC10
            this.centerPadAndOutput('');
            this.centerPadAndOutput(" ".concat(currentLicenseName, " License "));
            this.centerPadAndOutput(' Incompatible License Key ');
            this.padAndOutput("* Your license key is for ".concat(suppliedLicenseName, " only and does not cover you for ").concat(currentLicenseName, "."), ' ', '*');
            this.padAndOutput('* Please contact info@ag-grid.com to obtain a combined license key.', ' ', '*');
            this.centerPadAndOutput('');
            this.centerPadAndOutput('');
        }
        else {
            // TC3, TC9
            this.centerPadAndOutput('');
            this.centerPadAndOutput(" ".concat(currentLicenseName, " License "));
            this.centerPadAndOutput(' Invalid License Key ');
            this.padAndOutput("* Your license key is not valid - please contact info@ag-grid.com to obtain a valid license.", ' ', '*');
            this.centerPadAndOutput('');
            this.centerPadAndOutput('');
        }
        this.watermarkMessage = "Invalid License";
    };
    LicenseManager.prototype.outputExpiredTrialKey = function (formattedExpiryDate, currentLicenseName, suppliedLicenseName) {
        // TC14
        this.centerPadAndOutput('');
        this.centerPadAndOutput(" ".concat(currentLicenseName, " License "));
        this.centerPadAndOutput(' Trial Period Expired. ');
        this.padAndOutput("* Your trial only license for ".concat(suppliedLicenseName, " expired on ").concat(formattedExpiryDate, "."), ' ', '*');
        this.padAndOutput('* Please email info@ag-grid.com to purchase a license.', ' ', '*');
        this.centerPadAndOutput('');
        this.centerPadAndOutput('');
        this.watermarkMessage = "Trial Period Expired";
    };
    LicenseManager.prototype.outputMissingLicenseKey = function (currentLicenseName) {
        // TC6, TC12
        this.centerPadAndOutput('');
        this.centerPadAndOutput(" ".concat(currentLicenseName, " License "));
        this.centerPadAndOutput(' License Key Not Found ');
        this.padAndOutput("* All ".concat(currentLicenseName, " features are unlocked for trial."), ' ', '*');
        this.padAndOutput('* If you want to hide the watermark please email info@ag-grid.com for a trial license key.', ' ', '*');
        this.centerPadAndOutput('');
        this.centerPadAndOutput('');
        this.watermarkMessage = "For Trial Use Only";
    };
    LicenseManager.prototype.outputExpiredKey = function (formattedExpiryDate, formattedReleaseDate, currentLicenseName, suppliedLicenseName) {
        // TC2
        this.centerPadAndOutput('');
        this.centerPadAndOutput(" ".concat(currentLicenseName, " License "));
        this.centerPadAndOutput(' Incompatible Software Version ');
        this.padAndOutput("* Your license key works with versions of ".concat(suppliedLicenseName, " released before ").concat(formattedExpiryDate, "."), ' ', '*');
        this.padAndOutput("* The version you are trying to use was released on ".concat(formattedReleaseDate, "."), ' ', '*');
        this.padAndOutput('* Please contact info@ag-grid.com to renew your license key.', ' ', '*');
        this.centerPadAndOutput('');
        this.centerPadAndOutput('');
        this.watermarkMessage = "License Expired";
    };
    LicenseManager.RELEASE_INFORMATION = 'MTcwODI3NzkwNjI5Nw==';
    return LicenseManager;
}());

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GridLicenseManager = /** @class */ (function (_super) {
    __extends$1(GridLicenseManager, _super);
    function GridLicenseManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridLicenseManager.prototype.validateLicense = function () {
        this.licenseManager = new LicenseManager(this.gridOptionsService.getDocument());
        this.licenseManager.validateLicense();
    };
    GridLicenseManager.getLicenseDetails = function (licenseKey) {
        return new LicenseManager(null).getLicenseDetails(licenseKey);
    };
    GridLicenseManager.prototype.isDisplayWatermark = function () {
        return this.licenseManager.isDisplayWatermark();
    };
    GridLicenseManager.prototype.getWatermarkMessage = function () {
        return this.licenseManager.getWatermarkMessage();
    };
    GridLicenseManager.setLicenseKey = function (licenseKey) {
        LicenseManager.setLicenseKey(licenseKey);
    };
    GridLicenseManager.setChartsLicenseManager = function (chartsLicenseManager) {
        LicenseManager.setChartsLicenseManager(chartsLicenseManager);
    };
    __decorate$1([
        core.PreConstruct
    ], GridLicenseManager.prototype, "validateLicense", null);
    GridLicenseManager = __decorate$1([
        core.Bean('licenseManager')
    ], GridLicenseManager);
    return GridLicenseManager;
}(core.BeanStub));

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WatermarkComp = /** @class */ (function (_super) {
    __extends(WatermarkComp, _super);
    function WatermarkComp() {
        return _super.call(this, /* html*/ "<div class=\"ag-watermark\">\n                <div ref=\"eLicenseTextRef\" class=\"ag-watermark-text\"></div>\n            </div>") || this;
    }
    WatermarkComp.prototype.postConstruct = function () {
        var _this = this;
        var show = this.shouldDisplayWatermark();
        this.setDisplayed(show);
        if (show) {
            this.eLicenseTextRef.innerText = this.licenseManager.getWatermarkMessage();
            window.setTimeout(function () { return _this.addCssClass('ag-opacity-zero'); }, 0);
            window.setTimeout(function () { return _this.setDisplayed(false); }, 5000);
        }
    };
    WatermarkComp.prototype.shouldDisplayWatermark = function () {
        return this.licenseManager.isDisplayWatermark();
    };
    __decorate([
        core.Autowired('licenseManager')
    ], WatermarkComp.prototype, "licenseManager", void 0);
    __decorate([
        core.RefSelector('eLicenseTextRef')
    ], WatermarkComp.prototype, "eLicenseTextRef", void 0);
    __decorate([
        core.PostConstruct
    ], WatermarkComp.prototype, "postConstruct", null);
    return WatermarkComp;
}(core.Component));

// DO NOT UPDATE MANUALLY: Generated from script during build time
var VERSION = '31.1.0';

var EnterpriseCoreModule = {
    version: VERSION,
    moduleName: core.ModuleNames.EnterpriseCoreModule,
    beans: [GridLicenseManager],
    agStackComponents: [
        { componentName: 'AgWatermark', componentClass: WatermarkComp }
    ]
};

exports.EnterpriseCoreModule = EnterpriseCoreModule;
exports.LicenseManager = GridLicenseManager;
