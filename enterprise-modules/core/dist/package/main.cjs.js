var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// enterprise-modules/core/src/main.ts
var main_exports = {};
__export(main_exports, {
  EnterpriseCoreModule: () => EnterpriseCoreModule,
  LicenseManager: () => GridLicenseManager
});
module.exports = __toCommonJS(main_exports);

// enterprise-modules/core/src/agGridEnterpriseModule.ts
var import_core3 = require("@ag-grid-community/core");

// enterprise-modules/core/src/license/gridLicenseManager.ts
var import_core = require("@ag-grid-community/core");

// enterprise-modules/core/src/license/shared/md5.ts
var MD5 = class {
  constructor() {
    this.ieCompatibility = false;
  }
  init() {
    this.ieCompatibility = this.md5("hello") != "5d41402abc4b2a76b9719d911017c592";
  }
  md5cycle(x, k) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
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
  }
  cmn(q, a, b, x, s, t) {
    a = this.add32(this.add32(a, q), this.add32(x, t));
    return this.add32(a << s | a >>> 32 - s, b);
  }
  ff(a, b, c, d, x, s, t) {
    return this.cmn(b & c | ~b & d, a, b, x, s, t);
  }
  gg(a, b, c, d, x, s, t) {
    return this.cmn(b & d | c & ~d, a, b, x, s, t);
  }
  hh(a, b, c, d, x, s, t) {
    return this.cmn(b ^ c ^ d, a, b, x, s, t);
  }
  ii(a, b, c, d, x, s, t) {
    return this.cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  md51(s) {
    const n = s.length;
    const state = [1732584193, -271733879, -1732584194, 271733878];
    let i;
    for (i = 64; i <= s.length; i += 64) {
      this.md5cycle(state, this.md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++) {
      tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
    }
    tail[i >> 2] |= 128 << (i % 4 << 3);
    if (i > 55) {
      this.md5cycle(state, tail);
      for (i = 0; i < 16; i++) {
        tail[i] = 0;
      }
    }
    tail[14] = n * 8;
    this.md5cycle(state, tail);
    return state;
  }
  /* there needs to be support for Unicode here, * unless we pretend that we can redefine the MD-5
   * algorithm for multi-byte characters (perhaps by adding every four 16-bit characters and
   * shortening the sum to 32 bits). Otherwise I suthis.ggest performing MD-5 as if every character
   * was two bytes--e.g., 0040 0025 = @%--but then how will an ordinary MD-5 sum be matched?
   * There is no way to standardize text to something like UTF-8 before transformation; speed cost is
   * utterly prohibitive. The JavaScript standard itself needs to look at this: it should start
   * providing access to strings as preformed UTF-8 8-bit unsigned value arrays.
   */
  md5blk(s) {
    const md5blks = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }
  rhex(n) {
    const hex_chr = "0123456789abcdef".split("");
    let s = "", j = 0;
    for (; j < 4; j++) {
      s += hex_chr[n >> j * 8 + 4 & 15] + hex_chr[n >> j * 8 & 15];
    }
    return s;
  }
  hex(x) {
    for (let i = 0; i < x.length; i++) {
      x[i] = this.rhex(x[i]);
    }
    return x.join("");
  }
  md5(s) {
    return this.hex(this.md51(s));
  }
  add32(a, b) {
    return this.ieCompatibility ? this.add32Compat(a, b) : this.add32Std(a, b);
  }
  /* this function is much faster, so if possible we use it. Some IEs are the only ones I know of that
   need the idiotic second function, generated by an if clause.  */
  add32Std(a, b) {
    return a + b & 4294967295;
  }
  add32Compat(x, y) {
    const lsw = (x & 65535) + (y & 65535), msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return msw << 16 | lsw & 65535;
  }
};

// enterprise-modules/core/src/license/shared/licenseManager.ts
function missingOrEmpty(value) {
  return value == null || value.length === 0;
}
var LICENSE_TYPES = {
  "01": "GRID",
  "02": "CHARTS",
  "0102": "BOTH"
};
var _LicenseManager = class _LicenseManager {
  constructor(document) {
    this.watermarkMessage = void 0;
    this.totalMessageLength = 124;
    this.document = document;
    this.md5 = new MD5();
    this.md5.init();
  }
  validateLicense() {
    const licenseDetails = this.getLicenseDetails(_LicenseManager.licenseKey);
    const currentLicenseName = `AG Grid ${licenseDetails.currentLicenseType === "BOTH" ? "and AG Charts " : ""}Enterprise`;
    const suppliedLicenseName = licenseDetails.suppliedLicenseType === void 0 ? "" : `AG ${licenseDetails.suppliedLicenseType === "BOTH" ? "Grid and AG Charts" : licenseDetails.suppliedLicenseType === "GRID" ? "Grid" : "Charts"} Enterprise`;
    if (licenseDetails.missing) {
      if (!this.isWebsiteUrl() || this.isForceWatermark()) {
        this.outputMissingLicenseKey(currentLicenseName);
      }
    } else if (licenseDetails.expired) {
      const gridReleaseDate = _LicenseManager.getGridReleaseDate();
      const formattedReleaseDate = _LicenseManager.formatDate(gridReleaseDate);
      this.outputExpiredKey(licenseDetails.expiry, formattedReleaseDate, currentLicenseName, suppliedLicenseName);
    } else if (!licenseDetails.valid) {
      this.outputInvalidLicenseKey(!!licenseDetails.incorrectLicenseType, currentLicenseName, suppliedLicenseName);
    } else if (licenseDetails.isTrial && licenseDetails.trialExpired) {
      this.outputExpiredTrialKey(licenseDetails.expiry, currentLicenseName, suppliedLicenseName);
    }
  }
  static extractExpiry(license) {
    const restrictionHashed = license.substring(license.lastIndexOf("_") + 1, license.length);
    return new Date(parseInt(_LicenseManager.decode(restrictionHashed), 10));
  }
  static extractLicenseComponents(licenseKey) {
    let cleanedLicenseKey = licenseKey.replace(/[\u200B-\u200D\uFEFF]/g, "");
    cleanedLicenseKey = cleanedLicenseKey.replace(/\r?\n|\r/g, "");
    if (licenseKey.length <= 32) {
      return { md5: null, license: licenseKey, version: null, isTrial: null };
    }
    const hashStart = cleanedLicenseKey.length - 32;
    const md5 = cleanedLicenseKey.substring(hashStart);
    const license = cleanedLicenseKey.substring(0, hashStart);
    const [version, isTrial, type] = _LicenseManager.extractBracketedInformation(cleanedLicenseKey);
    return { md5, license, version, isTrial, type };
  }
  getLicenseDetails(licenseKey) {
    const currentLicenseType = _LicenseManager.chartsLicenseManager ? "BOTH" : "GRID";
    if (missingOrEmpty(licenseKey)) {
      return {
        licenseKey,
        valid: false,
        missing: true,
        currentLicenseType
      };
    }
    const gridReleaseDate = _LicenseManager.getGridReleaseDate();
    const { md5, license, version, isTrial, type } = _LicenseManager.extractLicenseComponents(licenseKey);
    let valid = md5 === this.md5.md5(license) && licenseKey.indexOf("For_Trialing_ag-Grid_Only") === -1;
    let trialExpired = void 0;
    let expired = void 0;
    let expiry = null;
    let incorrectLicenseType = false;
    let suppliedLicenseType = void 0;
    function handleTrial() {
      const now = /* @__PURE__ */ new Date();
      trialExpired = expiry < now;
      expired = void 0;
    }
    if (valid) {
      expiry = _LicenseManager.extractExpiry(license);
      valid = !isNaN(expiry.getTime());
      if (valid) {
        expired = gridReleaseDate > expiry;
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
            } else {
              suppliedLicenseType = type;
              if (type !== LICENSE_TYPES["01"] && type !== LICENSE_TYPES["0102"] || currentLicenseType === "BOTH" && suppliedLicenseType !== "BOTH") {
                valid = false;
                incorrectLicenseType = true;
              } else if (isTrial) {
                handleTrial();
              }
            }
          }
        }
      }
    }
    if (!valid) {
      return {
        licenseKey,
        valid,
        incorrectLicenseType,
        currentLicenseType,
        suppliedLicenseType
      };
    }
    return {
      licenseKey,
      valid,
      expiry: _LicenseManager.formatDate(expiry),
      expired,
      version,
      isTrial,
      trialExpired,
      incorrectLicenseType,
      currentLicenseType,
      suppliedLicenseType
    };
  }
  isDisplayWatermark() {
    return this.isForceWatermark() || !this.isLocalhost() && !this.isWebsiteUrl() && !missingOrEmpty(this.watermarkMessage);
  }
  getWatermarkMessage() {
    return this.watermarkMessage || "";
  }
  getHostname() {
    const win = this.document.defaultView || window;
    const loc = win.location;
    const { hostname = "" } = loc;
    return hostname;
  }
  isForceWatermark() {
    const win = this.document.defaultView || window;
    const loc = win.location;
    const { pathname } = loc;
    return pathname ? pathname.indexOf("forceWatermark") !== -1 : false;
  }
  isWebsiteUrl() {
    const hostname = this.getHostname();
    return hostname.match(/^((?:[\w-]+\.)?ag-grid\.com)$/) !== null;
  }
  isLocalhost() {
    const hostname = this.getHostname();
    return hostname.match(/^(?:127\.0\.0\.1|localhost)$/) !== null;
  }
  static formatDate(date) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    return day + " " + monthNames[monthIndex] + " " + year;
  }
  static getGridReleaseDate() {
    return new Date(parseInt(_LicenseManager.decode(_LicenseManager.RELEASE_INFORMATION), 10));
  }
  static decode(input) {
    const keystr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let t = "";
    let n, r, i;
    let s, o, u, a;
    let f = 0;
    const e = input.replace(/[^A-Za-z0-9+/=]/g, "");
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
    t = _LicenseManager.utf8_decode(t);
    return t;
  }
  static utf8_decode(input) {
    input = input.replace(/rn/g, "n");
    let t = "";
    for (let n = 0; n < input.length; n++) {
      const r = input.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
      } else if (r > 127 && r < 2048) {
        t += String.fromCharCode(r >> 6 | 192);
        t += String.fromCharCode(r & 63 | 128);
      } else {
        t += String.fromCharCode(r >> 12 | 224);
        t += String.fromCharCode(r >> 6 & 63 | 128);
        t += String.fromCharCode(r & 63 | 128);
      }
    }
    return t;
  }
  static setChartsLicenseManager(dependantLicenseManager) {
    this.chartsLicenseManager = dependantLicenseManager;
  }
  static setLicenseKey(licenseKey) {
    this.licenseKey = licenseKey;
    if (this.chartsLicenseManager) {
      this.chartsLicenseManager.setLicenseKey(licenseKey, true);
    }
  }
  static extractBracketedInformation(licenseKey) {
    if (!licenseKey.includes("[")) {
      return ["legacy", false, void 0];
    }
    const matches = licenseKey.match(/\[(.*?)\]/g).map((match) => match.replace("[", "").replace("]", ""));
    if (!matches || matches.length === 0) {
      return ["legacy", false, void 0];
    }
    const isTrial = matches.filter((match) => match === "TRIAL").length === 1;
    const rawVersion = matches.filter((match) => match.indexOf("v") === 0)[0];
    const version = rawVersion ? rawVersion.replace("v", "") : "legacy";
    const type = LICENSE_TYPES[matches.filter((match) => LICENSE_TYPES[match])[0]];
    return [version, isTrial, type];
  }
  centerPadAndOutput(input) {
    const paddingRequired = this.totalMessageLength - input.length;
    console.error(input.padStart(paddingRequired / 2 + input.length, "*").padEnd(this.totalMessageLength, "*"));
  }
  padAndOutput(input, padding = "*", terminateWithPadding = "") {
    console.error(input.padEnd(this.totalMessageLength - terminateWithPadding.length, padding) + terminateWithPadding);
  }
  outputInvalidLicenseKey(incorrectLicenseType, currentLicenseName, suppliedLicenseName) {
    if (incorrectLicenseType) {
      this.centerPadAndOutput("");
      this.centerPadAndOutput(` ${currentLicenseName} License `);
      this.centerPadAndOutput(" Incompatible License Key ");
      this.padAndOutput(`* Your license key is for ${suppliedLicenseName} only and does not cover you for ${currentLicenseName}.`, " ", "*");
      this.padAndOutput("* Please contact info@ag-grid.com to obtain a combined license key.", " ", "*");
      this.centerPadAndOutput("");
      this.centerPadAndOutput("");
    } else {
      this.centerPadAndOutput("");
      this.centerPadAndOutput(` ${currentLicenseName} License `);
      this.centerPadAndOutput(" Invalid License Key ");
      this.padAndOutput(`* Your license key is not valid - please contact info@ag-grid.com to obtain a valid license.`, " ", "*");
      this.centerPadAndOutput("");
      this.centerPadAndOutput("");
    }
    this.watermarkMessage = "Invalid License";
  }
  outputExpiredTrialKey(formattedExpiryDate, currentLicenseName, suppliedLicenseName) {
    this.centerPadAndOutput("");
    this.centerPadAndOutput(` ${currentLicenseName} License `);
    this.centerPadAndOutput(" Trial Period Expired. ");
    this.padAndOutput(`* Your trial only license for ${suppliedLicenseName} expired on ${formattedExpiryDate}.`, " ", "*");
    this.padAndOutput("* Please email info@ag-grid.com to purchase a license.", " ", "*");
    this.centerPadAndOutput("");
    this.centerPadAndOutput("");
    this.watermarkMessage = "Trial Period Expired";
  }
  outputMissingLicenseKey(currentLicenseName) {
    this.centerPadAndOutput("");
    this.centerPadAndOutput(` ${currentLicenseName} License `);
    this.centerPadAndOutput(" License Key Not Found ");
    this.padAndOutput(`* All ${currentLicenseName} features are unlocked for trial.`, " ", "*");
    this.padAndOutput("* If you want to hide the watermark please email info@ag-grid.com for a trial license key.", " ", "*");
    this.centerPadAndOutput("");
    this.centerPadAndOutput("");
    this.watermarkMessage = "For Trial Use Only";
  }
  outputExpiredKey(formattedExpiryDate, formattedReleaseDate, currentLicenseName, suppliedLicenseName) {
    this.centerPadAndOutput("");
    this.centerPadAndOutput(` ${currentLicenseName} License `);
    this.centerPadAndOutput(" Incompatible Software Version ");
    this.padAndOutput(`* Your license key works with versions of ${suppliedLicenseName} released before ${formattedExpiryDate}.`, " ", "*");
    this.padAndOutput(`* The version you are trying to use was released on ${formattedReleaseDate}.`, " ", "*");
    this.padAndOutput("* Please contact info@ag-grid.com to renew your license key.", " ", "*");
    this.centerPadAndOutput("");
    this.centerPadAndOutput("");
    this.watermarkMessage = "License Expired";
  }
};
_LicenseManager.RELEASE_INFORMATION = "MTcxNTc3NTcyODYxNg==";
var LicenseManager = _LicenseManager;

