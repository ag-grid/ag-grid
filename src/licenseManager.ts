import {Bean, Autowired, PostConstruct} from "ag-grid/main";
import {Utils as _} from "ag-grid/main";
import {MD5} from "./license/md5";

@Bean('licenseManager')
export class LicenseManager {
    private static licenseKey:string;

    @Autowired('md5') private md5:MD5;

    public validateLicense():void {
        var valid:boolean = false;
        var current:boolean = false;

        console.log("validating license: " + LicenseManager.licenseKey);
        if (!_.missingOrEmpty(LicenseManager.licenseKey) && LicenseManager.licenseKey.length > 32) {
            var hashStart = LicenseManager.licenseKey.length - 32;
            var md5 = LicenseManager.licenseKey.substring(hashStart);
            var license = LicenseManager.licenseKey.substring(0, hashStart);

            if (md5 === this.md5.md5(license)) {

                var restrictionHashed = license.substring(license.lastIndexOf("_") + 1, license.length);
                var expiry = new Date(parseInt(LicenseManager.decode(restrictionHashed)));

                if(!isNaN(expiry.getTime())) {
                    valid = true;
                    current = (new Date().getTime() < expiry)
                }
            }
        }

        if (!valid) {
            alert("Your license is not valid")
        } else if(!current) {
            alert("Your license has expired (valid until " + expiry + ")")
        }
    }

    private static decode(input:string):string {
        var keystr:string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var t = "";
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        var e = input.replace(/[^A-Za-z0-9+/=]/g, "");
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
        input = input.replace(/rn/g, "n");
        var t = "";
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