// ag-grid-enterprise v8.0.0
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
var main_1 = require('ag-grid/main');
var main_2 = require('ag-grid/main');
var md5_1 = require('./license/md5');
var LicenseManager = (function () {
    function LicenseManager() {
    }
    LicenseManager.prototype.validateLicense = function () {
        var gridReleaseDate = LicenseManager.getGridReleaseDate();
        var valid = false;
        var current = false;
        if (!main_2.Utils.missingOrEmpty(LicenseManager.licenseKey) && LicenseManager.licenseKey.length > 32) {
            var hashStart = LicenseManager.licenseKey.length - 32;
            var md5 = LicenseManager.licenseKey.substring(hashStart);
            var license = LicenseManager.licenseKey.substring(0, hashStart);
            if (md5 === this.md5.md5(license)) {
                var restrictionHashed = license.substring(license.lastIndexOf('_') + 1, license.length);
                var expiry = new Date(parseInt(LicenseManager.decode(restrictionHashed)));
                if (!isNaN(expiry.getTime())) {
                    valid = true;
                    current = (gridReleaseDate < expiry);
                }
            }
        }
        if (!valid) {
            LicenseManager.outputMessage('********************************************* Invalid License **************************************************', '* Your license for ag-Grid Enterprise is not valid - please contact accounts@ag-grid.com to obtain a valid license. *');
        }
        else if (!current) {
            var formattedExpiryDate = LicenseManager.formatDate(expiry);
            var formattedReleaseDate = LicenseManager.formatDate(gridReleaseDate);
            LicenseManager.outputMessage('********************* License not compatible with installed version of ag-Grid Enterprise. *********************', ("Your license for ag-Grid Enterprise expired on " + formattedExpiryDate + " but the version installed was released on " + formattedReleaseDate + ". Please ") +
                'contact accounts@ag-grid.com to renew your license');
        }
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
        return new Date(parseInt(LicenseManager.decode(LicenseManager.RELEASE_INFORMATION)));
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
        LicenseManager.licenseKey = licenseKey;
    };
    LicenseManager.RELEASE_INFORMATION = 'MTQ4NTE3OTkyOTcwNw==';
    __decorate([
        main_1.Autowired('md5'), 
        __metadata('design:type', md5_1.MD5)
    ], LicenseManager.prototype, "md5", void 0);
    LicenseManager = __decorate([
        main_1.Bean('licenseManager'), 
        __metadata('design:paramtypes', [])
    ], LicenseManager);
    return LicenseManager;
}());
exports.LicenseManager = LicenseManager;
