// ag-grid-enterprise v16.0.1
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
var main_1 = require("ag-grid/main");
var main_2 = require("ag-grid/main");
var md5_1 = require("./license/md5");
var LicenseManager = (function () {
    function LicenseManager() {
    }
    LicenseManager_1 = LicenseManager;
    LicenseManager.prototype.validateLicense = function () {
        var gridReleaseDate = LicenseManager_1.getGridReleaseDate();
        var valid = false;
        var current = false;
        var expiry = null;
        if (!main_2.Utils.missingOrEmpty(LicenseManager_1.licenseKey) && LicenseManager_1.licenseKey.length > 32) {
            var _a = LicenseManager_1.extractLicenseComponents(LicenseManager_1.licenseKey), md5 = _a.md5, license = _a.license;
            if (md5 === this.md5.md5(license)) {
                expiry = LicenseManager_1.extractExpiry(license);
                if (!isNaN(expiry.getTime())) {
                    valid = true;
                    current = (gridReleaseDate < expiry);
                }
            }
        }
        if (!valid) {
            LicenseManager_1.outputMessage('********************************************* Invalid License **************************************************', '* Your license for ag-Grid Enterprise is not valid - please contact accounts@ag-grid.com to obtain a valid license. *');
        }
        else if (!current) {
            var formattedExpiryDate = LicenseManager_1.formatDate(expiry);
            var formattedReleaseDate = LicenseManager_1.formatDate(gridReleaseDate);
            LicenseManager_1.outputMessage('********************* License not compatible with installed version of ag-Grid Enterprise. *********************', "Your license for ag-Grid Enterprise expired on " + formattedExpiryDate + " but the version installed was released on " + formattedReleaseDate + ". Please " +
                'contact accounts@ag-grid.com to renew your license');
        }
    };
    LicenseManager.extractExpiry = function (license) {
        var restrictionHashed = license.substring(license.lastIndexOf('_') + 1, license.length);
        return new Date(parseInt(LicenseManager_1.decode(restrictionHashed)));
    };
    LicenseManager.extractLicenseComponents = function (licenseKey) {
        var hashStart = licenseKey.length - 32;
        var md5 = licenseKey.substring(hashStart);
        var license = licenseKey.substring(0, hashStart);
        return { md5: md5, license: license };
    };
    LicenseManager.prototype.getLicenseDetails = function (licenseKey) {
        var _a = LicenseManager_1.extractLicenseComponents(licenseKey), md5 = _a.md5, license = _a.license;
        var valid = (md5 === this.md5.md5(license));
        var expiry;
        if (valid) {
            expiry = LicenseManager_1.extractExpiry(license);
            valid = !isNaN(expiry.getTime());
        }
        return {
            licenseKey: licenseKey,
            valid: valid,
            expiry: valid ? LicenseManager_1.formatDate(expiry) : null
        };
    };
    LicenseManager.outputMessage = function (header, message) {
        console.error('****************************************************************************************************************');
        console.error('*************************************** ag-Grid Enterprise License *********************************************');
        console.error(header);
        console.error(message);
        console.error('****************************************************************************************************************');
        console.error('****************************************************************************************************************');
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
        return new Date(parseInt(LicenseManager_1.decode(LicenseManager_1.RELEASE_INFORMATION)));
    };
    ;
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
    LicenseManager.RELEASE_INFORMATION = 'MTUxNjgwMzAyNTAwNQ==';
    __decorate([
        main_1.Autowired('md5'),
        __metadata("design:type", md5_1.MD5)
    ], LicenseManager.prototype, "md5", void 0);
    LicenseManager = LicenseManager_1 = __decorate([
        main_1.Bean('licenseManager')
    ], LicenseManager);
    return LicenseManager;
    var LicenseManager_1;
}());
exports.LicenseManager = LicenseManager;
