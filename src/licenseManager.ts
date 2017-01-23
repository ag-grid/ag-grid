import {Bean, Autowired, PostConstruct} from 'ag-grid/main';
import {Utils} from 'ag-grid/main';
import {MD5} from './license/md5';

@Bean('licenseManager')
export class LicenseManager {
    private static RELEASE_INFORMATION:string = 'MTQ4NTE3OTkyOTcwNw==';
    private static licenseKey:string;

    @Autowired('md5') private md5:MD5;

    public validateLicense():void {
        var gridReleaseDate = LicenseManager.getGridReleaseDate();
        var valid:boolean = false;
        var current:boolean = false;

        if (!Utils.missingOrEmpty(LicenseManager.licenseKey) && LicenseManager.licenseKey.length > 32) {
            var hashStart = LicenseManager.licenseKey.length - 32;
            var md5 = LicenseManager.licenseKey.substring(hashStart);
            var license = LicenseManager.licenseKey.substring(0, hashStart);

            if (md5 === this.md5.md5(license)) {

                var restrictionHashed = license.substring(license.lastIndexOf('_') + 1, license.length);
                var expiry = new Date(parseInt(LicenseManager.decode(restrictionHashed)));

                if(!isNaN(expiry.getTime())) {
                    valid = true;
                    current = (gridReleaseDate < expiry)
                }
            }
        }

        if (!valid) {
            LicenseManager.outputMessage('********************************************* Invalid License **************************************************',
                '* Your license for ag-Grid Enterprise is not valid - please contact accounts@ag-grid.com to obtain a valid license. *');
        } else if(!current) {
            var formattedExpiryDate= LicenseManager.formatDate(expiry);
            var formattedReleaseDate = LicenseManager.formatDate(gridReleaseDate);
            LicenseManager.outputMessage('********************* License not compatible with installed version of ag-Grid Enterprise. *********************',
                `Your license for ag-Grid Enterprise expired on ${formattedExpiryDate} but the version installed was released on ${formattedReleaseDate}. Please ` +
                            'contact accounts@ag-grid.com to renew your license');
        }
    }

    private static outputMessage(header:string, message:string) {
        console.error('****************************************************************************************************************');
        console.error('*************************************** ag-Grid Enterprise License *********************************************');
        console.error(header);
        console.error(message);
        console.error('****************************************************************************************************************');
        console.error('****************************************************************************************************************');
    }

    private static formatDate(date:any):string {
        var monthNames:[string] = [
            'January', 'February', 'March',
            'April', 'May', 'June', 'July',
            'August', 'September', 'October',
            'November', 'December'
        ];

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        return day + ' ' + monthNames[monthIndex] + ' ' + year;
    }


    private static getGridReleaseDate() {
        return new Date(parseInt(LicenseManager.decode(LicenseManager.RELEASE_INFORMATION)));
    };

    private static decode(input:string):string {
        var keystr:string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var t = '';
        var n:any, r:any, i:any;
        var s:any, o:any, u:any, a:any;
        var f:number = 0;
        var e:string = input.replace(/[^A-Za-z0-9+/=]/g, '');
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
                t = t + String.fromCharCode(r)
            }
            if (a != 64) {
                t = t + String.fromCharCode(i)
            }
        }
        t = LicenseManager.utf8_decode(t);
        return t
    }


    private static utf8_decode(input:string):string {
        input = input.replace(/rn/g, 'n');
        var t = '';
        for (var n = 0; n < input.length; n++) {
            var r = input.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r)
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128)
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128)
            }
        }
        return t
    }

    static setLicenseKey(licenseKey:string):void {
        LicenseManager.licenseKey = licenseKey;
    }
}