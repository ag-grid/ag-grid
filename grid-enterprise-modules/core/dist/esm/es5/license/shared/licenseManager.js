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
function exists(value, allowEmptyString) {
    if (allowEmptyString === void 0) { allowEmptyString = false; }
    return value != null && (value !== '' || allowEmptyString);
}
var LicenseManager = /** @class */ (function () {
    function LicenseManager(document) {
        this.watermarkMessage = undefined;
        this.document = document;
        this.md5 = new MD5();
        this.md5.init();
    }
    LicenseManager.prototype.validateLicense = function () {
        if (missingOrEmpty(LicenseManager.licenseKey)) {
            if (!this.isWebsiteUrl() || this.isForceWatermark()) {
                this.outputMissingLicenseKey();
            }
        }
        else if (LicenseManager.licenseKey.length > 32) {
            if (LicenseManager.licenseKey.indexOf("For_Trialing_ag-Grid_Only") !== -1) {
                this.outputInvalidLicenseKey();
            }
            else {
                var _a = LicenseManager.extractLicenseComponents(LicenseManager.licenseKey), md5 = _a.md5, license = _a.license, version = _a.version, isTrial = _a.isTrial;
                if (md5 === this.md5.md5(license)) {
                    if (exists(version) && version) {
                        this.validateLicenseKeyForVersion(version, !!isTrial, license);
                    }
                    else {
                        this.validateLegacyKey(license);
                    }
                }
                else {
                    this.outputInvalidLicenseKey();
                }
            }
        }
        else {
            this.outputInvalidLicenseKey();
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
        var hashStart = cleanedLicenseKey.length - 32;
        var md5 = cleanedLicenseKey.substring(hashStart);
        var license = cleanedLicenseKey.substring(0, hashStart);
        var _a = __read(LicenseManager.extractBracketedInformation(cleanedLicenseKey), 2), version = _a[0], isTrial = _a[1];
        return { md5: md5, license: license, version: version, isTrial: isTrial };
    };
    LicenseManager.prototype.getLicenseDetails = function (licenseKey) {
        var _a = LicenseManager.extractLicenseComponents(licenseKey), md5 = _a.md5, license = _a.license, version = _a.version, isTrial = _a.isTrial;
        var valid = (md5 === this.md5.md5(license)) && licenseKey.indexOf("For_Trialing_ag-Grid_Only") === -1;
        var trialExpired = null;
        var expiry = null;
        if (valid) {
            expiry = LicenseManager.extractExpiry(license);
            valid = !isNaN(expiry.getTime());
            if (isTrial) {
                var now = new Date();
                trialExpired = (expiry < now);
            }
        }
        return {
            licenseKey: licenseKey,
            valid: valid,
            expiry: valid ? LicenseManager.formatDate(expiry) : null,
            version: version ? version : 'legacy',
            isTrial: isTrial,
            trialExpired: trialExpired
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
    LicenseManager.setLicenseKey = function (licenseKey) {
        this.licenseKey = licenseKey;
    };
    LicenseManager.extractBracketedInformation = function (licenseKey) {
        var matches = licenseKey.split('[')
            .filter(function (v) {
            return v.indexOf(']') > -1;
        })
            .map(function (value) {
            return value.split(']')[0];
        });
        if (!matches || matches.length === 0) {
            return [null, null];
        }
        var isTrial = matches.filter(function (match) { return match === 'TRIAL'; }).length === 1;
        var version = matches.filter(function (match) { return match.indexOf("v") === 0; }).map(function (match) { return match.replace(/^v/, ""); })[0];
        return [version, isTrial];
    };
    LicenseManager.prototype.validateLicenseKeyForVersion = function (version, isTrial, license) {
        if (version !== '2') {
            return;
        }
        if (isTrial) {
            this.validateForTrial(license);
        }
        else {
            this.validateLegacyKey(license);
        }
    };
    LicenseManager.prototype.validateLegacyKey = function (license) {
        var gridReleaseDate = LicenseManager.getGridReleaseDate();
        var expiry = LicenseManager.extractExpiry(license);
        var valid = false;
        var current = false;
        if (!isNaN(expiry.getTime())) {
            valid = true;
            current = (gridReleaseDate < expiry);
        }
        if (!valid) {
            this.outputInvalidLicenseKey();
        }
        else if (!current) {
            var formattedExpiryDate = LicenseManager.formatDate(expiry);
            var formattedReleaseDate = LicenseManager.formatDate(gridReleaseDate);
            this.outputIncompatibleVersion(formattedExpiryDate, formattedReleaseDate);
        }
    };
    LicenseManager.prototype.validateForTrial = function (license) {
        var expiry = LicenseManager.extractExpiry(license);
        var now = new Date();
        var valid = false;
        var current = false;
        if (!isNaN(expiry.getTime())) {
            valid = true;
            current = (expiry > now);
        }
        if (!valid) {
            this.outputInvalidLicenseKey();
        }
        else if (!current) {
            var formattedExpiryDate = LicenseManager.formatDate(expiry);
            this.outputExpiredTrialKey(formattedExpiryDate);
        }
    };
    LicenseManager.prototype.outputInvalidLicenseKey = function () {
        console.error('*****************************************************************************************************************');
        console.error('***************************************** AG Grid Enterprise License ********************************************');
        console.error('********************************************* Invalid License ***************************************************');
        console.error('* Your license for AG Grid Enterprise is not valid - please contact info@ag-grid.com to obtain a valid license. *');
        console.error('*****************************************************************************************************************');
        console.error('*****************************************************************************************************************');
        this.watermarkMessage = "Invalid License";
    };
    LicenseManager.prototype.outputExpiredTrialKey = function (formattedExpiryDate) {
        console.error('****************************************************************************************************************');
        console.error('***************************************** AG Grid Enterprise License *******************************************');
        console.error('*****************************************   Trial Period Expired.    *******************************************');
        console.error("* Your license for AG Grid Enterprise expired on " + formattedExpiryDate + ".                                                *");
        console.error('* Please email info@ag-grid.com to purchase a license.                                                         *');
        console.error('****************************************************************************************************************');
        console.error('****************************************************************************************************************');
        this.watermarkMessage = "Trial Period Expired";
    };
    LicenseManager.prototype.outputMissingLicenseKey = function () {
        console.error('****************************************************************************************************************');
        console.error('***************************************** AG Grid Enterprise License *******************************************');
        console.error('****************************************** License Key Not Found ***********************************************');
        console.error('* All AG Grid Enterprise features are unlocked.                                                                *');
        console.error('* This is an evaluation only version, it is not licensed for development projects intended for production.     *');
        console.error('* If you want to hide the watermark, please email info@ag-grid.com for a trial license.                        *');
        console.error('****************************************************************************************************************');
        console.error('****************************************************************************************************************');
        this.watermarkMessage = "For Trial Use Only";
    };
    LicenseManager.prototype.outputIncompatibleVersion = function (formattedExpiryDate, formattedReleaseDate) {
        console.error('****************************************************************************************************************************');
        console.error('****************************************************************************************************************************');
        console.error('*                                             AG Grid Enterprise License                                                   *');
        console.error('*                           License not compatible with installed version of AG Grid Enterprise.                           *');
        console.error('*                                                                                                                          *');
        console.error("* Your AG Grid License entitles you to all versions of AG Grid that we release within the time covered by your license     *");
        console.error("* - typically we provide one year licenses which entitles you to all releases / updates of AG Grid within that year.       *");
        console.error("* Your license has an end (expiry) date which stops the license key working with versions of AG Grid released after the    *");
        console.error("* license end date. The license key that you have expires on " + formattedExpiryDate + ", however the version of AG Grid you    *");
        console.error("* are trying to use was released on " + formattedReleaseDate + ".                                                               *");
        console.error('*                                                                                                                          *');
        console.error('* Please contact info@ag-grid.com to renew your subscription to new versions and get a new license key to work with this   *');
        console.error('* version of AG Grid.                                                                                                      *');
        console.error('****************************************************************************************************************************');
        console.error('****************************************************************************************************************************');
        this.watermarkMessage = "License Expired";
    };
    LicenseManager.RELEASE_INFORMATION = 'MTY4NjA2MTA3MDMxNA==';
    return LicenseManager;
}());
export { LicenseManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGljZW5zZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGljZW5zZS9zaGFyZWQvbGljZW5zZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFFMUIsd0JBQXdCO0FBQ3hCLFNBQVMsY0FBYyxDQUFJLEtBQTJCO0lBQ2xELE9BQU8sS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBRUQsU0FBUyxNQUFNLENBQUMsS0FBVSxFQUFFLGdCQUF3QjtJQUF4QixpQ0FBQSxFQUFBLHdCQUF3QjtJQUNoRCxPQUFPLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRSxJQUFJLGdCQUFnQixDQUFDLENBQUM7QUFDL0QsQ0FBQztBQUVEO0lBUUksd0JBQVksUUFBa0I7UUFMdEIscUJBQWdCLEdBQXVCLFNBQVMsQ0FBQztRQU1yRCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUV6QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRU0sd0NBQWUsR0FBdEI7UUFDSSxJQUFJLGNBQWMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRTtnQkFDakQsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7YUFDbEM7U0FDSjthQUFNLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFO1lBQzlDLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxP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