// enterprise-modules/core/src/license/gridLicenseManager.ts
var GridLicenseManager = class extends import_core.BeanStub {
  validateLicense() {
    this.licenseManager = new LicenseManager(this.gos.getDocument());
    this.licenseManager.validateLicense();
  }
  static getLicenseDetails(licenseKey) {
    return new LicenseManager(null).getLicenseDetails(licenseKey);
  }
  isDisplayWatermark() {
    return this.licenseManager.isDisplayWatermark();
  }
  getWatermarkMessage() {
    return this.licenseManager.getWatermarkMessage();
  }
  static setLicenseKey(licenseKey) {
    LicenseManager.setLicenseKey(licenseKey);
  }
  static setChartsLicenseManager(chartsLicenseManager) {
    LicenseManager.setChartsLicenseManager(chartsLicenseManager);
  }
};
__decorateClass([
  import_core.PreConstruct
], GridLicenseManager.prototype, "validateLicense", 1);
GridLicenseManager = __decorateClass([
  (0, import_core.Bean)("licenseManager")
], GridLicenseManager);

// enterprise-modules/core/src/license/watermark.ts
var import_core2 = require("@ag-grid-community/core");
var WatermarkComp = class extends import_core2.Component {
  constructor() {
    super(
      /* html*/
      `<div class="ag-watermark">
                <div ref="eLicenseTextRef" class="ag-watermark-text"></div>
            </div>`
    );
  }
  postConstruct() {
    const show = this.shouldDisplayWatermark();
    this.setDisplayed(show);
    if (show) {
      this.eLicenseTextRef.innerText = this.licenseManager.getWatermarkMessage();
      window.setTimeout(() => this.addCssClass("ag-opacity-zero"), 0);
      window.setTimeout(() => this.setDisplayed(false), 5e3);
    }
  }
  shouldDisplayWatermark() {
    return this.licenseManager.isDisplayWatermark();
  }
};
__decorateClass([
  (0, import_core2.Autowired)("licenseManager")
], WatermarkComp.prototype, "licenseManager", 2);
__decorateClass([
  (0, import_core2.RefSelector)("eLicenseTextRef")
], WatermarkComp.prototype, "eLicenseTextRef", 2);
__decorateClass([
  import_core2.PostConstruct
], WatermarkComp.prototype, "postConstruct", 1);

// enterprise-modules/core/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/core/src/agGridEnterpriseModule.ts
var EnterpriseCoreModule = {
  version: VERSION,
  moduleName: import_core3.ModuleNames.EnterpriseCoreModule,
  beans: [GridLicenseManager],
  agStackComponents: [
    { componentName: "AgWatermark", componentClass: WatermarkComp }
  ]
};
