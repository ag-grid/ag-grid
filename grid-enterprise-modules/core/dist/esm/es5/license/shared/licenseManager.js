var __read = (this && this.__read) || function (o, n) {
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
import { MD5 } from './md5';
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
export { LicenseManager };
