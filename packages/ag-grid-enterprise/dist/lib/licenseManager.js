// ag-grid-enterprise v21.2.2
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var md5_1 = require("./license/md5");
var LicenseManager = /** @class */ (function () {
    function LicenseManager() {
        this.watermarkMessage = undefined;
    }
    LicenseManager_1 = LicenseManager;
    LicenseManager.prototype.validateLicense = function () {
        if (ag_grid_community_1._.missingOrEmpty(LicenseManager_1.licenseKey)) {
            this.outputMissingLicenseKey();
        }
        else if (!ag_grid_community_1._.missingOrEmpty(LicenseManager_1.licenseKey) && LicenseManager_1.licenseKey.length > 32) {
            var _a = LicenseManager_1.extractLicenseComponents(LicenseManager_1.licenseKey), md5 = _a.md5, license = _a.license, version = _a.version, isTrial = _a.isTrial;
            if (md5 === this.md5.md5(license)) {
                if (ag_grid_community_1._.exists(version) && version) {
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
    };
    LicenseManager.extractExpiry = function (license) {
        var restrictionHashed = license.substring(license.lastIndexOf('_') + 1, license.length);
        return new Date(parseInt(LicenseManager_1.decode(restrictionHashed), 10));
    };
    LicenseManager.extractLicenseComponents = function (licenseKey) {
        var hashStart = licenseKey.length - 32;
        var md5 = licenseKey.substring(hashStart);
        var license = licenseKey.substring(0, hashStart);
        var _a = LicenseManager_1.extractBracketedInformation(licenseKey), version = _a[0], isTrial = _a[1];
        return { md5: md5, license: license, version: version, isTrial: isTrial };
    };
    LicenseManager.prototype.getLicenseDetails = function (licenseKey) {
        var _a = LicenseManager_1.extractLicenseComponents(licenseKey), md5 = _a.md5, license = _a.license, version = _a.version, isTrial = _a.isTrial;
        var valid = (md5 === this.md5.md5(license));
        var expiry = null;
        if (valid) {
            expiry = LicenseManager_1.extractExpiry(license);
            valid = !isNaN(expiry.getTime());
        }
        return {
            licenseKey: licenseKey,
            valid: valid,
            expiry: valid ? LicenseManager_1.formatDate(expiry) : null,
            version: version ? version : 'legacy',
            isTrial: isTrial
        };
    };
    LicenseManager.prototype.isDisplayWatermark = function () {
        return !ag_grid_community_1._.missingOrEmpty(this.watermarkMessage);
    };
    LicenseManager.prototype.getWatermarkMessage = function () {
        return this.watermarkMessage;
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
        return new Date(parseInt(LicenseManager_1.decode(LicenseManager_1.RELEASE_INFORMATION), 10));
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
        t = LicenseManager_1.utf8_decode(t);
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
        LicenseManager_1.licenseKey = licenseKey;
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
        switch (version) {
            case "2":
                if (isTrial) {
                    this.validateForTrial(license);
                }
                else {
                    this.validateLegacyKey(license);
                }
                break;
        }
    };
    LicenseManager.prototype.validateLegacyKey = function (license) {
        var gridReleaseDate = LicenseManager_1.getGridReleaseDate();
        var expiry = LicenseManager_1.extractExpiry(license);
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
            var formattedExpiryDate = LicenseManager_1.formatDate(expiry);
            var formattedReleaseDate = LicenseManager_1.formatDate(gridReleaseDate);
            this.outputIncompatibleVersion(formattedExpiryDate, formattedReleaseDate);
        }
    };
    LicenseManager.prototype.validateForTrial = function (license) {
        var expiry = LicenseManager_1.extractExpiry(license);
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
            var formattedExpiryDate = LicenseManager_1.formatDate(expiry);
            this.outputExpiredTrialKey(formattedExpiryDate);
        }
    };
    LicenseManager.prototype.outputInvalidLicenseKey = function () {
        console.error('*****************************************************************************************************************');
        console.error('***************************************** ag-Grid Enterprise License ********************************************');
        console.error('********************************************* Invalid License ***************************************************');
        console.error('* Your license for ag-Grid Enterprise is not valid - please contact info@ag-grid.com to obtain a valid license. *');
        console.error('*****************************************************************************************************************');
        console.error('*****************************************************************************************************************');
        this.watermarkMessage = "Invalid License";
    };
    LicenseManager.prototype.outputExpiredTrialKey = function (formattedExpiryDate) {
        console.error('****************************************************************************************************************');
        console.error('***************************************** ag-Grid Enterprise License *******************************************');
        console.error('*****************************************   Trial Period Expired.    *******************************************');
        console.error("* Your license for ag-Grid Enterprise expired on " + formattedExpiryDate + ".                                                *");
        console.error('* Please email info@ag-grid.com to purchase a license.                                                         *');
        console.error('****************************************************************************************************************');
        console.error('****************************************************************************************************************');
        this.watermarkMessage = "Trial Period Expired";
    };
    LicenseManager.prototype.outputMissingLicenseKey = function () {
        console.error('****************************************************************************************************************');
        console.error('***************************************** ag-Grid Enterprise License *******************************************');
        console.error('****************************************** License Key Not Found ***********************************************');
        console.error('* All ag-Grid Enterprise features are unlocked.                                                                *');
        console.error('* This is an evaluation only version, it is not licensed for development projects intended for production.     *');
        console.error('* If you want to hide the watermark, please email info@ag-grid.com for a trial license.                        *');
        console.error('****************************************************************************************************************');
        console.error('****************************************************************************************************************');
        this.watermarkMessage = "For Trial Use Only";
    };
    LicenseManager.prototype.outputIncompatibleVersion = function (formattedExpiryDate, formattedReleaseDate) {
        console.error('****************************************************************************************************************************');
        console.error('********************************************* ag-Grid Enterprise License ***************************************************');
        console.error('*************************** License not compatible with installed version of ag-Grid Enterprise. ***************************');
        console.error("* Your license for ag-Grid Enterprise expired on " + formattedExpiryDate + " but the version installed was released on " + formattedReleaseDate + ". *");
        console.error('* Please contact info@ag-grid.com to renew your subscription to new versions.                                              *');
        console.error('****************************************************************************************************************************');
        console.error('****************************************************************************************************************************');
        this.watermarkMessage = "Incompatible License Version";
    };
    var LicenseManager_1;
    LicenseManager.RELEASE_INFORMATION = 'MTU2OTUwNzQ0NTUxNw==';
    __decorate([
        ag_grid_community_1.Autowired('md5'),
        __metadata("design:type", md5_1.MD5)
    ], LicenseManager.prototype, "md5", void 0);
    __decorate([
        ag_grid_community_1.PreConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], LicenseManager.prototype, "validateLicense", null);
    LicenseManager = LicenseManager_1 = __decorate([
        ag_grid_community_1.Bean('licenseManager')
    ], LicenseManager);
    return LicenseManager;
}());
exports.LicenseManager = LicenseManager;
