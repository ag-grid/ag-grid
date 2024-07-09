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

// enterprise-modules/core/src/main.ts
var main_exports = {};
__export(main_exports, {
  AgDialog: () => AgDialog,
  AgGroupComponent: () => AgGroupComponent,
  AgGroupComponentSelector: () => AgGroupComponentSelector,
  AgMenuItemComponent: () => AgMenuItemComponent,
  AgMenuItemRenderer: () => AgMenuItemRenderer,
  AgMenuList: () => AgMenuList,
  AgMenuPanel: () => AgMenuPanel,
  AgPanel: () => AgPanel,
  AgRichSelect: () => AgRichSelect,
  EnterpriseCoreModule: () => EnterpriseCoreModule,
  GroupCellRenderer: () => GroupCellRenderer,
  GroupCellRendererCtrl: () => GroupCellRendererCtrl,
  LicenseManager: () => GridLicenseManager,
  PillDragComp: () => PillDragComp,
  PillDropZonePanel: () => PillDropZonePanel,
  TabbedLayout: () => TabbedLayout,
  VirtualList: () => VirtualList,
  VirtualListDragFeature: () => VirtualListDragFeature
});
module.exports = __toCommonJS(main_exports);

// enterprise-modules/core/src/agGridEnterpriseModule.ts
var import_core5 = require("@ag-grid-community/core");

// enterprise-modules/core/src/license/gridLicenseManager.ts
var import_core3 = require("@ag-grid-community/core");

// enterprise-modules/core/src/license/shared/licenseManager.ts
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
var LICENSE_TYPES = {
  "01": "GRID",
  "02": "CHARTS",
  "0102": "BOTH"
};
var _LicenseManager = class _LicenseManager {
  constructor(document2) {
    this.watermarkMessage = void 0;
    this.totalMessageLength = 124;
    this.document = document2;
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
      this.outputInvalidLicenseKey(
        !!licenseDetails.incorrectLicenseType,
        currentLicenseName,
        suppliedLicenseName
      );
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
    if ((0, import_core._missingOrEmpty)(licenseKey)) {
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
            if ((0, import_core._missingOrEmpty)(type)) {
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
    return this.isForceWatermark() || !this.isLocalhost() && !this.isWebsiteUrl() && !(0, import_core._missingOrEmpty)(this.watermarkMessage);
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
    console.error(
      input.padEnd(this.totalMessageLength - terminateWithPadding.length, padding) + terminateWithPadding
    );
  }
  outputInvalidLicenseKey(incorrectLicenseType, currentLicenseName, suppliedLicenseName) {
    if (incorrectLicenseType) {
      this.centerPadAndOutput("");
      this.centerPadAndOutput(` ${currentLicenseName} License `);
      this.centerPadAndOutput(" Incompatible License Key ");
      this.padAndOutput(
        `* Your license key is for ${suppliedLicenseName} only and does not cover you for ${currentLicenseName}.`,
        " ",
        "*"
      );
      this.padAndOutput("* Please contact info@ag-grid.com to obtain a combined license key.", " ", "*");
      this.centerPadAndOutput("");
      this.centerPadAndOutput("");
    } else {
      this.centerPadAndOutput("");
      this.centerPadAndOutput(` ${currentLicenseName} License `);
      this.centerPadAndOutput(" Invalid License Key ");
      this.padAndOutput(
        `* Your license key is not valid - please contact info@ag-grid.com to obtain a valid license.`,
        " ",
        "*"
      );
      this.centerPadAndOutput("");
      this.centerPadAndOutput("");
    }
    this.watermarkMessage = "Invalid License";
  }
  outputExpiredTrialKey(formattedExpiryDate, currentLicenseName, suppliedLicenseName) {
    this.centerPadAndOutput("");
    this.centerPadAndOutput(` ${currentLicenseName} License `);
    this.centerPadAndOutput(" Trial Period Expired. ");
    this.padAndOutput(
      `* Your trial only license for ${suppliedLicenseName} expired on ${formattedExpiryDate}.`,
      " ",
      "*"
    );
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
    this.padAndOutput(
      "* If you want to hide the watermark please email info@ag-grid.com for a trial license key.",
      " ",
      "*"
    );
    this.centerPadAndOutput("");
    this.centerPadAndOutput("");
    this.watermarkMessage = "For Trial Use Only";
  }
  outputExpiredKey(formattedExpiryDate, formattedReleaseDate, currentLicenseName, suppliedLicenseName) {
    this.centerPadAndOutput("");
    this.centerPadAndOutput(` ${currentLicenseName} License `);
    this.centerPadAndOutput(" Incompatible Software Version ");
    this.padAndOutput(
      `* Your license key works with versions of ${suppliedLicenseName} released before ${formattedExpiryDate}.`,
      " ",
      "*"
    );
    this.padAndOutput(`* The version you are trying to use was released on ${formattedReleaseDate}.`, " ", "*");
    this.padAndOutput("* Please contact info@ag-grid.com to renew your license key.", " ", "*");
    this.centerPadAndOutput("");
    this.centerPadAndOutput("");
    this.watermarkMessage = "License Expired";
  }
};
_LicenseManager.RELEASE_INFORMATION = "MTcxOTQzMTYzMDEwNw==";
var LicenseManager = _LicenseManager;

// enterprise-modules/core/src/license/watermark.ts
var import_core2 = require("@ag-grid-community/core");
var AgWatermark = class extends import_core2.Component {
  constructor() {
    super(
      /* html*/
      `<div class="ag-watermark">
                <div data-ref="eLicenseTextRef" class="ag-watermark-text"></div>
            </div>`
    );
    this.eLicenseTextRef = import_core2.RefPlaceholder;
  }
  wireBeans(beans) {
    this.licenseManager = beans.licenseManager;
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
var AgWatermarkSelector = {
  selector: "AG-WATERMARK",
  component: AgWatermark
};

// enterprise-modules/core/src/license/gridLicenseManager.ts
var GridLicenseManager = class extends import_core3.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "licenseManager";
  }
  postConstruct() {
    this.validateLicense();
  }
  validateLicense() {
    this.licenseManager = new LicenseManager(this.gos.getDocument());
    this.licenseManager.validateLicense();
  }
  static getLicenseDetails(licenseKey) {
    return new LicenseManager(null).getLicenseDetails(licenseKey);
  }
  getWatermarkSelector() {
    return AgWatermarkSelector;
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

// enterprise-modules/core/src/version.ts
var VERSION = "32.0.1";

// enterprise-modules/core/src/widgets/agMenuItemRenderer.ts
var import_core4 = require("@ag-grid-community/core");
var AgMenuItemRenderer = class extends import_core4.Component {
  constructor() {
    super();
    this.setTemplate(
      /* html */
      `<div></div>`
    );
  }
  init(params) {
    this.params = params;
    this.cssClassPrefix = this.params.cssClassPrefix ?? "ag-menu-option";
    this.addIcon();
    this.addName();
    this.addShortcut();
    this.addSubMenu();
  }
  configureDefaults() {
    return true;
  }
  addIcon() {
    if (this.params.isCompact) {
      return;
    }
    const iconWrapper = (0, import_core4._loadTemplate)(
      /* html */
      `<span data-ref="eIcon" class="${this.getClassName("part")} ${this.getClassName("icon")}" role="presentation"></span>`
    );
    const { checked, icon } = this.params;
    if (checked) {
      iconWrapper.appendChild((0, import_core4._createIconNoSpan)("check", this.gos));
    } else if (icon) {
      if ((0, import_core4._isNodeOrElement)(icon)) {
        iconWrapper.appendChild(icon);
      } else if (typeof icon === "string") {
        iconWrapper.innerHTML = icon;
      } else {
        (0, import_core4._warnOnce)("menu item icon must be DOM node or string");
      }
    }
    this.getGui().appendChild(iconWrapper);
  }
  addName() {
    const name = (0, import_core4._loadTemplate)(
      /* html */
      `<span data-ref="eName" class="${this.getClassName("part")} ${this.getClassName("text")}">${this.params.name || ""}</span>`
    );
    this.getGui().appendChild(name);
  }
  addShortcut() {
    if (this.params.isCompact) {
      return;
    }
    const shortcut = (0, import_core4._loadTemplate)(
      /* html */
      `<span data-ref="eShortcut" class="${this.getClassName("part")} ${this.getClassName("shortcut")}">${this.params.shortcut || ""}</span>`
    );
    this.getGui().appendChild(shortcut);
  }
  addSubMenu() {
    const pointer = (0, import_core4._loadTemplate)(
      /* html */
      `<span data-ref="ePopupPointer" class="${this.getClassName("part")} ${this.getClassName("popup-pointer")}"></span>`
    );
    const eGui = this.getGui();
    if (this.params.subMenu) {
      const iconName = this.gos.get("enableRtl") ? "smallLeft" : "smallRight";
      (0, import_core4._setAriaExpanded)(eGui, false);
      pointer.appendChild((0, import_core4._createIconNoSpan)(iconName, this.gos));
    }
    eGui.appendChild(pointer);
  }
  getClassName(suffix) {
    return `${this.cssClassPrefix}-${suffix}`;
  }
  destroy() {
    super.destroy();
  }
};

// enterprise-modules/core/src/agGridEnterpriseModule.ts
var EnterpriseCoreModule = {
  version: VERSION,
  moduleName: import_core5.ModuleNames.EnterpriseCoreModule,
  beans: [GridLicenseManager],
  userComponents: [
    {
      name: "agMenuItem",
      classImp: AgMenuItemRenderer
    }
  ]
};

// enterprise-modules/core/src/widgets/agGroupComponent.ts
var import_core6 = require("@ag-grid-community/core");
function getAgGroupComponentTemplate(params) {
  const cssIdentifier = params.cssIdentifier || "default";
  const direction = params.direction || "vertical";
  return (
    /* html */
    `
        <div class="ag-group ag-${cssIdentifier}-group" role="presentation">
            <div data-ref="eToolbar" class="ag-group-toolbar ag-${cssIdentifier}-group-toolbar">
                <ag-checkbox data-ref="cbGroupEnabled"></ag-checkbox>
            </div>
            <div data-ref="eContainer" class="ag-group-container ag-group-container-${direction} ag-${cssIdentifier}-group-container"></div>
        </div>
    `
  );
}
var AgGroupComponent = class extends import_core6.Component {
  constructor(params = {}) {
    super(getAgGroupComponentTemplate(params), [import_core6.AgCheckboxSelector]);
    this.params = params;
    this.suppressEnabledCheckbox = true;
    this.suppressToggleExpandOnEnableChange = false;
    this.eToolbar = import_core6.RefPlaceholder;
    this.cbGroupEnabled = import_core6.RefPlaceholder;
    this.eContainer = import_core6.RefPlaceholder;
    const {
      enabled,
      items,
      suppressEnabledCheckbox,
      expanded,
      suppressToggleExpandOnEnableChange,
      useToggle: toggleMode
    } = params;
    this.cssIdentifier = params.cssIdentifier || "default";
    this.enabled = enabled != null ? enabled : true;
    this.items = items || [];
    this.useToggle = toggleMode ?? false;
    this.alignItems = params.alignItems || "center";
    this.expanded = expanded == null ? true : expanded;
    if (suppressEnabledCheckbox != null) {
      this.suppressEnabledCheckbox = suppressEnabledCheckbox;
    }
    if (suppressToggleExpandOnEnableChange != null) {
      this.suppressToggleExpandOnEnableChange = suppressToggleExpandOnEnableChange;
    }
  }
  postConstruct() {
    this.setupTitleBar();
    if (this.items.length) {
      const initialItems = this.items;
      this.items = [];
      this.addItems(initialItems);
    }
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    this.cbGroupEnabled.setLabel(localeTextFunc("enabled", "Enabled"));
    if (this.enabled) {
      this.setEnabled(this.enabled, void 0, true);
    }
    this.setAlignItems(this.alignItems);
    const { onEnableChange, onExpandedChange, suppressOpenCloseIcons } = this.params;
    this.hideEnabledCheckbox(this.suppressEnabledCheckbox);
    this.hideOpenCloseIcons(suppressOpenCloseIcons ?? false);
    this.refreshChildDisplay();
    (0, import_core6._setDisplayed)(this.eContainer, this.expanded);
    this.cbGroupEnabled.onValueChange((newSelection) => {
      this.setEnabled(newSelection, true, this.suppressToggleExpandOnEnableChange);
      this.dispatchEnableChangeEvent(newSelection);
    });
    if (onEnableChange != null) {
      this.onEnableChange(onEnableChange);
    }
    if (onExpandedChange != null) {
      this.onExpandedChange(onExpandedChange);
    }
  }
  refreshChildDisplay() {
    (0, import_core6._setDisplayed)(this.eToolbar, this.expanded && !this.suppressEnabledCheckbox);
    this.eTitleBar?.refreshOnExpand(this.expanded);
  }
  isExpanded() {
    return this.expanded;
  }
  setAlignItems(alignment) {
    if (this.alignItems !== alignment) {
      this.removeCssClass(`ag-group-item-alignment-${this.alignItems}`);
    }
    this.alignItems = alignment;
    const newCls = `ag-group-item-alignment-${this.alignItems}`;
    this.addCssClass(newCls);
    return this;
  }
  toggleGroupExpand(expanded, silent) {
    if (this.eTitleBar?.isSuppressCollapse() && !this.useToggle) {
      expanded = true;
      silent = true;
    } else {
      expanded = expanded != null ? expanded : !this.expanded;
      if (this.expanded === expanded) {
        return this;
      }
    }
    this.expanded = expanded;
    this.refreshChildDisplay();
    (0, import_core6._setDisplayed)(this.eContainer, expanded);
    if (!silent) {
      this.dispatchLocalEvent({
        type: expanded ? "expanded" : "collapsed"
      });
    }
    return this;
  }
  addItems(items) {
    items.forEach((item) => this.addItem(item));
  }
  prependItem(item) {
    this.insertItem(item, true);
  }
  addItem(item) {
    this.insertItem(item, false);
  }
  insertItem(item, prepend) {
    const container = this.eContainer;
    const el = item instanceof import_core6.Component ? item.getGui() : item;
    el.classList.add("ag-group-item", `ag-${this.cssIdentifier}-group-item`);
    if (prepend) {
      container.insertAdjacentElement("afterbegin", el);
      this.items.unshift(el);
    } else {
      container.appendChild(el);
      this.items.push(el);
    }
  }
  hideItem(hide, index) {
    const itemToHide = this.items[index];
    (0, import_core6._setDisplayed)(itemToHide, !hide);
  }
  getItemIndex(item) {
    const el = item instanceof import_core6.Component ? item.getGui() : item;
    return this.items.indexOf(el);
  }
  setTitle(title) {
    this.eTitleBar?.setTitle(title);
    return this;
  }
  addTitleBarWidget(el) {
    this.eTitleBar?.addWidget(el);
    return this;
  }
  addCssClassToTitleBar(cssClass) {
    this.eTitleBar?.addCssClass(cssClass);
  }
  dispatchEnableChangeEvent(enabled) {
    const event = {
      type: "enableChange",
      enabled
    };
    this.dispatchLocalEvent(event);
  }
  setEnabled(enabled, skipToggle, skipExpand) {
    this.enabled = enabled;
    this.refreshDisabledStyles();
    if (!skipExpand) {
      this.toggleGroupExpand(enabled);
    }
    if (!skipToggle) {
      this.cbGroupEnabled.setValue(enabled);
      this.eToggle?.setValue(enabled);
    }
    return this;
  }
  isEnabled() {
    return this.enabled;
  }
  onEnableChange(callbackFn) {
    this.addManagedListeners(this, { enableChange: (event) => callbackFn(event.enabled) });
    return this;
  }
  onExpandedChange(callbackFn) {
    this.addManagedListeners(this, {
      expanded: () => callbackFn(true),
      collapsed: () => callbackFn(false)
    });
    return this;
  }
  hideEnabledCheckbox(hide) {
    this.suppressEnabledCheckbox = hide;
    this.refreshChildDisplay();
    this.refreshDisabledStyles();
    return this;
  }
  hideOpenCloseIcons(hide) {
    this.eTitleBar?.hideOpenCloseIcons(hide);
    return this;
  }
  refreshDisabledStyles() {
    const disabled = !this.enabled;
    this.eContainer.classList.toggle("ag-disabled", disabled);
    this.eTitleBar?.refreshDisabledStyles(this.suppressEnabledCheckbox && disabled);
    this.eContainer.classList.toggle("ag-disabled-group-container", disabled);
  }
  setupTitleBar() {
    const titleBar = this.useToggle ? this.createToggleTitleBar() : this.createDefaultTitleBar();
    this.eToolbar.insertAdjacentElement("beforebegin", titleBar.getGui());
  }
  createDefaultTitleBar() {
    const titleBar = this.createManagedBean(new DefaultTitleBar(this.params));
    this.eTitleBar = titleBar;
    titleBar.refreshOnExpand(this.expanded);
    this.addManagedListeners(titleBar, {
      expandedChanged: (event) => this.toggleGroupExpand(event.expanded)
    });
    return titleBar;
  }
  createToggleTitleBar() {
    const eToggle = this.createManagedBean(
      new import_core6.AgToggleButton({
        value: this.enabled,
        label: this.params.title,
        labelAlignment: "left",
        labelWidth: "flex",
        onValueChange: (enabled) => {
          this.setEnabled(enabled, true);
          this.dispatchEnableChangeEvent(enabled);
        }
      })
    );
    eToggle.addCssClass("ag-group-title-bar");
    eToggle.addCssClass(`ag-${this.params.cssIdentifier ?? "default"}-group-title-bar ag-unselectable`);
    this.eToggle = eToggle;
    this.toggleGroupExpand(this.enabled);
    return eToggle;
  }
};
var TITLE_BAR_DISABLED_CLASS = "ag-disabled-group-title-bar";
function getDefaultTitleBarTemplate(params) {
  const cssIdentifier = params.cssIdentifier ?? "default";
  const role = params.suppressKeyboardNavigation ? "presentation" : "role";
  return (
    /* html */
    `
        <div class="ag-group-title-bar ag-${cssIdentifier}-group-title-bar ag-unselectable" role="${role}">
            <span class="ag-group-title-bar-icon ag-${cssIdentifier}-group-title-bar-icon" data-ref="eGroupOpenedIcon" role="presentation"></span>
            <span class="ag-group-title-bar-icon ag-${cssIdentifier}-group-title-bar-icon" data-ref="eGroupClosedIcon" role="presentation"></span>
            <span data-ref="eTitle" class="ag-group-title ag-${cssIdentifier}-group-title"></span>
        </div>
    `
  );
}
var DefaultTitleBar = class extends import_core6.Component {
  constructor(params = {}) {
    super(getDefaultTitleBarTemplate(params));
    this.suppressOpenCloseIcons = false;
    this.suppressKeyboardNavigation = false;
    this.eGroupOpenedIcon = import_core6.RefPlaceholder;
    this.eGroupClosedIcon = import_core6.RefPlaceholder;
    this.eTitle = import_core6.RefPlaceholder;
    const { title, suppressOpenCloseIcons, suppressKeyboardNavigation } = params;
    if (!!title && title.length > 0) {
      this.title = title;
    }
    if (suppressOpenCloseIcons != null) {
      this.suppressOpenCloseIcons = suppressOpenCloseIcons;
    }
    this.suppressKeyboardNavigation = suppressKeyboardNavigation ?? false;
  }
  postConstruct() {
    this.setTitle(this.title);
    this.hideOpenCloseIcons(this.suppressOpenCloseIcons);
    this.setupExpandContract();
  }
  setupExpandContract() {
    this.eGroupClosedIcon.appendChild((0, import_core6._createIcon)("columnSelectClosed", this.gos, null));
    this.eGroupOpenedIcon.appendChild((0, import_core6._createIcon)("columnSelectOpen", this.gos, null));
    this.addManagedElementListeners(this.getGui(), {
      click: () => this.dispatchExpandChanged(),
      keydown: (e) => {
        switch (e.key) {
          case import_core6.KeyCode.ENTER:
          case import_core6.KeyCode.SPACE:
            e.preventDefault();
            this.dispatchExpandChanged();
            break;
          case import_core6.KeyCode.RIGHT:
          case import_core6.KeyCode.LEFT:
            e.preventDefault();
            this.dispatchExpandChanged(e.key === import_core6.KeyCode.RIGHT);
            break;
        }
      }
    });
  }
  refreshOnExpand(expanded) {
    this.refreshAriaStatus(expanded);
    this.refreshOpenCloseIcons(expanded);
  }
  refreshAriaStatus(expanded) {
    if (!this.suppressOpenCloseIcons) {
      (0, import_core6._setAriaExpanded)(this.getGui(), expanded);
    }
  }
  refreshOpenCloseIcons(expanded) {
    const showIcon = !this.suppressOpenCloseIcons;
    (0, import_core6._setDisplayed)(this.eGroupOpenedIcon, showIcon && expanded);
    (0, import_core6._setDisplayed)(this.eGroupClosedIcon, showIcon && !expanded);
  }
  isSuppressCollapse() {
    return this.suppressOpenCloseIcons;
  }
  dispatchExpandChanged(expanded) {
    const event = {
      type: "expandedChanged",
      expanded
    };
    this.dispatchLocalEvent(event);
  }
  setTitle(title) {
    const eGui = this.getGui();
    const hasTitle = !!title && title.length > 0;
    title = hasTitle ? title : void 0;
    this.eTitle.textContent = title ?? "";
    (0, import_core6._setDisplayed)(eGui, hasTitle);
    if (title !== this.title) {
      this.title = title;
    }
    const disabled = eGui.classList.contains(TITLE_BAR_DISABLED_CLASS);
    this.refreshDisabledStyles(disabled);
    return this;
  }
  addWidget(el) {
    this.getGui().appendChild(el);
    return this;
  }
  hideOpenCloseIcons(hide) {
    this.suppressOpenCloseIcons = hide;
    if (hide) {
      this.dispatchExpandChanged(true);
    }
    return this;
  }
  refreshDisabledStyles(disabled) {
    const eGui = this.getGui();
    if (disabled) {
      eGui.classList.add(TITLE_BAR_DISABLED_CLASS);
      eGui.removeAttribute("tabindex");
    } else {
      eGui.classList.remove(TITLE_BAR_DISABLED_CLASS);
      if (typeof this.title === "string" && !this.suppressKeyboardNavigation) {
        eGui.setAttribute("tabindex", "0");
      } else {
        eGui.removeAttribute("tabindex");
      }
    }
  }
};
var AgGroupComponentSelector = {
  selector: "AG-GROUP-COMPONENT",
  component: AgGroupComponent
};

// enterprise-modules/core/src/widgets/agRichSelect.ts
var import_core13 = require("@ag-grid-community/core");

// enterprise-modules/core/src/widgets/AgPillContainer.ts
var import_core9 = require("@ag-grid-community/core");

// enterprise-modules/core/src/widgets/agPill.ts
var import_core7 = require("@ag-grid-community/core");
var import_core8 = require("@ag-grid-community/core");
var AgPill = class extends import_core8.Component {
  constructor(config) {
    super(
      /* html */
      `
            <div class="ag-pill" role="option">
                <span class="ag-pill-text" data-ref="eText"></span>
                <span class="ag-button ag-pill-button" data-ref="eButton" role="presentation"></span>
            </div>
        `
    );
    this.config = config;
    this.eText = import_core7.RefPlaceholder;
    this.eButton = import_core7.RefPlaceholder;
  }
  postConstruct() {
    const { config, eButton } = this;
    const { onKeyDown, onButtonClick } = config;
    this.getGui().setAttribute("tabindex", String(this.gos.get("tabIndex")));
    this.addGuiEventListener("focus", () => {
      this.eButton.focus();
    });
    if (onKeyDown) {
      this.addGuiEventListener("keydown", onKeyDown);
    }
    if (onButtonClick) {
      this.addManagedElementListeners(eButton, {
        click: onButtonClick
      });
    }
  }
  toggleCloseButtonClass(className, force) {
    this.eButton.classList.toggle(className, force);
  }
  setText(text) {
    this.eText.textContent = text;
  }
  getText() {
    return this.eText.textContent;
  }
};

// enterprise-modules/core/src/widgets/AgPillContainer.ts
var AgPillContainer = class extends import_core9.Component {
  constructor() {
    super(
      /* html */
      `
            <div class="ag-pill-container" role="listbox"></div>
            `
    );
    this.pills = [];
  }
  wireBeans(beans) {
    this.focusService = beans.focusService;
  }
  init(params) {
    this.params = params;
    this.refresh();
  }
  refresh() {
    this.clearPills();
    const { params, onPillKeyDown } = this;
    const values = params.getValue();
    if (!Array.isArray(values)) {
      return;
    }
    const len = values.length;
    for (let i = 0; i < len; i++) {
      const value = values[i];
      const pill = this.createBean(
        new AgPill({
          onButtonClick: () => this.onPillButtonClick(pill),
          onKeyDown: onPillKeyDown.bind(this)
        })
      );
      const pillGui = pill.getGui();
      (0, import_core9._setAriaPosInSet)(pillGui, i + 1);
      (0, import_core9._setAriaSetSize)(pillGui, len);
      if (params.onPillMouseDown) {
        pill.addGuiEventListener("mousedown", params.onPillMouseDown);
      }
      if (params.announceItemFocus) {
        pill.addGuiEventListener("focus", params.announceItemFocus);
      }
      pill.setText(value);
      pill.toggleCloseButtonClass("ag-icon-cancel", true);
      this.appendChild(pillGui);
      this.pills.push(pill);
    }
  }
  onNavigationKeyDown(e) {
    const { key } = e;
    if (!this.pills.length || key !== import_core9.KeyCode.LEFT && key !== import_core9.KeyCode.RIGHT) {
      return;
    }
    e.preventDefault();
    const activeEl = this.gos.getActiveDomElement();
    const eGui = this.getGui();
    const { params, focusService } = this;
    if (eGui.contains(activeEl)) {
      const nextFocusableEl = focusService.findNextFocusableElement(eGui, false, key === import_core9.KeyCode.LEFT);
      if (nextFocusableEl) {
        nextFocusableEl.focus();
      } else if (params.eWrapper) {
        params.eWrapper.focus();
      }
    } else {
      const focusableElements = focusService.findFocusableElements(eGui);
      if (focusableElements.length > 0) {
        focusableElements[key === import_core9.KeyCode.RIGHT ? 0 : focusableElements.length - 1].focus();
      }
    }
  }
  clearPills() {
    const eGui = this.getGui();
    if (eGui.contains(this.gos.getActiveDomElement()) && this.params.eWrapper) {
      this.params.eWrapper.focus();
    }
    (0, import_core9._clearElement)(eGui);
    this.destroyBeans(this.pills);
    this.pills = [];
  }
  onPillButtonClick(pill) {
    this.deletePill(pill);
  }
  onPillKeyDown(e) {
    const key = e.key;
    if (key !== import_core9.KeyCode.DELETE && key !== import_core9.KeyCode.BACKSPACE) {
      return;
    }
    e.preventDefault();
    const eDoc = this.gos.getDocument();
    const pillIndex = this.pills.findIndex((pill2) => pill2.getGui().contains(eDoc.activeElement));
    if (pillIndex === -1) {
      return;
    }
    const pill = this.pills[pillIndex];
    if (pill) {
      this.deletePill(pill, pillIndex);
    }
  }
  deletePill(pill, restoreFocusToIndex) {
    const value = pill.getText();
    const values = (this.params.getValue() || []).filter((val) => val !== value);
    this.params.setValue(values);
    if (!values.length && this.params.eWrapper) {
      this.params.eWrapper.focus();
    } else if (restoreFocusToIndex != null) {
      const pill2 = this.pills[Math.min(restoreFocusToIndex, this.pills.length - 1)];
      if (pill2) {
        pill2.getFocusableElement().focus();
      }
    }
  }
  destroy() {
    this.clearPills();
    super.destroy();
  }
};

// enterprise-modules/core/src/widgets/agRichSelectList.ts
var import_core12 = require("@ag-grid-community/core");

// enterprise-modules/core/src/widgets/agRichSelectRow.ts
var import_core10 = require("@ag-grid-community/core");
var RichSelectRow = class extends import_core10.Component {
  constructor(params) {
    super(
      /* html */
      `<div class="ag-rich-select-row" role="presentation"></div>`
    );
    this.params = params;
  }
  wireBeans(beans) {
    this.userComponentFactory = beans.userComponentFactory;
  }
  setState(value) {
    let formattedValue = "";
    const { params } = this;
    if (params.valueFormatter) {
      formattedValue = params.valueFormatter(value);
    }
    const rendererSuccessful = this.populateWithRenderer(value, formattedValue);
    if (!rendererSuccessful) {
      this.populateWithoutRenderer(value, formattedValue);
    }
    this.value = value;
  }
  highlightString(matchString) {
    const { parsedValue } = this;
    if (this.params.cellRenderer || !(0, import_core10._exists)(parsedValue)) {
      return;
    }
    let hasMatch = (0, import_core10._exists)(matchString);
    if (hasMatch) {
      const index = parsedValue?.toLocaleLowerCase().indexOf(matchString.toLocaleLowerCase());
      if (index >= 0) {
        const highlightEndIndex = index + matchString.length;
        const startPart = (0, import_core10._escapeString)(parsedValue.slice(0, index), true);
        const highlightedPart = (0, import_core10._escapeString)(parsedValue.slice(index, highlightEndIndex), true);
        const endPart = (0, import_core10._escapeString)(parsedValue.slice(highlightEndIndex));
        this.renderValueWithoutRenderer(
          /* html */
          `${startPart}<span class="ag-rich-select-row-text-highlight">${highlightedPart}</span>${endPart}`
        );
      } else {
        hasMatch = false;
      }
    }
    if (!hasMatch) {
      this.renderValueWithoutRenderer(parsedValue);
    }
  }
  updateSelected(selected) {
    const eGui = this.getGui();
    (0, import_core10._setAriaSelected)(eGui.parentElement, selected);
    this.addOrRemoveCssClass("ag-rich-select-row-selected", selected);
  }
  getValue() {
    return this.value;
  }
  toggleHighlighted(highlighted) {
    this.addOrRemoveCssClass("ag-rich-select-row-highlighted", highlighted);
  }
  populateWithoutRenderer(value, valueFormatted) {
    const eDocument = this.gos.getDocument();
    const eGui = this.getGui();
    const span = eDocument.createElement("span");
    span.style.overflow = "hidden";
    span.style.textOverflow = "ellipsis";
    const parsedValue = (0, import_core10._escapeString)((0, import_core10._exists)(valueFormatted) ? valueFormatted : value, true);
    this.parsedValue = (0, import_core10._exists)(parsedValue) ? parsedValue : null;
    eGui.appendChild(span);
    this.renderValueWithoutRenderer(parsedValue);
    this.setTooltip({
      newTooltipText: this.parsedValue,
      shouldDisplayTooltip: () => span.scrollWidth > span.clientWidth
    });
  }
  renderValueWithoutRenderer(value) {
    const span = this.getGui().querySelector("span");
    if (!span) {
      return;
    }
    span.innerHTML = (0, import_core10._exists)(value) ? value : "&nbsp;";
  }
  populateWithRenderer(value, valueFormatted) {
    let cellRendererPromise;
    let userCompDetails;
    if (this.params.cellRenderer) {
      const richSelect = this.getParentComponent()?.getParentComponent();
      userCompDetails = this.userComponentFactory.getEditorRendererDetails(this.params, {
        value,
        valueFormatted,
        getValue: () => richSelect?.getValue(),
        setValue: (value2) => {
          richSelect?.setValue(value2, true);
        },
        setTooltip: (value2, shouldDisplayTooltip) => {
          this.setTooltip({ newTooltipText: value2, shouldDisplayTooltip });
        }
      });
    }
    if (userCompDetails) {
      cellRendererPromise = userCompDetails.newAgStackInstance();
    }
    if (cellRendererPromise) {
      (0, import_core10._bindCellRendererToHtmlElement)(cellRendererPromise, this.getGui());
    }
    if (cellRendererPromise) {
      cellRendererPromise.then((childComponent) => {
        this.addDestroyFunc(() => {
          this.destroyBean(childComponent);
        });
      });
      return true;
    }
    return false;
  }
};

// enterprise-modules/core/src/widgets/virtualList.ts
var import_core11 = require("@ag-grid-community/core");
function getVirtualListTemplate(cssIdentifier) {
  return (
    /* html */
    `<div class="ag-virtual-list-viewport ag-${cssIdentifier}-virtual-list-viewport" role="presentation">
            <div class="ag-virtual-list-container ag-${cssIdentifier}-virtual-list-container" data-ref="eContainer"></div>
        </div>`
  );
}
var VirtualList = class extends import_core11.TabGuardComp {
  constructor(params) {
    super(getVirtualListTemplate(params?.cssIdentifier || "default"));
    this.renderedRows = /* @__PURE__ */ new Map();
    this.rowHeight = 20;
    this.pageSize = -1;
    this.isScrolling = false;
    this.isHeightFromTheme = true;
    this.eContainer = import_core11.RefPlaceholder;
    const { cssIdentifier = "default", ariaRole = "listbox", listName } = params || {};
    this.cssIdentifier = cssIdentifier;
    this.ariaRole = ariaRole;
    this.listName = listName;
  }
  wireBeans(beans) {
    this.resizeObserverService = beans.resizeObserverService;
    this.animationFrameService = beans.animationFrameService;
    this.environment = beans.environment;
  }
  postConstruct() {
    this.addScrollListener();
    this.rowHeight = this.getItemHeight();
    this.addResizeObserver();
    this.initialiseTabGuard({
      onFocusIn: (e) => this.onFocusIn(e),
      onFocusOut: (e) => this.onFocusOut(e),
      focusInnerElement: (fromBottom) => this.focusInnerElement(fromBottom),
      onTabKeyDown: (e) => this.onTabKeyDown(e),
      handleKeyDown: (e) => this.handleKeyDown(e)
    });
    this.setAriaProperties();
    this.addManagedEventListeners({ gridStylesChanged: this.onGridStylesChanged.bind(this) });
  }
  onGridStylesChanged(e) {
    if (e.listItemHeightChanged) {
      this.rowHeight = this.getItemHeight();
      this.refresh();
    }
  }
  setAriaProperties() {
    const translate = this.localeService.getLocaleTextFunc();
    const listName = translate("ariaDefaultListName", this.listName || "List");
    const ariaEl = this.eContainer;
    (0, import_core11._setAriaRole)(ariaEl, this.ariaRole);
    (0, import_core11._setAriaLabel)(ariaEl, listName);
  }
  addResizeObserver() {
    const listener = () => this.animationFrameService.requestAnimationFrame(() => this.drawVirtualRows());
    const destroyObserver = this.resizeObserverService.observeResize(this.getGui(), listener);
    this.addDestroyFunc(destroyObserver);
  }
  focusInnerElement(fromBottom) {
    this.focusRow(fromBottom ? this.model.getRowCount() - 1 : 0);
  }
  onFocusIn(e) {
    const target = e.target;
    if (target.classList.contains("ag-virtual-list-item")) {
      this.lastFocusedRowIndex = (0, import_core11._getAriaPosInSet)(target) - 1;
    }
  }
  onFocusOut(e) {
    if (!this.getFocusableElement().contains(e.relatedTarget)) {
      this.lastFocusedRowIndex = null;
    }
  }
  handleKeyDown(e) {
    switch (e.key) {
      case import_core11.KeyCode.UP:
      case import_core11.KeyCode.DOWN:
        if (this.navigate(e.key === import_core11.KeyCode.UP)) {
          e.preventDefault();
        }
        break;
      case import_core11.KeyCode.PAGE_HOME:
      case import_core11.KeyCode.PAGE_END:
      case import_core11.KeyCode.PAGE_UP:
      case import_core11.KeyCode.PAGE_DOWN:
        if (this.navigateToPage(e.key) !== null) {
          e.preventDefault();
        }
        break;
    }
  }
  onTabKeyDown(e) {
    (0, import_core11._stopPropagationForAgGrid)(e);
    this.forceFocusOutOfContainer(e.shiftKey);
  }
  navigate(up) {
    if (this.lastFocusedRowIndex == null) {
      return false;
    }
    const nextRow = this.lastFocusedRowIndex + (up ? -1 : 1);
    if (nextRow < 0 || nextRow >= this.model.getRowCount()) {
      return false;
    }
    this.focusRow(nextRow);
    return true;
  }
  navigateToPage(key, fromItem = "focused") {
    let hasFocus = false;
    if (fromItem === "focused") {
      fromItem = this.getLastFocusedRow();
      hasFocus = true;
    }
    const rowCount = this.model.getRowCount() - 1;
    let newIndex = -1;
    if (key === import_core11.KeyCode.PAGE_HOME) {
      newIndex = 0;
    } else if (key === import_core11.KeyCode.PAGE_END) {
      newIndex = rowCount;
    } else if (key === import_core11.KeyCode.PAGE_DOWN) {
      newIndex = Math.min(fromItem + this.pageSize, rowCount);
    } else if (key === import_core11.KeyCode.PAGE_UP) {
      newIndex = Math.max(fromItem - this.pageSize, 0);
    }
    if (newIndex === -1) {
      return null;
    }
    if (hasFocus) {
      this.focusRow(newIndex);
    } else {
      this.ensureIndexVisible(newIndex);
    }
    return newIndex;
  }
  getLastFocusedRow() {
    return this.lastFocusedRowIndex;
  }
  focusRow(rowNumber) {
    if (this.isScrolling) {
      return;
    }
    this.isScrolling = true;
    this.ensureIndexVisible(rowNumber);
    this.animationFrameService.requestAnimationFrame(() => {
      this.isScrolling = false;
      if (!this.isAlive()) {
        return;
      }
      const renderedRow = this.renderedRows.get(rowNumber);
      if (renderedRow) {
        renderedRow.eDiv.focus();
      }
    });
  }
  getComponentAt(rowIndex) {
    const comp = this.renderedRows.get(rowIndex);
    return comp && comp.rowComponent;
  }
  forEachRenderedRow(func) {
    this.renderedRows.forEach((value, key) => func(value.rowComponent, key));
  }
  getItemHeight() {
    if (!this.isHeightFromTheme) {
      return this.rowHeight;
    }
    return this.environment.getDefaultListItemHeight();
  }
  /**
   * Returns true if the view had to be scrolled, otherwise, false.
   */
  ensureIndexVisible(index, scrollPartialIntoView = true) {
    const lastRow = this.model.getRowCount();
    if (typeof index !== "number" || index < 0 || index >= lastRow) {
      (0, import_core11._warnOnce)("invalid row index for ensureIndexVisible: ", index);
      return false;
    }
    const rowTopPixel = index * this.rowHeight;
    const rowBottomPixel = rowTopPixel + this.rowHeight;
    const eGui = this.getGui();
    const viewportTopPixel = eGui.scrollTop;
    const viewportHeight = eGui.offsetHeight;
    const viewportBottomPixel = viewportTopPixel + viewportHeight;
    const diff = scrollPartialIntoView ? 0 : this.rowHeight;
    const viewportScrolledPastRow = viewportTopPixel > rowTopPixel + diff;
    const viewportScrolledBeforeRow = viewportBottomPixel < rowBottomPixel - diff;
    if (viewportScrolledPastRow) {
      eGui.scrollTop = rowTopPixel;
      return true;
    }
    if (viewportScrolledBeforeRow) {
      const newScrollPosition = rowBottomPixel - viewportHeight;
      eGui.scrollTop = newScrollPosition;
      return true;
    }
    return false;
  }
  setComponentCreator(componentCreator) {
    this.componentCreator = componentCreator;
  }
  setComponentUpdater(componentUpdater) {
    this.componentUpdater = componentUpdater;
  }
  getRowHeight() {
    return this.rowHeight;
  }
  getScrollTop() {
    return this.getGui().scrollTop;
  }
  setRowHeight(rowHeight) {
    this.isHeightFromTheme = false;
    this.rowHeight = rowHeight;
    this.refresh();
  }
  refresh(softRefresh) {
    if (this.model == null || !this.isAlive()) {
      return;
    }
    const rowCount = this.model.getRowCount();
    this.eContainer.style.height = `${rowCount * this.rowHeight}px`;
    (0, import_core11._waitUntil)(
      () => this.eContainer.clientHeight >= rowCount * this.rowHeight,
      () => {
        if (!this.isAlive()) {
          return;
        }
        if (this.canSoftRefresh(softRefresh)) {
          this.drawVirtualRows(true);
        } else {
          this.clearVirtualRows();
          this.drawVirtualRows();
        }
      }
    );
  }
  canSoftRefresh(softRefresh) {
    return !!(softRefresh && this.renderedRows.size && typeof this.model.areRowsEqual === "function" && this.componentUpdater);
  }
  clearVirtualRows() {
    this.renderedRows.forEach((_, rowIndex) => this.removeRow(rowIndex));
  }
  drawVirtualRows(softRefresh) {
    if (!this.isAlive() || !this.model) {
      return;
    }
    const gui = this.getGui();
    const topPixel = gui.scrollTop;
    const bottomPixel = topPixel + gui.offsetHeight;
    const firstRow = Math.floor(topPixel / this.rowHeight);
    const lastRow = Math.floor(bottomPixel / this.rowHeight);
    this.pageSize = Math.floor((bottomPixel - topPixel) / this.rowHeight);
    this.ensureRowsRendered(firstRow, lastRow, softRefresh);
  }
  ensureRowsRendered(start, finish, softRefresh) {
    this.renderedRows.forEach((_, rowIndex) => {
      if ((rowIndex < start || rowIndex > finish) && rowIndex !== this.lastFocusedRowIndex) {
        this.removeRow(rowIndex);
      }
    });
    if (softRefresh) {
      this.refreshRows();
    }
    for (let rowIndex = start; rowIndex <= finish; rowIndex++) {
      if (this.renderedRows.has(rowIndex)) {
        continue;
      }
      if (rowIndex < this.model.getRowCount()) {
        this.insertRow(rowIndex);
      }
    }
  }
  insertRow(rowIndex) {
    const value = this.model.getRow(rowIndex);
    const eDiv = document.createElement("div");
    eDiv.classList.add("ag-virtual-list-item", `ag-${this.cssIdentifier}-virtual-list-item`);
    (0, import_core11._setAriaRole)(eDiv, this.ariaRole === "tree" ? "treeitem" : "option");
    (0, import_core11._setAriaSetSize)(eDiv, this.model.getRowCount());
    (0, import_core11._setAriaPosInSet)(eDiv, rowIndex + 1);
    eDiv.setAttribute("tabindex", "-1");
    eDiv.style.height = `${this.rowHeight}px`;
    eDiv.style.top = `${this.rowHeight * rowIndex}px`;
    const rowComponent = this.componentCreator(value, eDiv);
    rowComponent.addGuiEventListener("focusin", () => this.lastFocusedRowIndex = rowIndex);
    eDiv.appendChild(rowComponent.getGui());
    if (this.renderedRows.has(rowIndex - 1)) {
      this.renderedRows.get(rowIndex - 1).eDiv.insertAdjacentElement("afterend", eDiv);
    } else if (this.renderedRows.has(rowIndex + 1)) {
      this.renderedRows.get(rowIndex + 1).eDiv.insertAdjacentElement("beforebegin", eDiv);
    } else {
      this.eContainer.appendChild(eDiv);
    }
    this.renderedRows.set(rowIndex, { rowComponent, eDiv, value });
  }
  removeRow(rowIndex) {
    const component = this.renderedRows.get(rowIndex);
    this.eContainer.removeChild(component.eDiv);
    this.destroyBean(component.rowComponent);
    this.renderedRows.delete(rowIndex);
  }
  refreshRows() {
    const rowCount = this.model.getRowCount();
    this.renderedRows.forEach((row, rowIndex) => {
      if (rowIndex >= rowCount) {
        this.removeRow(rowIndex);
      } else {
        const newValue = this.model.getRow(rowIndex);
        if (this.model.areRowsEqual?.(row.value, newValue)) {
          this.componentUpdater(newValue, row.rowComponent);
        } else {
          this.removeRow(rowIndex);
        }
      }
    });
  }
  addScrollListener() {
    this.addGuiEventListener("scroll", () => this.drawVirtualRows(), { passive: true });
  }
  setModel(model) {
    this.model = model;
  }
  getAriaElement() {
    return this.eContainer;
  }
  destroy() {
    if (!this.isAlive()) {
      return;
    }
    this.clearVirtualRows();
    super.destroy();
  }
};

// enterprise-modules/core/src/widgets/agRichSelectList.ts
var LIST_COMPONENT_NAME = "ag-rich-select-list";
var ROW_COMPONENT_NAME = "ag-rich-select-row";
var AgRichSelectList = class extends VirtualList {
  constructor(params, richSelectWrapper, getSearchString) {
    super({ cssIdentifier: "rich-select" });
    this.params = params;
    this.richSelectWrapper = richSelectWrapper;
    this.getSearchString = getSearchString;
    this.lastRowHovered = -1;
    this.selectedItems = /* @__PURE__ */ new Set();
    this.params = params;
    this.setComponentCreator(this.createRowComponent.bind(this));
    this.setComponentUpdater(() => {
    });
  }
  postConstruct() {
    super.postConstruct();
    this.createLoadingElement();
    const { cellRowHeight, pickerAriaLabelKey, pickerAriaLabelValue } = this.params;
    if (cellRowHeight) {
      this.setRowHeight(cellRowHeight);
    }
    const eGui = this.getGui();
    const eListAriaEl = this.getAriaElement();
    this.addManagedListeners(eGui, {
      mousemove: this.onMouseMove.bind(this),
      mouseout: this.onMouseOut.bind(this),
      mousedown: this.onMouseDown.bind(this),
      click: this.onClick.bind(this)
    });
    eGui.classList.add(LIST_COMPONENT_NAME);
    const listId = `${LIST_COMPONENT_NAME}-${this.getCompId()}`;
    eListAriaEl.setAttribute("id", listId);
    const translate = this.localeService.getLocaleTextFunc();
    const ariaLabel = translate(pickerAriaLabelKey, pickerAriaLabelValue);
    (0, import_core12._setAriaLabel)(eListAriaEl, ariaLabel);
    (0, import_core12._setAriaControls)(this.richSelectWrapper, eListAriaEl);
  }
  navigateToPage(key) {
    const newIndex = super.navigateToPage(key, this.lastRowHovered);
    if (newIndex != null) {
      this.animationFrameService.requestAnimationFrame(() => {
        if (!this.isAlive()) {
          return null;
        }
        this.highlightIndex(newIndex);
      });
    }
    return newIndex;
  }
  drawVirtualRows(softRefresh) {
    super.drawVirtualRows(softRefresh);
    this.refreshSelectedItems();
  }
  highlightFilterMatch(searchString) {
    this.forEachRenderedRow((cmp) => {
      cmp.highlightString(searchString);
    });
  }
  onNavigationKeyDown(key, announceItem) {
    this.animationFrameService.requestAnimationFrame(() => {
      if (!this.currentList || !this.isAlive()) {
        return;
      }
      const len = this.currentList.length;
      const oldIndex = this.lastRowHovered;
      const diff = key === import_core12.KeyCode.DOWN ? 1 : -1;
      const newIndex = Math.min(Math.max(oldIndex === -1 ? 0 : oldIndex + diff, 0), len - 1);
      this.highlightIndex(newIndex);
      announceItem();
    });
  }
  selectValue(value) {
    if (!this.currentList) {
      if (this.eLoading) {
        this.appendChild(this.eLoading);
      }
      return;
    }
    if (this.eLoading?.offsetParent) {
      this.eLoading.parentElement?.removeChild(this.eLoading);
    }
    if (value == null) {
      return;
    }
    const selectedPositions = this.getIndicesForValues(value);
    const len = selectedPositions.length;
    if (len > 0) {
      this.refresh();
      this.ensureIndexVisible(selectedPositions[0]);
      this.refresh(true);
    }
    this.selectListItems(Array.isArray(value) ? value : [value]);
  }
  selectListItems(values, append = false) {
    if (!append) {
      this.selectedItems.clear();
    }
    for (let i = 0; i < values.length; i++) {
      const currentItem = values[i];
      if (this.selectedItems.has(currentItem)) {
        continue;
      }
      this.selectedItems.add(currentItem);
    }
    this.refreshSelectedItems();
  }
  getCurrentList() {
    return this.currentList;
  }
  setCurrentList(list) {
    this.currentList = list;
    this.setModel({
      getRowCount: () => list.length,
      getRow: (index) => list[index],
      areRowsEqual: (oldRow, newRow) => oldRow === newRow
    });
  }
  getSelectedItems() {
    return this.selectedItems;
  }
  getLastItemHovered() {
    return this.currentList[this.lastRowHovered];
  }
  highlightIndex(index, preventUnnecessaryScroll) {
    if (!this.currentList) {
      return;
    }
    if (index < 0 || index >= this.currentList.length) {
      this.lastRowHovered = -1;
    } else {
      this.lastRowHovered = index;
      const wasScrolled = this.ensureIndexVisible(index, !preventUnnecessaryScroll);
      if (wasScrolled && !preventUnnecessaryScroll) {
        this.refresh(true);
      }
    }
    this.forEachRenderedRow((cmp, idx) => {
      const highlighted = index === idx;
      cmp.toggleHighlighted(highlighted);
      if (highlighted) {
        const idForParent = `${ROW_COMPONENT_NAME}-${cmp.getCompId()}`;
        (0, import_core12._setAriaActiveDescendant)(this.richSelectWrapper, idForParent);
        this.richSelectWrapper.setAttribute("data-active-option", idForParent);
      }
    });
  }
  getIndicesForValues(values) {
    const { currentList } = this;
    if (!currentList || currentList.length === 0 || values == null) {
      return [];
    }
    if (!Array.isArray(values)) {
      values = [values];
    }
    if (values.length === 0) {
      return [];
    }
    const positions = [];
    for (let i = 0; i < values.length; i++) {
      const idx = currentList.indexOf(values[i]);
      if (idx >= 0) {
        positions.push(idx);
      }
    }
    return positions;
  }
  toggleListItemSelection(value) {
    if (this.selectedItems.has(value)) {
      this.selectedItems.delete(value);
    } else {
      this.selectedItems.add(value);
    }
    this.refreshSelectedItems();
    this.dispatchValueSelected();
  }
  refreshSelectedItems() {
    this.forEachRenderedRow((cmp) => {
      const selected = this.selectedItems.has(cmp.getValue());
      cmp.updateSelected(selected);
    });
  }
  createLoadingElement() {
    const eDocument = this.gos.getDocument();
    const translate = this.localeService.getLocaleTextFunc();
    const el = eDocument.createElement("div");
    el.classList.add("ag-loading-text");
    el.innerText = translate("loadingOoo", "Loading...");
    this.eLoading = el;
  }
  createRowComponent(value, listItemElement) {
    const row = new RichSelectRow(this.params);
    listItemElement.setAttribute("id", `${ROW_COMPONENT_NAME}-${row.getCompId()}`);
    row.setParentComponent(this);
    this.createBean(row);
    row.setState(value);
    const { highlightMatch, searchType = "fuzzy" } = this.params;
    if (highlightMatch && searchType !== "fuzzy") {
      row.highlightString(this.getSearchString());
    }
    return row;
  }
  getRowForMouseEvent(e) {
    const eGui = this.getGui();
    const rect = eGui.getBoundingClientRect();
    const scrollTop = this.getScrollTop();
    const mouseY = e.clientY - rect.top + scrollTop;
    return Math.floor(mouseY / this.getRowHeight());
  }
  onMouseMove(e) {
    const row = this.getRowForMouseEvent(e);
    if (row !== -1 && row != this.lastRowHovered) {
      this.lastRowHovered = row;
      this.highlightIndex(row, true);
    }
  }
  onMouseDown(e) {
    e.preventDefault();
  }
  onMouseOut(e) {
    if (!this.getGui().contains(e.relatedTarget)) {
      this.highlightIndex(-1);
    }
  }
  onClick(e) {
    const { multiSelect } = this.params;
    if (!this.currentList) {
      return;
    }
    const row = this.getRowForMouseEvent(e);
    const item = this.currentList[row];
    if (multiSelect) {
      this.toggleListItemSelection(item);
    } else {
      this.selectListItems([item]);
      this.dispatchValueSelected();
    }
  }
  dispatchValueSelected() {
    const event = {
      type: "richSelectListRowSelected",
      fromEnterKey: false,
      value: this.selectedItems
    };
    this.dispatchLocalEvent(event);
  }
  destroy() {
    super.destroy();
    this.eLoading = void 0;
  }
};

// enterprise-modules/core/src/widgets/agRichSelect.ts
var AgRichSelect = class extends import_core13.AgPickerField {
  constructor(config) {
    super({
      pickerAriaLabelKey: "ariaLabelRichSelectField",
      pickerAriaLabelValue: "Rich Select Field",
      pickerType: "ag-list",
      className: "ag-rich-select",
      pickerIcon: "smallDown",
      ariaRole: "combobox",
      template: config?.template ?? /* html */
      `
            <div class="ag-picker-field" role="presentation">
                <div data-ref="eLabel"></div>
                <div data-ref="eWrapper" class="ag-wrapper ag-picker-field-wrapper ag-rich-select-value ag-picker-collapsed">
                    <span data-ref="eDisplayField" class="ag-picker-field-display"></span>
                    <ag-input-text-field data-ref="eInput" class="ag-rich-select-field-input"></ag-input-text-field>
                    <span data-ref="eDeselect" class="ag-rich-select-deselect-button ag-picker-field-icon" role="presentation"></span>
                    <span data-ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></span>
                </div>
            </div>`,
      agComponents: [import_core13.AgInputTextFieldSelector],
      modalPicker: false,
      ...config,
      // maxPickerHeight needs to be set after expanding `config`
      maxPickerHeight: config?.maxPickerHeight ?? "calc(var(--ag-row-height) * 6.5)"
    });
    this.searchString = "";
    this.searchStringCreator = null;
    this.eInput = import_core13.RefPlaceholder;
    this.eDeselect = import_core13.RefPlaceholder;
    this.skipWrapperAnnouncement = false;
    const { value, valueList, searchStringCreator } = config || {};
    if (value !== void 0) {
      this.value = value;
    }
    if (valueList != null) {
      this.values = valueList;
    }
    if (searchStringCreator) {
      this.searchStringCreator = searchStringCreator;
    }
  }
  wireBeans(beans) {
    super.wireBeans(beans);
    this.userComponentFactory = beans.userComponentFactory;
    this.ariaAnnouncementService = beans.ariaAnnouncementService;
  }
  postConstruct() {
    super.postConstruct();
    this.createListComponent();
    this.eDeselect.appendChild((0, import_core13._createIconNoSpan)("cancel", this.gos));
    const { allowTyping, placeholder, suppressDeselectAll } = this.config;
    this.eDeselect.classList.add("ag-hidden");
    if (allowTyping) {
      this.eInput.setAutoComplete(false).setInputPlaceholder(placeholder);
      this.eDisplayField.classList.add("ag-hidden");
    } else {
      this.eInput.setDisplayed(false);
    }
    this.setupAriaProperties();
    const { searchDebounceDelay = 300 } = this.config;
    this.clearSearchString = (0, import_core13._debounce)(this.clearSearchString, searchDebounceDelay);
    this.renderSelectedValue();
    if (allowTyping) {
      this.eInput.onValueChange((value) => this.searchTextFromString(value));
    }
    this.addManagedElementListeners(this.eWrapper, { focus: this.onWrapperFocus.bind(this) });
    this.addManagedElementListeners(this.eWrapper, { focusout: this.onWrapperFocusOut.bind(this) });
    if (!suppressDeselectAll) {
      this.addManagedElementListeners(this.eDeselect, {
        mousedown: this.onDeselectAllMouseDown.bind(this),
        click: this.onDeselectAllClick.bind(this)
      });
    }
  }
  setupAriaProperties() {
    const { eWrapper, gos, localeService } = this;
    eWrapper.tabIndex = gos.get("tabIndex");
    const translate = localeService.getLocaleTextFunc();
    this.ariaDeleteSelection = translate("ariaLabelRichSelectDeleteSelection", "Press DELETE to deselect item");
    this.ariaDeselectAllItems = translate(
      "ariaLabelRichSelectDeselectAllItems",
      "Press DELETE to deselect all items"
    );
    this.ariaToggleSelection = translate("ariaLabelRichSelectToggleSelection", "Press SPACE to toggle selection");
  }
  createListComponent() {
    this.listComponent = this.createBean(new AgRichSelectList(this.config, this.eWrapper, () => this.searchString));
    this.listComponent.setParentComponent(this);
    this.addManagedListeners(this.listComponent, {
      richSelectListRowSelected: (e) => {
        this.onListValueSelected(e.value, e.fromEnterKey);
      }
    });
  }
  renderSelectedValue() {
    const { value, eDisplayField, config } = this;
    const {
      allowTyping,
      cellRenderer,
      initialInputValue,
      multiSelect,
      suppressDeselectAll,
      suppressMultiSelectPillRenderer
    } = config;
    const valueFormatted = this.config.valueFormatter ? this.config.valueFormatter(value) : value;
    if (allowTyping) {
      this.eInput.setValue(initialInputValue ?? valueFormatted);
      return;
    }
    if (multiSelect && !suppressDeselectAll) {
      const isEmpty = value == null || Array.isArray(value) && value.length === 0;
      this.eDeselect.classList.toggle("ag-hidden", isEmpty);
    }
    let userCompDetails;
    if (multiSelect && !suppressMultiSelectPillRenderer) {
      this.createOrUpdatePillContainer(eDisplayField);
      return;
    }
    if (cellRenderer) {
      userCompDetails = this.userComponentFactory.getEditorRendererDetails(config, {
        value,
        valueFormatted,
        getValue: () => this.getValue(),
        setValue: (value2) => {
          this.setValue(value2, true);
        },
        setTooltip: (value2, shouldDisplayTooltip) => {
          this.setTooltip({ newTooltipText: value2, shouldDisplayTooltip });
        }
      });
    }
    let userCompDetailsPromise;
    if (userCompDetails) {
      userCompDetailsPromise = userCompDetails.newAgStackInstance();
    }
    if (userCompDetailsPromise) {
      (0, import_core13._clearElement)(eDisplayField);
      (0, import_core13._bindCellRendererToHtmlElement)(userCompDetailsPromise, eDisplayField);
      userCompDetailsPromise.then((renderer) => {
        this.addDestroyFunc(() => this.destroyBean(renderer));
      });
    } else {
      if ((0, import_core13._exists)(this.value)) {
        eDisplayField.innerText = valueFormatted;
        eDisplayField.classList.remove("ag-display-as-placeholder");
      } else {
        const { placeholder } = config;
        if ((0, import_core13._exists)(placeholder)) {
          eDisplayField.innerHTML = `${(0, import_core13._escapeString)(placeholder)}`;
          eDisplayField.classList.add("ag-display-as-placeholder");
        } else {
          (0, import_core13._clearElement)(eDisplayField);
        }
      }
      this.setTooltip({
        newTooltipText: valueFormatted ?? null,
        shouldDisplayTooltip: () => this.eDisplayField.scrollWidth > this.eDisplayField.clientWidth
      });
    }
  }
  createPickerComponent() {
    const { values } = this;
    if (values) {
      this.setValueList({ valueList: values });
    }
    return this.listComponent;
  }
  setSearchStringCreator(searchStringFn) {
    this.searchStringCreator = searchStringFn;
  }
  setValueList(params) {
    const { valueList, refresh } = params;
    if (!this.listComponent || this.listComponent.getCurrentList() === valueList) {
      return;
    }
    this.listComponent.setCurrentList(valueList);
    if (refresh) {
      if (!this.values) {
        this.values = valueList;
        if (this.isPickerDisplayed) {
          this.listComponent.selectValue(this.value);
        }
      } else {
        this.listComponent.refresh(true);
      }
    }
  }
  showPicker() {
    super.showPicker();
    const { listComponent, value } = this;
    if (!listComponent) {
      return;
    }
    let idx = null;
    if (this.value != null) {
      listComponent.selectValue(this.value);
      idx = listComponent.getIndicesForValues(Array.isArray(value) ? value : [value])[0];
    }
    if (idx != null) {
      listComponent.highlightIndex(idx);
    } else {
      listComponent.refresh();
    }
    this.displayOrHidePicker();
  }
  beforeHidePicker() {
    super.beforeHidePicker();
  }
  createOrUpdatePillContainer(container) {
    if (!this.pillContainer) {
      const pillContainer = this.pillContainer = this.createBean(new AgPillContainer());
      this.addDestroyFunc(() => {
        this.destroyBean(this.pillContainer);
        this.pillContainer = null;
      });
      (0, import_core13._clearElement)(container);
      container.appendChild(pillContainer.getGui());
      pillContainer.init({
        eWrapper: this.eWrapper,
        onPillMouseDown: (e) => {
          e.stopImmediatePropagation();
        },
        announceItemFocus: () => {
          this.ariaAnnouncementService.announceValue(this.ariaDeleteSelection);
        },
        getValue: () => this.getValue(),
        setValue: (value) => this.setValue(value, true)
      });
    }
    this.doWhileBlockingAnnouncement(() => this.pillContainer?.refresh());
  }
  doWhileBlockingAnnouncement(func) {
    this.skipWrapperAnnouncement = true;
    func();
    this.skipWrapperAnnouncement = false;
  }
  onWrapperFocus() {
    const { eInput, config } = this;
    const { allowTyping, multiSelect, suppressDeselectAll } = config;
    if (allowTyping) {
      const focusableEl = eInput.getFocusableElement();
      focusableEl.focus();
      focusableEl.select();
    } else if (multiSelect && !suppressDeselectAll && !this.skipWrapperAnnouncement) {
      this.ariaAnnouncementService.announceValue(this.ariaDeselectAllItems);
    }
  }
  onWrapperFocusOut(e) {
    if (!this.eWrapper.contains(e.relatedTarget)) {
      this.hidePicker();
    }
  }
  onDeselectAllMouseDown(e) {
    e.stopImmediatePropagation();
  }
  onDeselectAllClick() {
    this.setValue([], true);
  }
  buildSearchStringFromKeyboardEvent(searchKey) {
    let { key } = searchKey;
    if (key === import_core13.KeyCode.BACKSPACE) {
      this.searchString = this.searchString.slice(0, -1);
      key = "";
    } else if (!(0, import_core13._isEventFromPrintableCharacter)(searchKey)) {
      return;
    }
    searchKey.preventDefault();
    this.searchTextFromCharacter(key);
  }
  searchTextFromCharacter(char) {
    this.searchString += char;
    this.runSearch();
    this.clearSearchString();
  }
  searchTextFromString(str) {
    if (str == null) {
      str = "";
    }
    this.searchString = str;
    this.runSearch();
  }
  buildSearchStrings(values) {
    const { valueFormatter = (value) => value } = this.config;
    let searchStrings;
    if (typeof values[0] === "number" || typeof values[0] === "string") {
      searchStrings = values.map((v) => valueFormatter(v));
    } else if (typeof values[0] === "object" && this.searchStringCreator) {
      searchStrings = this.searchStringCreator(values);
    }
    return searchStrings;
  }
  filterListModel(filteredValues) {
    const { filterList } = this.config;
    if (!filterList) {
      return;
    }
    this.setValueList({ valueList: filteredValues, refresh: true });
    this.alignPickerToComponent();
  }
  runSearch() {
    if (!this.listComponent) {
      return;
    }
    const { values } = this;
    const searchStrings = this.buildSearchStrings(values);
    if (!searchStrings) {
      this.listComponent.highlightIndex(-1);
      return;
    }
    const { suggestions, filteredValues } = this.getSuggestionsAndFilteredValues(this.searchString, searchStrings);
    const { filterList, highlightMatch, searchType = "fuzzy" } = this.config;
    const filterValueLen = filteredValues.length;
    const shouldFilter = !!(filterList && this.searchString !== "");
    this.filterListModel(shouldFilter ? filteredValues : values);
    if (suggestions.length) {
      const topSuggestionIndex = shouldFilter ? 0 : searchStrings.indexOf(suggestions[0]);
      this.listComponent?.highlightIndex(topSuggestionIndex);
    } else {
      this.listComponent?.highlightIndex(-1);
      if (!shouldFilter || filterValueLen) {
        this.listComponent?.ensureIndexVisible(0);
      } else if (shouldFilter) {
        this.getAriaElement().removeAttribute("data-active-option");
        const eListAriaEl = this.listComponent?.getAriaElement();
        if (eListAriaEl) {
          (0, import_core13._setAriaActiveDescendant)(eListAriaEl, null);
        }
      }
    }
    if (highlightMatch && searchType !== "fuzzy") {
      this.listComponent?.highlightFilterMatch(this.searchString);
    }
    this.displayOrHidePicker();
  }
  getSuggestionsAndFilteredValues(searchValue, valueList) {
    let suggestions = [];
    const filteredValues = [];
    if (!searchValue.length) {
      return { suggestions, filteredValues };
    }
    const { searchType = "fuzzy", filterList } = this.config;
    if (searchType === "fuzzy") {
      const fuzzySearchResult = (0, import_core13._fuzzySuggestions)(searchValue, valueList, true);
      suggestions = fuzzySearchResult.values;
      const indices = fuzzySearchResult.indices;
      if (filterList && indices.length) {
        for (let i = 0; i < indices.length; i++) {
          filteredValues.push(this.values[indices[i]]);
        }
      }
    } else {
      suggestions = valueList.filter((val, idx) => {
        const currentValue = val.toLocaleLowerCase();
        const valueToMatch = this.searchString.toLocaleLowerCase();
        const isMatch = searchType === "match" ? currentValue.startsWith(valueToMatch) : currentValue.indexOf(valueToMatch) !== -1;
        if (filterList && isMatch) {
          filteredValues.push(this.values[idx]);
        }
        return isMatch;
      });
    }
    return { suggestions, filteredValues };
  }
  displayOrHidePicker() {
    if (!this.listComponent) {
      return;
    }
    const eListGui = this.listComponent.getGui();
    const list = this.listComponent.getCurrentList();
    const toggleValue = list ? list.length === 0 : false;
    eListGui.classList.toggle("ag-hidden", toggleValue);
  }
  clearSearchString() {
    this.searchString = "";
  }
  setValue(value, silent, fromPicker, skipRendering) {
    if (this.value === value) {
      return this;
    }
    const isArray = Array.isArray(value);
    if (value != null) {
      if (!isArray) {
        const list = this.listComponent?.getCurrentList();
        const index = list ? list.indexOf(value) : -1;
        if (index === -1) {
          return this;
        }
      }
      if (!fromPicker) {
        this.listComponent?.selectValue(value);
      }
    }
    super.setValue(value, silent);
    if (!skipRendering) {
      this.renderSelectedValue();
    }
    return this;
  }
  onNavigationKeyDown(event, key, announceItem) {
    event.preventDefault();
    const isDown = key === import_core13.KeyCode.DOWN;
    if (!this.isPickerDisplayed && isDown) {
      this.showPicker();
      return;
    }
    this.listComponent?.onNavigationKeyDown(key, announceItem);
  }
  onEnterKeyDown(e) {
    if (!this.isPickerDisplayed) {
      return;
    }
    e.preventDefault();
    if (this.listComponent?.getCurrentList()) {
      const lastRowHovered = this.listComponent.getLastItemHovered();
      if (this.config.multiSelect || !lastRowHovered) {
        this.dispatchPickerEventAndHidePicker(this.value, true);
      } else {
        this.onListValueSelected(/* @__PURE__ */ new Set([lastRowHovered]), true);
      }
    }
  }
  onDeleteKeyDown(e) {
    const { eWrapper, gos } = this;
    const activeEl = gos.getActiveDomElement();
    if (activeEl === eWrapper) {
      e.preventDefault();
      this.setValue([], true);
    }
  }
  onTabKeyDown() {
    const { config, isPickerDisplayed, listComponent } = this;
    const { multiSelect } = config;
    if (!isPickerDisplayed || !listComponent) {
      return;
    }
    if (multiSelect) {
      const values = this.getValueFromSet(listComponent.getSelectedItems());
      if (values) {
        this.setValue(values, false, true, true);
      }
    } else {
      this.setValue(listComponent.getLastItemHovered(), false, true);
    }
  }
  getValueFromSet(valueSet) {
    const { multiSelect } = this.config;
    let newValue = null;
    for (const value of valueSet) {
      if (valueSet.size === 1 && !multiSelect) {
        newValue = value;
        break;
      }
      if (!newValue) {
        newValue = [];
      }
      newValue.push(value);
    }
    if (Array.isArray(newValue)) {
      newValue.sort();
    }
    return newValue;
  }
  onListValueSelected(valueSet, fromEnterKey) {
    const newValue = this.getValueFromSet(valueSet);
    this.setValue(newValue, false, true);
    if (!this.config.multiSelect) {
      this.dispatchPickerEventAndHidePicker(newValue, fromEnterKey);
    }
  }
  dispatchPickerEventAndHidePicker(value, fromEnterKey) {
    const event = {
      type: "fieldPickerValueSelected",
      fromEnterKey,
      value
    };
    this.dispatchLocalEvent(event);
    this.hidePicker();
  }
  getFocusableElement() {
    const { allowTyping } = this.config;
    if (allowTyping) {
      return this.eInput.getFocusableElement();
    }
    return super.getFocusableElement();
  }
  onKeyDown(e) {
    const { key } = e;
    const { isPickerDisplayed, config, listComponent, pickerComponent } = this;
    const { allowTyping, multiSelect, suppressDeselectAll } = config;
    switch (key) {
      case import_core13.KeyCode.LEFT:
      case import_core13.KeyCode.RIGHT:
        if (!allowTyping || this.pillContainer) {
          e.preventDefault();
          if (this.pillContainer) {
            this.listComponent?.highlightIndex(-1);
            this.pillContainer.onNavigationKeyDown(e);
          }
        }
        break;
      case import_core13.KeyCode.PAGE_HOME:
      case import_core13.KeyCode.PAGE_END:
        if (allowTyping) {
          e.preventDefault();
          const inputEl = this.eInput.getInputElement();
          const target = key === import_core13.KeyCode.PAGE_HOME ? 0 : inputEl.value.length;
          inputEl.setSelectionRange(target, target);
          break;
        }
      case import_core13.KeyCode.PAGE_UP:
      case import_core13.KeyCode.PAGE_DOWN:
        e.preventDefault();
        if (pickerComponent) {
          listComponent?.navigateToPage(key);
        }
        break;
      case import_core13.KeyCode.DOWN:
      case import_core13.KeyCode.UP:
        this.onNavigationKeyDown(e, key, () => {
          if (multiSelect) {
            this.doWhileBlockingAnnouncement(() => this.eWrapper.focus());
            this.ariaAnnouncementService.announceValue(this.ariaToggleSelection);
          }
        });
        break;
      case import_core13.KeyCode.ESCAPE:
        if (isPickerDisplayed) {
          if ((0, import_core13._isVisible)(this.listComponent.getGui())) {
            e.preventDefault();
            (0, import_core13._stopPropagationForAgGrid)(e);
          }
          this.hidePicker();
        }
        break;
      case import_core13.KeyCode.ENTER:
        this.onEnterKeyDown(e);
        break;
      case import_core13.KeyCode.SPACE:
        if (isPickerDisplayed && multiSelect && listComponent) {
          e.preventDefault();
          const lastItemHovered = listComponent.getLastItemHovered();
          if (lastItemHovered) {
            listComponent.toggleListItemSelection(lastItemHovered);
          }
        }
        break;
      case import_core13.KeyCode.TAB:
        this.onTabKeyDown();
        break;
      case import_core13.KeyCode.DELETE:
        if (multiSelect && !suppressDeselectAll) {
          this.onDeleteKeyDown(e);
        }
        break;
      default:
        if (!allowTyping) {
          this.buildSearchStringFromKeyboardEvent(e);
        }
    }
  }
  destroy() {
    if (this.listComponent) {
      this.listComponent = this.destroyBean(this.listComponent);
    }
    super.destroy();
  }
};

// enterprise-modules/core/src/widgets/pillDragComp.ts
var import_core14 = require("@ag-grid-community/core");
var PillDragComp = class extends import_core14.Component {
  constructor(dragSourceDropTarget, ghost, horizontal, template, agComponents) {
    super();
    this.dragSourceDropTarget = dragSourceDropTarget;
    this.ghost = ghost;
    this.horizontal = horizontal;
    this.template = template;
    this.agComponents = agComponents;
    this.eText = import_core14.RefPlaceholder;
    this.eDragHandle = import_core14.RefPlaceholder;
    this.eButton = import_core14.RefPlaceholder;
  }
  wireBeans(beans) {
    this.dragAndDropService = beans.dragAndDropService;
  }
  postConstruct() {
    this.setTemplate(
      this.template ?? /* html */
      `
            <span role="option">
              <span data-ref="eDragHandle" class="ag-drag-handle ag-column-drop-cell-drag-handle" role="presentation"></span>
              <span data-ref="eText" class="ag-column-drop-cell-text" aria-hidden="true"></span>
              <span data-ref="eButton" class="ag-column-drop-cell-button" role="presentation"></span>
            </span>`,
      this.agComponents
    );
    const eGui = this.getGui();
    this.addElementClasses(eGui);
    this.addElementClasses(this.eDragHandle, "drag-handle");
    this.addElementClasses(this.eText, "text");
    this.addElementClasses(this.eButton, "button");
    this.eDragHandle.appendChild((0, import_core14._createIconNoSpan)("columnDrag", this.gos));
    this.eButton.appendChild((0, import_core14._createIconNoSpan)("cancel", this.gos));
    this.setupComponents();
    if (!this.ghost && this.isDraggable()) {
      this.addDragSource();
    }
    this.setupAria();
    this.setupTooltip();
    this.activateTabIndex();
    this.refreshDraggable();
  }
  isDraggable() {
    return true;
  }
  refreshDraggable() {
    this.eDragHandle.classList.toggle("ag-column-select-column-readonly", !this.isDraggable());
  }
  setupAria() {
    const translate = this.localeService.getLocaleTextFunc();
    const ariaInstructions = [this.getAriaDisplayName()];
    this.addAdditionalAriaInstructions(ariaInstructions, translate);
    (0, import_core14._setAriaLabel)(this.getGui(), ariaInstructions.join(". "));
  }
  addAdditionalAriaInstructions(ariaInstructions, translate) {
    if (this.isRemovable()) {
      const deleteAria = translate("ariaDropZoneColumnComponentDescription", "Press DELETE to remove");
      ariaInstructions.push(deleteAria);
    }
  }
  setupTooltip() {
    const refresh = () => {
      const newTooltipText = this.getTooltip();
      this.setTooltip({ newTooltipText });
    };
    refresh();
    this.addManagedEventListeners({ newColumnsLoaded: refresh });
  }
  getDragSourceId() {
    return void 0;
  }
  getDefaultIconName() {
    return "notAllowed";
  }
  addDragSource() {
    const { dragAndDropService, eDragHandle } = this;
    const getDragItem = this.createGetDragItem();
    const defaultIconName = this.getDefaultIconName();
    const dragSource = {
      type: this.getDragSourceType(),
      sourceId: this.getDragSourceId(),
      eElement: eDragHandle,
      getDefaultIconName: () => defaultIconName,
      getDragItem,
      dragItemName: this.getDisplayName()
    };
    dragAndDropService.addDragSource(dragSource, true);
    this.addDestroyFunc(() => dragAndDropService.removeDragSource(dragSource));
  }
  setupComponents() {
    this.setTextValue();
    this.setupRemove();
    if (this.ghost) {
      this.addCssClass("ag-column-drop-cell-ghost");
    }
  }
  isRemovable() {
    return true;
  }
  refreshRemove() {
    (0, import_core14._setDisplayed)(this.eButton, this.isRemovable());
  }
  setupRemove() {
    this.refreshRemove();
    const agEvent = { type: "columnRemove" };
    this.addGuiEventListener("keydown", (e) => this.onKeyDown(e));
    this.addManagedElementListeners(this.eButton, {
      click: (mouseEvent) => {
        this.dispatchLocalEvent(agEvent);
        mouseEvent.stopPropagation();
      }
    });
    const touchListener = new import_core14.TouchListener(this.eButton);
    this.addManagedListeners(touchListener, {
      tap: () => this.dispatchLocalEvent(agEvent)
    });
    this.addDestroyFunc(touchListener.destroy.bind(touchListener));
  }
  onKeyDown(e) {
    const isDelete = e.key === import_core14.KeyCode.DELETE;
    if (isDelete) {
      if (this.isRemovable()) {
        e.preventDefault();
        this.dispatchLocalEvent({ type: "columnRemove" });
      }
    }
  }
  getDisplayValue() {
    return this.getDisplayName();
  }
  setTextValue() {
    const displayValue = this.getDisplayValue();
    const displayValueSanitised = (0, import_core14._escapeString)(displayValue);
    this.eText.innerHTML = displayValueSanitised;
  }
  addElementClasses(el, suffix) {
    suffix = suffix ? `-${suffix}` : "";
    const direction = this.horizontal ? "horizontal" : "vertical";
    el.classList.add(`ag-column-drop-cell${suffix}`, `ag-column-drop-${direction}-cell${suffix}`);
  }
  destroy() {
    super.destroy();
    this.dragSourceDropTarget = null;
  }
};

// enterprise-modules/core/src/widgets/pillDropZonePanel.ts
var import_core15 = require("@ag-grid-community/core");
var PillDropZonePanel = class extends import_core15.Component {
  constructor(horizontal) {
    super(
      /* html */
      `<div class="ag-unselectable" role="presentation"></div>`
    );
    this.horizontal = horizontal;
    this.state = "notDragging";
    this.guiDestroyFunctions = [];
    this.childPillComponents = [];
    this.resizeEnabled = false;
    this.addElementClasses(this.getGui());
    this.ePillDropList = document.createElement("div");
    this.addElementClasses(this.ePillDropList, "list");
    (0, import_core15._setAriaRole)(this.ePillDropList, "listbox");
  }
  wireBeans(beans) {
    this.focusService = beans.focusService;
    this.dragAndDropService = beans.dragAndDropService;
  }
  isHorizontal() {
    return this.horizontal;
  }
  toggleResizable(resizable) {
    this.positionableFeature.setResizable(resizable ? { bottom: true } : false);
    this.resizeEnabled = resizable;
  }
  isSourceEventFromTarget(draggingEvent) {
    const { dropZoneTarget, dragSource } = draggingEvent;
    return dropZoneTarget.contains(dragSource.eElement);
  }
  destroy() {
    this.destroyGui();
    super.destroy();
  }
  destroyGui() {
    this.guiDestroyFunctions.forEach((func) => func());
    this.guiDestroyFunctions.length = 0;
    this.childPillComponents.length = 0;
    (0, import_core15._clearElement)(this.getGui());
    (0, import_core15._clearElement)(this.ePillDropList);
  }
  init(params) {
    this.params = params ?? {};
    this.createManagedBean(
      new import_core15.ManagedFocusFeature(this.getFocusableElement(), {
        onTabKeyDown: this.onTabKeyDown.bind(this),
        handleKeyDown: this.onKeyDown.bind(this)
      })
    );
    this.setupDropTarget();
    this.positionableFeature = new import_core15.PositionableFeature(this.getGui(), { minHeight: 100 });
    this.createManagedBean(this.positionableFeature);
    this.refreshGui();
    (0, import_core15._setAriaLabel)(this.ePillDropList, this.getAriaLabel());
  }
  onTabKeyDown(e) {
    const focusableElements = this.focusService.findFocusableElements(this.getFocusableElement(), null, true);
    const len = focusableElements.length;
    if (len === 0) {
      return;
    }
    const { shiftKey } = e;
    const activeEl = this.gos.getActiveDomElement();
    const isFirstFocused = activeEl === focusableElements[0];
    const isLastFocused = activeEl === (0, import_core15._last)(focusableElements);
    const shouldAllowDefaultTab = len === 1 || isFirstFocused && shiftKey || isLastFocused && !shiftKey;
    if (!shouldAllowDefaultTab) {
      focusableElements[shiftKey ? 0 : len - 1].focus();
    }
  }
  onKeyDown(e) {
    const { key } = e;
    const isVertical = !this.horizontal;
    let isNext = key === import_core15.KeyCode.DOWN;
    let isPrevious = key === import_core15.KeyCode.UP;
    if (!isVertical) {
      const isRtl = this.gos.get("enableRtl");
      isNext = !isRtl && key === import_core15.KeyCode.RIGHT || isRtl && key === import_core15.KeyCode.LEFT;
      isPrevious = !isRtl && key === import_core15.KeyCode.LEFT || isRtl && key === import_core15.KeyCode.RIGHT;
    }
    if (!isNext && !isPrevious) {
      return;
    }
    const el = this.focusService.findNextFocusableElement(this.getFocusableElement(), false, isPrevious);
    if (el) {
      e.preventDefault();
      el.focus();
    }
  }
  addElementClasses(el, suffix) {
    suffix = suffix ? `-${suffix}` : "";
    const direction = this.horizontal ? "horizontal" : "vertical";
    el.classList.add(`ag-column-drop${suffix}`, `ag-column-drop-${direction}${suffix}`);
  }
  setupDropTarget() {
    this.dropTarget = {
      getContainer: this.getGui.bind(this),
      getIconName: this.getIconName.bind(this),
      onDragging: this.onDragging.bind(this),
      onDragEnter: this.onDragEnter.bind(this),
      onDragLeave: this.onDragLeave.bind(this),
      onDragStop: this.onDragStop.bind(this),
      isInterestedIn: this.isInterestedIn.bind(this)
    };
    this.dragAndDropService.addDropTarget(this.dropTarget);
  }
  minimumAllowedNewInsertIndex() {
    return 0;
  }
  checkInsertIndex(draggingEvent) {
    const newIndex = this.getNewInsertIndex(draggingEvent);
    if (newIndex < 0) {
      return false;
    }
    const minimumAllowedIndex = this.minimumAllowedNewInsertIndex();
    const newAdjustedIndex = Math.max(minimumAllowedIndex, newIndex);
    const changed = newAdjustedIndex !== this.insertIndex;
    if (changed) {
      this.insertIndex = newAdjustedIndex;
    }
    return changed;
  }
  getNewInsertIndex(draggingEvent) {
    const mouseEvent = draggingEvent.event;
    const mouseLocation = this.horizontal ? mouseEvent.clientX : mouseEvent.clientY;
    const boundsList = this.childPillComponents.map((comp) => comp.getGui().getBoundingClientRect());
    const hoveredIndex = boundsList.findIndex(
      (rect) => this.horizontal ? rect.right > mouseLocation && rect.left < mouseLocation : rect.top < mouseLocation && rect.bottom > mouseLocation
    );
    if (hoveredIndex === -1) {
      const enableRtl = this.gos.get("enableRtl");
      const isLast = boundsList.every((rect) => mouseLocation > (this.horizontal ? rect.right : rect.bottom));
      if (isLast) {
        return enableRtl && this.horizontal ? 0 : this.childPillComponents.length;
      }
      const isFirst = boundsList.every((rect) => mouseLocation < (this.horizontal ? rect.left : rect.top));
      if (isFirst) {
        return enableRtl && this.horizontal ? this.childPillComponents.length : 0;
      }
      return this.insertIndex;
    }
    if (this.insertIndex <= hoveredIndex) {
      return hoveredIndex + 1;
    }
    return hoveredIndex;
  }
  checkDragStartedBySelf(draggingEvent) {
    if (this.state !== "notDragging") {
      return;
    }
    this.state = "rearrangeItems";
    this.potentialDndItems = this.getItems(draggingEvent.dragSource.getDragItem());
    this.refreshGui();
    this.checkInsertIndex(draggingEvent);
    this.refreshGui();
  }
  onDragging(draggingEvent) {
    this.checkDragStartedBySelf(draggingEvent);
    if (this.checkInsertIndex(draggingEvent)) {
      this.refreshGui();
    }
  }
  handleDragEnterEnd(draggingEvent) {
  }
  onDragEnter(draggingEvent) {
    const dragItems = this.getItems(draggingEvent.dragSource.getDragItem());
    this.state = "newItemsIn";
    const goodDragItems = dragItems.filter((item) => this.isItemDroppable(item, draggingEvent));
    const alreadyPresent = goodDragItems.every(
      (item) => this.childPillComponents.map((cmp) => cmp.getItem()).indexOf(item) !== -1
    );
    if (goodDragItems.length === 0) {
      return;
    }
    this.potentialDndItems = goodDragItems;
    if (alreadyPresent) {
      this.state = "notDragging";
      return;
    }
    this.handleDragEnterEnd(draggingEvent);
    this.checkInsertIndex(draggingEvent);
    this.refreshGui();
  }
  isPotentialDndItems() {
    return (0, import_core15._existsAndNotEmpty)(this.potentialDndItems);
  }
  handleDragLeaveEnd(draggingEvent) {
  }
  onDragLeave(draggingEvent) {
    if (this.state === "rearrangeItems") {
      const items = this.getItems(draggingEvent.dragSource.getDragItem());
      this.removeItems(items);
    }
    if (this.isPotentialDndItems()) {
      this.handleDragLeaveEnd(draggingEvent);
      this.potentialDndItems = [];
      this.refreshGui();
    }
    this.state = "notDragging";
  }
  onDragStop() {
    if (this.isPotentialDndItems()) {
      if (this.state === "newItemsIn") {
        this.addItems(this.potentialDndItems);
      } else {
        this.rearrangeItems(this.potentialDndItems);
      }
      this.potentialDndItems = [];
      this.refreshGui();
    }
    this.state = "notDragging";
  }
  removeItems(itemsToRemove) {
    const newItemList = this.getExistingItems().filter((item) => !(0, import_core15._includes)(itemsToRemove, item));
    this.updateItems(newItemList);
  }
  addItems(itemsToAdd) {
    if (!itemsToAdd) {
      return;
    }
    const newItemList = this.getExistingItems().slice();
    const itemsToAddNoDuplicates = itemsToAdd.filter((item) => newItemList.indexOf(item) < 0);
    (0, import_core15._insertArrayIntoArray)(newItemList, itemsToAddNoDuplicates, this.insertIndex);
    this.updateItems(newItemList);
  }
  addItem(item) {
    this.insertIndex = this.getExistingItems().length;
    this.addItems([item]);
    this.refreshGui();
  }
  rearrangeItems(itemsToAdd) {
    const newItemList = this.getNonGhostItems().slice();
    (0, import_core15._insertArrayIntoArray)(newItemList, itemsToAdd, this.insertIndex);
    if ((0, import_core15._areEqual)(newItemList, this.getExistingItems())) {
      return false;
    }
    this.updateItems(newItemList);
    return true;
  }
  refreshGui() {
    const scrollTop = this.ePillDropList.scrollTop;
    const resizeEnabled = this.resizeEnabled;
    const focusedIndex = this.getFocusedItem();
    let alternateElement = this.focusService.findNextFocusableElement();
    if (!alternateElement) {
      alternateElement = this.focusService.findNextFocusableElement(void 0, false, true);
    }
    this.toggleResizable(false);
    this.destroyGui();
    this.addIconAndTitleToGui();
    this.addEmptyMessageToGui();
    this.addItemsToGui();
    if (!this.isHorizontal()) {
      this.ePillDropList.scrollTop = scrollTop;
    }
    if (resizeEnabled) {
      this.toggleResizable(resizeEnabled);
    }
    if (this.focusService.isKeyboardMode()) {
      this.restoreFocus(focusedIndex, alternateElement);
    }
  }
  getFocusedItem() {
    const eGui = this.getGui();
    const activeElement = this.gos.getActiveDomElement();
    if (!eGui.contains(activeElement)) {
      return -1;
    }
    const items = Array.from(eGui.querySelectorAll(".ag-column-drop-cell"));
    return items.indexOf(activeElement);
  }
  restoreFocus(index, alternateElement) {
    const eGui = this.getGui();
    const items = Array.from(eGui.querySelectorAll(".ag-column-drop-cell"));
    if (index === -1) {
      return;
    }
    if (items.length === 0) {
      alternateElement.focus();
    }
    const indexToFocus = Math.min(items.length - 1, index);
    const el = items[indexToFocus];
    if (el) {
      el.focus();
    }
  }
  focusList(fromBottom) {
    const index = fromBottom ? this.childPillComponents.length - 1 : 0;
    this.restoreFocus(index, this.getFocusableElement());
  }
  getNonGhostItems() {
    const existingItems = this.getExistingItems();
    if (this.isPotentialDndItems()) {
      return existingItems.filter((item) => !(0, import_core15._includes)(this.potentialDndItems, item));
    }
    return existingItems;
  }
  addItemsToGui() {
    const nonGhostItems = this.getNonGhostItems();
    const itemsToAddToGui = nonGhostItems.map((item) => this.createItemComponent(item, false));
    if (this.isPotentialDndItems()) {
      const dndItems = this.potentialDndItems.map((item) => this.createItemComponent(item, true));
      if (this.insertIndex >= itemsToAddToGui.length) {
        itemsToAddToGui.push(...dndItems);
      } else {
        itemsToAddToGui.splice(this.insertIndex, 0, ...dndItems);
      }
    }
    this.appendChild(this.ePillDropList);
    itemsToAddToGui.forEach((itemComponent, index) => {
      if (index > 0) {
        this.addArrow(this.ePillDropList);
      }
      this.ePillDropList.appendChild(itemComponent.getGui());
    });
    this.addAriaLabelsToComponents();
  }
  addAriaLabelsToComponents() {
    this.childPillComponents.forEach((comp, idx) => {
      const eGui = comp.getGui();
      (0, import_core15._setAriaPosInSet)(eGui, idx + 1);
      (0, import_core15._setAriaSetSize)(eGui, this.childPillComponents.length);
    });
  }
  createItemComponent(item, ghost) {
    const itemComponent = this.createPillComponent(item, this.dropTarget, ghost, this.horizontal);
    itemComponent.addEventListener("columnRemove", this.removeItems.bind(this, [item]));
    this.createBean(itemComponent);
    this.guiDestroyFunctions.push(() => this.destroyBean(itemComponent));
    if (!ghost) {
      this.childPillComponents.push(itemComponent);
    }
    return itemComponent;
  }
  addIconAndTitleToGui() {
    const { title, icon: eGroupIcon } = this.params;
    if (!title || !eGroupIcon) {
      return;
    }
    const eTitleBar = document.createElement("div");
    (0, import_core15._setAriaHidden)(eTitleBar, true);
    this.addElementClasses(eTitleBar, "title-bar");
    this.addElementClasses(eGroupIcon, "icon");
    this.addOrRemoveCssClass("ag-column-drop-empty", this.isExistingItemsEmpty());
    eTitleBar.appendChild(eGroupIcon);
    if (!this.horizontal) {
      const eTitle = document.createElement("span");
      this.addElementClasses(eTitle, "title");
      eTitle.innerHTML = title;
      eTitleBar.appendChild(eTitle);
    }
    this.appendChild(eTitleBar);
  }
  isExistingItemsEmpty() {
    return this.getExistingItems().length === 0;
  }
  addEmptyMessageToGui() {
    const { emptyMessage } = this.params;
    if (!emptyMessage || !this.isExistingItemsEmpty() || this.isPotentialDndItems()) {
      return;
    }
    const eMessage = document.createElement("span");
    eMessage.innerHTML = emptyMessage;
    this.addElementClasses(eMessage, "empty-message");
    this.ePillDropList.appendChild(eMessage);
  }
  addArrow(eParent) {
    if (this.horizontal) {
      const enableRtl = this.gos.get("enableRtl");
      const icon = (0, import_core15._createIconNoSpan)(enableRtl ? "smallLeft" : "smallRight", this.gos);
      this.addElementClasses(icon, "cell-separator");
      eParent.appendChild(icon);
    }
  }
};

// enterprise-modules/core/src/widgets/agDialog.ts
var import_core17 = require("@ag-grid-community/core");

// enterprise-modules/core/src/widgets/agPanel.ts
var import_core16 = require("@ag-grid-community/core");
function getTemplate(config) {
  const cssIdentifier = config.cssIdentifier || "default";
  return (
    /* html */
    `<div class="ag-panel ag-${cssIdentifier}-panel" tabindex="-1">
        <div data-ref="eTitleBar" class="ag-panel-title-bar ag-${cssIdentifier}-panel-title-bar ag-unselectable">
            <span data-ref="eTitle" class="ag-panel-title-bar-title ag-${cssIdentifier}-panel-title-bar-title"></span>
            <div data-ref="eTitleBarButtons" class="ag-panel-title-bar-buttons ag-${cssIdentifier}-panel-title-bar-buttons"></div>
        </div>
        <div data-ref="eContentWrapper" class="ag-panel-content-wrapper ag-${cssIdentifier}-panel-content-wrapper"></div>
    </div>`
  );
}
var _AgPanel = class _AgPanel extends import_core16.Component {
  constructor(config) {
    super(getTemplate(config));
    this.config = config;
    this.closable = true;
    this.eContentWrapper = import_core16.RefPlaceholder;
    this.eTitleBar = import_core16.RefPlaceholder;
    this.eTitleBarButtons = import_core16.RefPlaceholder;
    this.eTitle = import_core16.RefPlaceholder;
  }
  postConstruct() {
    const {
      component,
      closable,
      hideTitleBar,
      title,
      minWidth = 250,
      width,
      minHeight = 250,
      height,
      centered,
      popup,
      x,
      y
    } = this.config;
    this.positionableFeature = new import_core16.PositionableFeature(this.getGui(), {
      minWidth,
      width,
      minHeight,
      height,
      centered,
      x,
      y,
      popup,
      calculateTopBuffer: () => this.positionableFeature.getHeight() - this.getBodyHeight()
    });
    this.createManagedBean(this.positionableFeature);
    const eGui = this.getGui();
    if (component) {
      this.setBodyComponent(component);
    }
    if (!hideTitleBar) {
      if (title) {
        this.setTitle(title);
      }
      this.setClosable(closable != null ? closable : this.closable);
    } else {
      (0, import_core16._setDisplayed)(this.eTitleBar, false);
    }
    this.addManagedElementListeners(this.eTitleBar, {
      mousedown: (e) => {
        if (eGui.contains(e.relatedTarget) || eGui.contains(this.gos.getActiveDomElement()) || this.eTitleBarButtons.contains(e.target)) {
          e.preventDefault();
          return;
        }
        const focusEl = this.eContentWrapper.querySelector(
          "button, [href], input, select, textarea, [tabindex]"
        );
        if (focusEl) {
          focusEl.focus();
        }
      }
    });
    if (popup && this.positionableFeature.isPositioned()) {
      return;
    }
    if (this.renderComponent) {
      this.renderComponent();
    }
    this.positionableFeature.initialisePosition();
    this.eContentWrapper.style.height = "0";
  }
  renderComponent() {
    const eGui = this.getGui();
    eGui.focus();
    this.close = () => {
      eGui.parentElement.removeChild(eGui);
      this.destroy();
    };
  }
  getHeight() {
    return this.positionableFeature.getHeight();
  }
  setHeight(height) {
    this.positionableFeature.setHeight(height);
  }
  getWidth() {
    return this.positionableFeature.getWidth();
  }
  setWidth(width) {
    this.positionableFeature.setWidth(width);
  }
  setClosable(closable) {
    if (closable !== this.closable) {
      this.closable = closable;
    }
    if (closable) {
      const closeButtonComp = this.closeButtonComp = new import_core16.Component(_AgPanel.CLOSE_BTN_TEMPLATE);
      this.createBean(closeButtonComp);
      const eGui = closeButtonComp.getGui();
      const child = (0, import_core16._createIconNoSpan)("close", this.gos);
      child.classList.add("ag-panel-title-bar-button-icon");
      eGui.appendChild(child);
      this.addTitleBarButton(closeButtonComp);
      closeButtonComp.addManagedElementListeners(eGui, { click: this.onBtClose.bind(this) });
    } else if (this.closeButtonComp) {
      const eGui = this.closeButtonComp.getGui();
      eGui.parentElement.removeChild(eGui);
      this.closeButtonComp = this.destroyBean(this.closeButtonComp);
    }
  }
  setBodyComponent(bodyComponent) {
    bodyComponent.setParentComponent(this);
    this.eContentWrapper.appendChild(bodyComponent.getGui());
  }
  addTitleBarButton(button, position) {
    const eTitleBarButtons = this.eTitleBarButtons;
    const buttons = eTitleBarButtons.children;
    const len = buttons.length;
    if (position == null) {
      position = len;
    }
    position = Math.max(0, Math.min(position, len));
    button.addCssClass("ag-panel-title-bar-button");
    const eGui = button.getGui();
    if (position === 0) {
      eTitleBarButtons.insertAdjacentElement("afterbegin", eGui);
    } else if (position === len) {
      eTitleBarButtons.insertAdjacentElement("beforeend", eGui);
    } else {
      buttons[position - 1].insertAdjacentElement("afterend", eGui);
    }
    button.setParentComponent(this);
  }
  getBodyHeight() {
    return (0, import_core16._getInnerHeight)(this.eContentWrapper);
  }
  getBodyWidth() {
    return (0, import_core16._getInnerWidth)(this.eContentWrapper);
  }
  setTitle(title) {
    this.eTitle.innerText = title;
  }
  // called when user hits the 'x' in the top right
  onBtClose() {
    this.close();
  }
  destroy() {
    if (this.closeButtonComp) {
      this.closeButtonComp = this.destroyBean(this.closeButtonComp);
    }
    const eGui = this.getGui();
    if (eGui && (0, import_core16._isVisible)(eGui)) {
      this.close();
    }
    super.destroy();
  }
};
_AgPanel.CLOSE_BTN_TEMPLATE = /* html */
`<div class="ag-button"></div>`;
var AgPanel = _AgPanel;

// enterprise-modules/core/src/widgets/agDialog.ts
var AgDialog = class extends AgPanel {
  constructor(config) {
    super({ ...config, popup: true });
    this.isMaximizable = false;
    this.isMaximized = false;
    this.maximizeListeners = [];
    this.resizeListenerDestroy = null;
    this.lastPosition = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
  }
  wireBeans(beans) {
    this.popupService = beans.popupService;
    this.focusService = beans.focusService;
  }
  postConstruct() {
    const eGui = this.getGui();
    const { movable, resizable, maximizable, modal } = this.config;
    this.addCssClass("ag-dialog");
    super.postConstruct();
    this.tabGuardFeature = this.createManagedBean(new import_core17.TabGuardFeature(this));
    this.tabGuardFeature.initialiseTabGuard({
      isFocusableContainer: true,
      onFocusIn: () => {
        const eDocument = this.gos.getDocument();
        const { activeElement } = eDocument;
        const restoreFocus = this.popupService.bringPopupToFront(eGui);
        if (restoreFocus && activeElement !== eDocument.body) {
          activeElement?.focus?.();
        }
      },
      onTabKeyDown: (e) => {
        if (modal) {
          return;
        }
        const backwards = e.shiftKey;
        const nextFocusableElement = this.focusService.findNextFocusableElement(eGui, false, backwards);
        if (!nextFocusableElement || this.tabGuardFeature.getTabGuardCtrl().isTabGuard(nextFocusableElement)) {
          if (this.focusService.focusNextGridCoreContainer(backwards)) {
            e.preventDefault();
          }
        }
      }
    });
    if (movable) {
      this.setMovable(movable);
    }
    if (maximizable) {
      this.setMaximizable(maximizable);
    }
    if (resizable) {
      this.setResizable(resizable);
    }
    if (!this.config.modal) {
      const { focusService } = this;
      focusService.addFocusableContainer(this);
      this.addDestroyFunc(() => focusService.removeFocusableContainer(this));
    }
  }
  setAllowFocus(allowFocus) {
    this.tabGuardFeature.getTabGuardCtrl().setAllowFocus(allowFocus);
  }
  renderComponent() {
    const eGui = this.getGui();
    const { alwaysOnTop, modal, title, afterGuiAttached } = this.config;
    const translate = this.localeService.getLocaleTextFunc();
    const addPopupRes = this.popupService.addPopup({
      modal,
      eChild: eGui,
      closeOnEsc: true,
      closedCallback: this.onClosed.bind(this),
      alwaysOnTop,
      ariaLabel: title || translate("ariaLabelDialog", "Dialog"),
      afterGuiAttached
    });
    if (addPopupRes) {
      this.close = addPopupRes.hideFunc;
    }
  }
  onClosed(event) {
    this.destroy();
    this.config.closedCallback?.(event);
  }
  toggleMaximize() {
    const position = this.positionableFeature.getPosition();
    if (this.isMaximized) {
      const { x, y, width, height } = this.lastPosition;
      this.setWidth(width);
      this.setHeight(height);
      this.positionableFeature.offsetElement(x, y);
    } else {
      this.lastPosition.width = this.getWidth();
      this.lastPosition.height = this.getHeight();
      this.lastPosition.x = position.x;
      this.lastPosition.y = position.y;
      this.positionableFeature.offsetElement(0, 0);
      this.setHeight("100%");
      this.setWidth("100%");
    }
    this.isMaximized = !this.isMaximized;
    this.refreshMaximizeIcon();
  }
  refreshMaximizeIcon() {
    (0, import_core17._setDisplayed)(this.maximizeIcon, !this.isMaximized);
    (0, import_core17._setDisplayed)(this.minimizeIcon, this.isMaximized);
  }
  clearMaximizebleListeners() {
    if (this.maximizeListeners.length) {
      this.maximizeListeners.forEach((destroyListener) => destroyListener());
      this.maximizeListeners.length = 0;
    }
    if (this.resizeListenerDestroy) {
      this.resizeListenerDestroy();
      this.resizeListenerDestroy = null;
    }
  }
  destroy() {
    this.maximizeButtonComp = this.destroyBean(this.maximizeButtonComp);
    this.clearMaximizebleListeners();
    super.destroy();
  }
  setResizable(resizable) {
    this.positionableFeature.setResizable(resizable);
  }
  setMovable(movable) {
    this.positionableFeature.setMovable(movable, this.eTitleBar);
  }
  setMaximizable(maximizable) {
    if (!maximizable) {
      this.clearMaximizebleListeners();
      if (this.maximizeButtonComp) {
        this.destroyBean(this.maximizeButtonComp);
        this.maximizeButtonComp = this.maximizeIcon = this.minimizeIcon = void 0;
      }
      return;
    }
    const eTitleBar = this.eTitleBar;
    if (!eTitleBar || maximizable === this.isMaximizable) {
      return;
    }
    const maximizeButtonComp = this.buildMaximizeAndMinimizeElements();
    this.refreshMaximizeIcon();
    maximizeButtonComp.addManagedElementListeners(maximizeButtonComp.getGui(), {
      click: this.toggleMaximize.bind(this)
    });
    this.addTitleBarButton(maximizeButtonComp, 0);
    this.maximizeListeners.push(
      ...this.addManagedElementListeners(eTitleBar, {
        dblclick: this.toggleMaximize.bind(this)
      })
    );
    [this.resizeListenerDestroy] = this.addManagedListeners(this.positionableFeature, {
      resize: () => {
        this.isMaximized = false;
        this.refreshMaximizeIcon();
      }
    });
  }
  buildMaximizeAndMinimizeElements() {
    const maximizeButtonComp = this.maximizeButtonComp = this.createBean(
      new import_core17.Component(
        /* html */
        `<div class="ag-dialog-button"></span>`
      )
    );
    const eGui = maximizeButtonComp.getGui();
    this.maximizeIcon = (0, import_core17._createIconNoSpan)("maximize", this.gos);
    eGui.appendChild(this.maximizeIcon);
    this.maximizeIcon.classList.add("ag-panel-title-bar-button-icon");
    this.minimizeIcon = (0, import_core17._createIconNoSpan)("minimize", this.gos);
    eGui.appendChild(this.minimizeIcon);
    this.minimizeIcon.classList.add("ag-panel-title-bar-button-icon");
    return maximizeButtonComp;
  }
};

// enterprise-modules/core/src/widgets/agMenuItemComponent.ts
var import_core20 = require("@ag-grid-community/core");

// enterprise-modules/core/src/widgets/agMenuList.ts
var import_core18 = require("@ag-grid-community/core");
var AgMenuList = class extends import_core18.TabGuardComp {
  constructor(level = 0, params) {
    super(
      /* html */
      `<div class="ag-menu-list" role="tree"></div>`
    );
    this.level = level;
    this.menuItems = [];
    this.params = params ?? {
      column: null,
      node: null,
      value: null
    };
  }
  postConstruct() {
    this.initialiseTabGuard({
      onTabKeyDown: (e) => this.onTabKeyDown(e),
      handleKeyDown: (e) => this.handleKeyDown(e),
      onFocusIn: (e) => this.handleFocusIn(e),
      onFocusOut: (e) => this.handleFocusOut(e)
    });
  }
  onTabKeyDown(e) {
    const parent = this.getParentComponent();
    const parentGui = parent && parent.getGui();
    const isManaged = parentGui && parentGui.classList.contains("ag-focus-managed");
    if (!isManaged) {
      e.preventDefault();
    }
    if (e.shiftKey) {
      this.closeIfIsChild(e);
    }
  }
  handleKeyDown(e) {
    switch (e.key) {
      case import_core18.KeyCode.UP:
      case import_core18.KeyCode.RIGHT:
      case import_core18.KeyCode.DOWN:
      case import_core18.KeyCode.LEFT:
        e.preventDefault();
        this.handleNavKey(e.key);
        break;
      case import_core18.KeyCode.ESCAPE:
        if (this.closeIfIsChild()) {
          (0, import_core18._stopPropagationForAgGrid)(e);
        }
        break;
    }
  }
  handleFocusIn(e) {
    const oldFocusedElement = e.relatedTarget;
    if (!this.tabGuardFeature.getTabGuardCtrl().isTabGuard(oldFocusedElement) && (this.getGui().contains(oldFocusedElement) || this.activeMenuItem?.getSubMenuGui()?.contains(oldFocusedElement))) {
      return;
    }
    if (this.activeMenuItem) {
      this.activeMenuItem.activate();
    } else {
      this.activateFirstItem();
    }
  }
  handleFocusOut(e) {
    const newFocusedElement = e.relatedTarget;
    if (!this.activeMenuItem || this.getGui().contains(newFocusedElement) || this.activeMenuItem.getSubMenuGui()?.contains(newFocusedElement)) {
      return;
    }
    if (!this.activeMenuItem.isSubMenuOpening()) {
      this.activeMenuItem.deactivate();
    }
  }
  clearActiveItem() {
    if (this.activeMenuItem) {
      this.activeMenuItem.deactivate();
      this.activeMenuItem = null;
    }
  }
  addMenuItems(menuItems) {
    if (menuItems == null) {
      return;
    }
    import_core18.AgPromise.all(
      menuItems.map((menuItemOrString) => {
        if (menuItemOrString === "separator") {
          return import_core18.AgPromise.resolve({ eGui: this.createSeparator() });
        } else if (typeof menuItemOrString === "string") {
          (0, import_core18._warnOnce)(`unrecognised menu item ${menuItemOrString}`);
          return import_core18.AgPromise.resolve({ eGui: null });
        } else {
          return this.addItem(menuItemOrString);
        }
      })
    ).then((elements) => {
      elements.forEach((element) => {
        if (element?.eGui) {
          this.appendChild(element.eGui);
          if (element.comp) {
            this.menuItems.push(element.comp);
          }
        }
      });
    });
  }
  addItem(menuItemDef) {
    const menuItem = this.createManagedBean(new AgMenuItemComponent());
    return menuItem.init({
      menuItemDef,
      isAnotherSubMenuOpen: () => this.menuItems.some((m) => m.isSubMenuOpen()),
      level: this.level,
      contextParams: this.params
    }).then(() => {
      menuItem.setParentComponent(this);
      this.addManagedListeners(menuItem, {
        closeMenu: (event) => {
          this.dispatchLocalEvent(event);
        },
        menuItemActivated: (event) => {
          if (this.activeMenuItem && this.activeMenuItem !== event.menuItem) {
            this.activeMenuItem.deactivate();
          }
          this.activeMenuItem = event.menuItem;
        }
      });
      return {
        comp: menuItem,
        eGui: menuItem.getGui()
      };
    });
  }
  activateFirstItem() {
    const item = this.menuItems.filter((currentItem) => !currentItem.isDisabled())[0];
    if (!item) {
      return;
    }
    item.activate();
  }
  createSeparator() {
    const separatorHtml = (
      /* html */
      `
            <div class="ag-menu-separator" aria-hidden="true">
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
            </div>`
    );
    return (0, import_core18._loadTemplate)(separatorHtml);
  }
  handleNavKey(key) {
    switch (key) {
      case import_core18.KeyCode.UP:
      case import_core18.KeyCode.DOWN: {
        const nextItem = this.findNextItem(key === import_core18.KeyCode.UP);
        if (nextItem && nextItem !== this.activeMenuItem) {
          nextItem.activate();
        }
        return;
      }
    }
    const left = this.gos.get("enableRtl") ? import_core18.KeyCode.RIGHT : import_core18.KeyCode.LEFT;
    if (key === left) {
      this.closeIfIsChild();
    } else {
      this.openChild();
    }
  }
  closeIfIsChild(e) {
    const parentItem = this.getParentComponent();
    if (parentItem && parentItem instanceof AgMenuItemComponent) {
      if (e) {
        e.preventDefault();
      }
      parentItem.closeSubMenu();
      parentItem.getGui().focus();
      return true;
    }
    return false;
  }
  openChild() {
    if (this.activeMenuItem) {
      this.activeMenuItem.openSubMenu(true);
    }
  }
  findNextItem(up) {
    const items = this.menuItems.filter((item) => !item.isDisabled());
    if (!items.length) {
      return;
    }
    if (!this.activeMenuItem) {
      return up ? (0, import_core18._last)(items) : items[0];
    }
    if (up) {
      items.reverse();
    }
    let nextItem;
    let foundCurrent = false;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!foundCurrent) {
        if (item === this.activeMenuItem) {
          foundCurrent = true;
        }
        continue;
      }
      nextItem = item;
      break;
    }
    if (foundCurrent && !nextItem) {
      return items[0];
    }
    return nextItem || this.activeMenuItem;
  }
  destroy() {
    this.clearActiveItem();
    super.destroy();
  }
};

// enterprise-modules/core/src/widgets/agMenuPanel.ts
var import_core19 = require("@ag-grid-community/core");
var AgMenuPanel = class extends import_core19.TabGuardComp {
  constructor(wrappedComponent) {
    super();
    this.setTemplateFromElement(wrappedComponent.getGui(), void 0, void 0, true);
  }
  postConstruct() {
    this.initialiseTabGuard({
      onTabKeyDown: (e) => this.onTabKeyDown(e),
      handleKeyDown: (e) => this.handleKeyDown(e)
    });
  }
  handleKeyDown(e) {
    if (e.key === import_core19.KeyCode.ESCAPE) {
      this.closePanel();
    }
  }
  onTabKeyDown(e) {
    if (e.defaultPrevented) {
      return;
    }
    this.closePanel();
    e.preventDefault();
  }
  closePanel() {
    const menuItem = this.parentComponent;
    menuItem.closeSubMenu();
    setTimeout(() => menuItem.getGui().focus(), 0);
  }
};

// enterprise-modules/core/src/widgets/agMenuItemComponent.ts
var AgMenuItemComponent = class extends import_core20.BeanStub {
  constructor() {
    super(...arguments);
    this.ACTIVATION_DELAY = 80;
    this.isActive = false;
    this.subMenuIsOpen = false;
    this.subMenuIsOpening = false;
    this.suppressRootStyles = true;
    this.suppressAria = true;
    this.suppressFocus = true;
  }
  wireBeans(beans) {
    this.popupService = beans.popupService;
    this.userComponentFactory = beans.userComponentFactory;
  }
  init(params) {
    const { menuItemDef, isAnotherSubMenuOpen, level, childComponent, contextParams } = params;
    this.params = params.menuItemDef;
    this.level = level;
    this.isAnotherSubMenuOpen = isAnotherSubMenuOpen;
    this.childComponent = childComponent;
    this.contextParams = contextParams;
    this.cssClassPrefix = this.params.menuItemParams?.cssClassPrefix ?? "ag-menu-option";
    const compDetails = this.userComponentFactory.getMenuItemCompDetails(this.params, {
      ...menuItemDef,
      level,
      isAnotherSubMenuOpen,
      openSubMenu: (activateFirstItem) => this.openSubMenu(activateFirstItem),
      closeSubMenu: () => this.closeSubMenu(),
      closeMenu: (event) => this.closeMenu(event),
      updateTooltip: (tooltip, shouldDisplayTooltip) => this.refreshTooltip(tooltip, shouldDisplayTooltip),
      onItemActivated: () => this.onItemActivated()
    });
    return compDetails.newAgStackInstance().then((comp) => {
      this.menuItemComp = comp;
      const configureDefaults = comp.configureDefaults?.();
      if (configureDefaults) {
        this.configureDefaults(configureDefaults === true ? void 0 : configureDefaults);
      }
    });
  }
  addListeners(eGui, params) {
    if (!params?.suppressClick) {
      this.addManagedElementListeners(eGui, { click: (e) => this.onItemSelected(e) });
    }
    if (!params?.suppressKeyboardSelect) {
      this.addManagedElementListeners(eGui, {
        keydown: (e) => {
          if (e.key === import_core20.KeyCode.ENTER || e.key === import_core20.KeyCode.SPACE) {
            e.preventDefault();
            this.onItemSelected(e);
          }
        }
      });
    }
    if (!params?.suppressMouseDown) {
      this.addManagedElementListeners(eGui, {
        mousedown: (e) => {
          e.stopPropagation();
          e.preventDefault();
        }
      });
    }
    if (!params?.suppressMouseOver) {
      this.addManagedElementListeners(eGui, {
        mouseenter: () => this.onMouseEnter(),
        mouseleave: () => this.onMouseLeave()
      });
    }
  }
  isDisabled() {
    return !!this.params.disabled;
  }
  openSubMenu(activateFirstItem = false) {
    this.closeSubMenu();
    if (!this.params.subMenu) {
      return;
    }
    this.subMenuIsOpening = true;
    const ePopup = (0, import_core20._loadTemplate)(
      /* html */
      `<div class="ag-menu" role="presentation"></div>`
    );
    this.eSubMenuGui = ePopup;
    let destroySubMenu;
    let afterGuiAttached = () => {
      this.subMenuIsOpening = false;
    };
    if (this.childComponent) {
      const menuPanel = this.createBean(new AgMenuPanel(this.childComponent));
      menuPanel.setParentComponent(this);
      const subMenuGui = menuPanel.getGui();
      const mouseEvent = "mouseenter";
      const mouseEnterListener = () => this.cancelDeactivate();
      subMenuGui.addEventListener(mouseEvent, mouseEnterListener);
      destroySubMenu = () => subMenuGui.removeEventListener(mouseEvent, mouseEnterListener);
      ePopup.appendChild(subMenuGui);
      if (this.childComponent.afterGuiAttached) {
        afterGuiAttached = () => {
          this.childComponent.afterGuiAttached();
          this.subMenuIsOpening = false;
        };
      }
    } else if (this.params.subMenu) {
      const childMenu = this.createBean(new AgMenuList(this.level + 1, this.contextParams));
      childMenu.setParentComponent(this);
      childMenu.addMenuItems(this.params.subMenu);
      ePopup.appendChild(childMenu.getGui());
      this.addManagedListeners(childMenu, { closeMenu: (e) => this.dispatchLocalEvent(e) });
      childMenu.addGuiEventListener("mouseenter", () => this.cancelDeactivate());
      destroySubMenu = () => this.destroyBean(childMenu);
      if (activateFirstItem) {
        afterGuiAttached = () => {
          childMenu.activateFirstItem();
          this.subMenuIsOpening = false;
        };
      }
    }
    const positionCallback = this.popupService.positionPopupForMenu.bind(this.popupService, {
      eventSource: this.eGui,
      ePopup
    });
    const translate = this.localeService.getLocaleTextFunc();
    const addPopupRes = this.popupService.addPopup({
      modal: true,
      eChild: ePopup,
      positionCallback,
      anchorToElement: this.eGui,
      ariaLabel: translate("ariaLabelSubMenu", "SubMenu"),
      afterGuiAttached
    });
    this.subMenuIsOpen = true;
    this.setAriaExpanded(true);
    this.hideSubMenu = () => {
      if (addPopupRes) {
        addPopupRes.hideFunc();
      }
      this.subMenuIsOpen = false;
      this.setAriaExpanded(false);
      destroySubMenu();
      this.menuItemComp.setExpanded?.(false);
      this.eSubMenuGui = void 0;
    };
    this.menuItemComp.setExpanded?.(true);
  }
  setAriaExpanded(expanded) {
    if (!this.suppressAria) {
      (0, import_core20._setAriaExpanded)(this.eGui, expanded);
    }
  }
  closeSubMenu() {
    if (!this.hideSubMenu) {
      return;
    }
    this.hideSubMenu();
    this.hideSubMenu = null;
    this.setAriaExpanded(false);
  }
  isSubMenuOpen() {
    return this.subMenuIsOpen;
  }
  isSubMenuOpening() {
    return this.subMenuIsOpening;
  }
  activate(openSubMenu) {
    this.cancelActivate();
    if (this.params.disabled) {
      return;
    }
    this.isActive = true;
    if (!this.suppressRootStyles) {
      this.eGui.classList.add(`${this.cssClassPrefix}-active`);
    }
    this.menuItemComp.setActive?.(true);
    if (!this.suppressFocus) {
      this.eGui.focus({ preventScroll: true });
    }
    if (openSubMenu && this.params.subMenu) {
      window.setTimeout(() => {
        if (this.isAlive() && this.isActive) {
          this.openSubMenu();
        }
      }, 300);
    }
    this.onItemActivated();
  }
  deactivate() {
    this.cancelDeactivate();
    if (!this.suppressRootStyles) {
      this.eGui.classList.remove(`${this.cssClassPrefix}-active`);
    }
    this.menuItemComp.setActive?.(false);
    this.isActive = false;
    if (this.subMenuIsOpen) {
      this.hideSubMenu();
    }
  }
  getGui() {
    return this.menuItemComp.getGui();
  }
  getParentComponent() {
    return this.parentComponent;
  }
  setParentComponent(component) {
    this.parentComponent = component;
  }
  getSubMenuGui() {
    return this.eSubMenuGui;
  }
  onItemSelected(event) {
    this.menuItemComp.select?.();
    if (this.params.action) {
      this.getFrameworkOverrides().wrapOutgoing(
        () => this.params.action(
          this.gos.addGridCommonParams({
            ...this.contextParams
          })
        )
      );
    } else {
      this.openSubMenu(event && event.type === "keydown");
    }
    if (this.params.subMenu && !this.params.action || this.params.suppressCloseOnSelect) {
      return;
    }
    this.closeMenu(event);
  }
  closeMenu(event) {
    const e = {
      type: "closeMenu"
    };
    if (event) {
      if (event instanceof MouseEvent) {
        e.mouseEvent = event;
      } else {
        e.keyboardEvent = event;
      }
    }
    this.dispatchLocalEvent(e);
  }
  onItemActivated() {
    const event = {
      type: "menuItemActivated",
      menuItem: this
    };
    this.dispatchLocalEvent(event);
  }
  cancelActivate() {
    if (this.activateTimeoutId) {
      window.clearTimeout(this.activateTimeoutId);
      this.activateTimeoutId = 0;
    }
  }
  cancelDeactivate() {
    if (this.deactivateTimeoutId) {
      window.clearTimeout(this.deactivateTimeoutId);
      this.deactivateTimeoutId = 0;
    }
  }
  onMouseEnter() {
    this.cancelDeactivate();
    if (this.isAnotherSubMenuOpen()) {
      this.activateTimeoutId = window.setTimeout(() => this.activate(true), this.ACTIVATION_DELAY);
    } else {
      this.activate(true);
    }
  }
  onMouseLeave() {
    this.cancelActivate();
    if (this.isSubMenuOpen()) {
      this.deactivateTimeoutId = window.setTimeout(() => this.deactivate(), this.ACTIVATION_DELAY);
    } else {
      this.deactivate();
    }
  }
  configureDefaults(params) {
    if (!this.menuItemComp) {
      setTimeout(() => this.configureDefaults(params));
      return;
    }
    let eGui = this.menuItemComp.getGui();
    const rootElement = this.menuItemComp.getRootElement?.();
    if (rootElement) {
      if (!params?.suppressRootStyles) {
        eGui.classList.add("ag-menu-option-custom");
      }
      eGui = rootElement;
    }
    this.eGui = eGui;
    this.suppressRootStyles = !!params?.suppressRootStyles;
    if (!this.suppressRootStyles) {
      eGui.classList.add(this.cssClassPrefix);
      this.params.cssClasses?.forEach((it) => eGui.classList.add(it));
      if (this.params.disabled) {
        eGui.classList.add(`${this.cssClassPrefix}-disabled`);
      }
    }
    if (!params?.suppressTooltip) {
      this.refreshTooltip(this.params.tooltip);
    }
    this.suppressAria = !!params?.suppressAria;
    if (!this.suppressAria) {
      (0, import_core20._setAriaRole)(eGui, "treeitem");
      (0, import_core20._setAriaLevel)(eGui, this.level + 1);
      if (this.params.disabled) {
        (0, import_core20._setAriaDisabled)(eGui, true);
      }
    }
    if (!params?.suppressTabIndex) {
      eGui.setAttribute("tabindex", "-1");
    }
    if (!this.params.disabled) {
      this.addListeners(eGui, params);
    }
    this.suppressFocus = !!params?.suppressFocus;
  }
  refreshTooltip(tooltip, shouldDisplayTooltip) {
    this.tooltip = tooltip;
    if (this.tooltipFeature) {
      this.tooltipFeature = this.destroyBean(this.tooltipFeature);
    }
    if (!tooltip || !this.menuItemComp) {
      return;
    }
    this.tooltipFeature = this.createBean(
      new import_core20.TooltipFeature({
        getGui: () => this.getGui(),
        getTooltipValue: () => this.tooltip,
        getLocation: () => "menu",
        shouldDisplayTooltip
      })
    );
  }
  destroy() {
    if (this.tooltipFeature) {
      this.tooltipFeature = this.destroyBean(this.tooltipFeature);
    }
    super.destroy();
  }
};

// enterprise-modules/core/src/features/virtualListDragFeature.ts
var import_core21 = require("@ag-grid-community/core");
var LIST_ITEM_HOVERED = "ag-list-item-hovered";
var VirtualListDragFeature = class extends import_core21.BeanStub {
  constructor(comp, virtualList, params) {
    super();
    this.comp = comp;
    this.virtualList = virtualList;
    this.params = params;
    this.currentDragValue = null;
    this.lastHoveredListItem = null;
  }
  wireBeans(beans) {
    this.dragAndDropService = beans.dragAndDropService;
  }
  postConstruct() {
    this.addManagedListeners(this.params.eventSource, {
      [this.params.listItemDragStartEvent]: this.listItemDragStart.bind(this),
      [this.params.listItemDragEndEvent]: this.listItemDragEnd.bind(this)
    });
    this.createDropTarget();
    this.createAutoScrollService();
  }
  listItemDragStart(event) {
    this.currentDragValue = this.params.getCurrentDragValue(event);
    this.moveBlocked = this.params.isMoveBlocked(this.currentDragValue);
  }
  listItemDragEnd() {
    window.setTimeout(() => {
      this.currentDragValue = null;
      this.moveBlocked = false;
    }, 10);
  }
  createDropTarget() {
    const dropTarget = {
      isInterestedIn: (type) => type === this.params.dragSourceType,
      getIconName: () => this.moveBlocked ? "pinned" : "move",
      getContainer: () => this.comp.getGui(),
      onDragging: (e) => this.onDragging(e),
      onDragStop: () => this.onDragStop(),
      onDragLeave: () => this.onDragLeave()
    };
    this.dragAndDropService.addDropTarget(dropTarget);
  }
  createAutoScrollService() {
    const virtualListGui = this.virtualList.getGui();
    this.autoScrollService = new import_core21.AutoScrollService({
      scrollContainer: virtualListGui,
      scrollAxis: "y",
      getVerticalPosition: () => virtualListGui.scrollTop,
      setVerticalPosition: (position) => virtualListGui.scrollTop = position
    });
  }
  onDragging(e) {
    if (!this.currentDragValue || this.moveBlocked) {
      return;
    }
    const hoveredListItem = this.getListDragItem(e);
    const comp = this.virtualList.getComponentAt(hoveredListItem.rowIndex);
    if (!comp) {
      return;
    }
    const el = comp.getGui().parentElement;
    if (this.lastHoveredListItem && this.lastHoveredListItem.rowIndex === hoveredListItem.rowIndex && this.lastHoveredListItem.position === hoveredListItem.position) {
      return;
    }
    this.autoScrollService.check(e.event);
    this.clearHoveredItems();
    this.lastHoveredListItem = hoveredListItem;
    (0, import_core21._radioCssClass)(el, LIST_ITEM_HOVERED);
    (0, import_core21._radioCssClass)(el, `ag-item-highlight-${hoveredListItem.position}`);
  }
  getListDragItem(e) {
    const virtualListGui = this.virtualList.getGui();
    const paddingTop = parseFloat(window.getComputedStyle(virtualListGui).paddingTop);
    const rowHeight = this.virtualList.getRowHeight();
    const scrollTop = this.virtualList.getScrollTop();
    const rowIndex = Math.max(0, (e.y - paddingTop + scrollTop) / rowHeight);
    const maxLen = this.params.getNumRows(this.comp) - 1;
    const normalizedRowIndex = Math.min(maxLen, rowIndex) | 0;
    return {
      rowIndex: normalizedRowIndex,
      position: Math.round(rowIndex) > rowIndex || rowIndex > maxLen ? "bottom" : "top",
      component: this.virtualList.getComponentAt(normalizedRowIndex)
    };
  }
  onDragStop() {
    if (this.moveBlocked) {
      return;
    }
    this.params.moveItem(this.currentDragValue, this.lastHoveredListItem);
    this.clearHoveredItems();
    this.autoScrollService.ensureCleared();
  }
  onDragLeave() {
    this.clearHoveredItems();
    this.autoScrollService.ensureCleared();
  }
  clearHoveredItems() {
    const virtualListGui = this.virtualList.getGui();
    virtualListGui.querySelectorAll(`.${LIST_ITEM_HOVERED}`).forEach((el) => {
      [LIST_ITEM_HOVERED, "ag-item-highlight-top", "ag-item-highlight-bottom"].forEach((cls) => {
        el.classList.remove(cls);
      });
    });
    this.lastHoveredListItem = null;
  }
};

// enterprise-modules/core/src/widgets/tabbedLayout.ts
var import_core22 = require("@ag-grid-community/core");
function getTabbedLayoutTemplate(cssClass) {
  return (
    /* html */
    `<div class="ag-tabs ${cssClass}">
        <div data-ref="eHeader"></div>
        <div data-ref="eBody" role="presentation" class="ag-tabs-body ${cssClass ? `${cssClass}-body` : ""}"></div>
    </div>`
  );
}
var TabbedLayout = class extends import_core22.TabGuardComp {
  constructor(params) {
    super(getTabbedLayoutTemplate(params.cssClass));
    this.eHeader = import_core22.RefPlaceholder;
    this.eBody = import_core22.RefPlaceholder;
    this.items = [];
    this.tabbedItemScrollMap = /* @__PURE__ */ new Map();
    this.params = params;
  }
  wireBeans(beans) {
    this.focusService = beans.focusService;
  }
  postConstruct() {
    this.setupHeader();
    if (this.params.items) {
      this.params.items.forEach((item) => this.addItem(item));
    }
    this.initialiseTabGuard({
      onTabKeyDown: this.onTabKeyDown.bind(this),
      handleKeyDown: this.handleKeyDown.bind(this),
      focusInnerElement: this.focusInnerElement.bind(this),
      focusTrapActive: true
    });
    this.addDestroyFunc(() => this.activeItem?.tabbedItem?.afterDetachedCallback?.());
  }
  setupHeader() {
    const { enableCloseButton, cssClass } = this.params;
    const addCssClasses = (el, suffix) => {
      el.classList.add(`ag-tabs-${suffix}`);
      if (cssClass) {
        el.classList.add(`${cssClass}-${suffix}`);
      }
    };
    if (enableCloseButton) {
      this.setupCloseButton(addCssClasses);
      this.eTabHeader = this.gos.getDocument().createElement("div");
      addCssClasses(this.eHeader, "header-wrapper");
      (0, import_core22._setAriaRole)(this.eHeader, "presentation");
      this.eHeader.appendChild(this.eTabHeader);
    } else {
      this.eTabHeader = this.eHeader;
    }
    (0, import_core22._setAriaRole)(this.eTabHeader, "tablist");
    addCssClasses(this.eTabHeader, "header");
  }
  setupCloseButton(addCssClasses) {
    const eDocument = this.gos.getDocument();
    const eCloseButton = eDocument.createElement("button");
    addCssClasses(eCloseButton, "close-button");
    const eIcon = (0, import_core22._createIconNoSpan)("close", this.gos, void 0, true);
    (0, import_core22._setAriaLabel)(eCloseButton, this.params.closeButtonAriaLabel);
    eCloseButton.appendChild(eIcon);
    this.addManagedElementListeners(eCloseButton, { click: () => this.params.onCloseClicked?.() });
    const eCloseButtonWrapper = eDocument.createElement("div");
    addCssClasses(eCloseButtonWrapper, "close-button-wrapper");
    (0, import_core22._setAriaRole)(eCloseButtonWrapper, "presentation");
    eCloseButtonWrapper.appendChild(eCloseButton);
    this.eHeader.appendChild(eCloseButtonWrapper);
    this.eCloseButton = eCloseButton;
  }
  handleKeyDown(e) {
    switch (e.key) {
      case import_core22.KeyCode.RIGHT:
      case import_core22.KeyCode.LEFT: {
        if (!this.eTabHeader.contains(this.gos.getActiveDomElement())) {
          return;
        }
        const isRightKey = e.key === import_core22.KeyCode.RIGHT;
        const isRtl = this.gos.get("enableRtl");
        const currentPosition = this.items.indexOf(this.activeItem);
        const nextPosition = isRightKey !== isRtl ? Math.min(currentPosition + 1, this.items.length - 1) : Math.max(currentPosition - 1, 0);
        if (currentPosition === nextPosition) {
          return;
        }
        e.preventDefault();
        const nextItem = this.items[nextPosition];
        this.showItemWrapper(nextItem);
        nextItem.eHeaderButton.focus();
        break;
      }
      case import_core22.KeyCode.UP:
      case import_core22.KeyCode.DOWN:
        e.stopPropagation();
        break;
    }
  }
  onTabKeyDown(e) {
    if (e.defaultPrevented) {
      return;
    }
    const { focusService, eHeader, eBody, activeItem, params } = this;
    const { suppressTrapFocus, enableCloseButton } = params;
    const activeElement = this.gos.getActiveDomElement();
    const target = e.target;
    const backwards = e.shiftKey;
    if (eHeader.contains(activeElement)) {
      e.preventDefault();
      if (enableCloseButton && backwards && !this.eCloseButton?.contains(activeElement)) {
        this.eCloseButton?.focus();
      } else if (suppressTrapFocus && backwards) {
        this.focusService.findFocusableElementBeforeTabGuard(this.gos.getDocument().body, target)?.focus();
      } else {
        this.focusBody(e.shiftKey);
      }
      return;
    }
    let nextEl = null;
    if (focusService.isTargetUnderManagedComponent(eBody, target)) {
      if (backwards) {
        nextEl = this.focusService.findFocusableElementBeforeTabGuard(eBody, target);
      }
      if (!nextEl && !suppressTrapFocus) {
        nextEl = activeItem.eHeaderButton;
      }
    }
    if (!nextEl && eBody.contains(activeElement)) {
      nextEl = focusService.findNextFocusableElement(eBody, false, backwards);
      if (!nextEl) {
        if (suppressTrapFocus && !backwards) {
          this.forceFocusOutOfContainer(backwards);
        } else if (enableCloseButton && !backwards) {
          e.preventDefault();
          this.eCloseButton?.focus();
        } else {
          e.preventDefault();
          this.focusHeader();
        }
        return;
      }
    }
    if (nextEl) {
      e.preventDefault();
      nextEl.focus();
    }
  }
  focusInnerElement(fromBottom) {
    if (fromBottom) {
      this.focusBody(true);
    } else {
      this.focusHeader();
    }
  }
  focusHeader(preventScroll) {
    this.activeItem.eHeaderButton.focus({ preventScroll });
  }
  focusBody(fromBottom) {
    this.focusService.focusInto(this.eBody, fromBottom);
  }
  setAfterAttachedParams(params) {
    this.afterAttachedParams = params;
  }
  showFirstItem() {
    if (this.items.length > 0) {
      this.showItemWrapper(this.items[0]);
    }
  }
  addItem(item) {
    const eHeaderButton = document.createElement("span");
    (0, import_core22._setAriaRole)(eHeaderButton, "tab");
    eHeaderButton.setAttribute("tabindex", "-1");
    eHeaderButton.appendChild(item.title);
    eHeaderButton.classList.add("ag-tab");
    this.eTabHeader.appendChild(eHeaderButton);
    (0, import_core22._setAriaLabel)(eHeaderButton, item.titleLabel);
    const wrapper = {
      tabbedItem: item,
      eHeaderButton
    };
    this.items.push(wrapper);
    eHeaderButton.addEventListener("click", this.showItemWrapper.bind(this, wrapper));
  }
  showItem(tabbedItem) {
    const itemWrapper = this.items.find((wrapper) => wrapper.tabbedItem === tabbedItem);
    if (itemWrapper) {
      this.showItemWrapper(itemWrapper);
    }
  }
  showItemWrapper(wrapper) {
    const { tabbedItem, eHeaderButton } = wrapper;
    this.params.onItemClicked?.({ item: tabbedItem });
    if (this.activeItem === wrapper) {
      this.params.onActiveItemClicked?.();
      return;
    }
    if (this.lastScrollListener) {
      this.lastScrollListener = this.lastScrollListener();
    }
    (0, import_core22._clearElement)(this.eBody);
    tabbedItem.bodyPromise.then((body) => {
      this.eBody.appendChild(body);
      const onlyUnmanaged = !this.focusService.isKeyboardMode();
      if (!this.params.suppressFocusBodyOnOpen) {
        this.focusService.focusInto(this.eBody, false, onlyUnmanaged);
      }
      if (tabbedItem.afterAttachedCallback) {
        tabbedItem.afterAttachedCallback(this.afterAttachedParams);
      }
      if (this.params.keepScrollPosition) {
        const scrollableContainer = tabbedItem.getScrollableContainer && tabbedItem.getScrollableContainer() || body;
        [this.lastScrollListener] = this.addManagedElementListeners(scrollableContainer, {
          scroll: () => {
            this.tabbedItemScrollMap.set(tabbedItem.name, scrollableContainer.scrollTop);
          }
        });
        const scrollPosition = this.tabbedItemScrollMap.get(tabbedItem.name);
        if (scrollPosition !== void 0) {
          setTimeout(() => {
            scrollableContainer.scrollTop = scrollPosition;
          }, 0);
        }
      }
    });
    if (this.activeItem) {
      this.activeItem.eHeaderButton.classList.remove("ag-tab-selected");
      this.activeItem.tabbedItem.afterDetachedCallback?.();
    }
    eHeaderButton.classList.add("ag-tab-selected");
    this.activeItem = wrapper;
  }
};

// enterprise-modules/core/src/rendering/groupCellRenderer.ts
var import_core24 = require("@ag-grid-community/core");

// enterprise-modules/core/src/rendering/groupCellRendererCtrl.ts
var import_core23 = require("@ag-grid-community/core");
var GroupCellRendererCtrl = class extends import_core23.BeanStub {
  wireBeans(beans) {
    this.expressionService = beans.expressionService;
    this.valueService = beans.valueService;
    this.columnModel = beans.columnModel;
    this.visibleColsService = beans.visibleColsService;
    this.userComponentFactory = beans.userComponentFactory;
    this.ctrlsService = beans.ctrlsService;
    this.funcColsService = beans.funcColsService;
  }
  init(comp, eGui, eCheckbox, eExpanded, eContracted, compClass, params) {
    this.params = params;
    this.eGui = eGui;
    this.eCheckbox = eCheckbox;
    this.eExpanded = eExpanded;
    this.eContracted = eContracted;
    this.comp = comp;
    this.compClass = compClass;
    const { node, colDef } = params;
    const topLevelFooter = this.isTopLevelFooter();
    if (!topLevelFooter) {
      const embeddedRowMismatch = this.isEmbeddedRowMismatch();
      if (embeddedRowMismatch) {
        return;
      }
      if (node.footer && this.gos.get("groupHideOpenParents")) {
        const showRowGroup = colDef && colDef.showRowGroup;
        const rowGroupColumnId = node.rowGroupColumn && node.rowGroupColumn.getColId();
        if (showRowGroup !== rowGroupColumnId) {
          return;
        }
      }
    }
    this.setupShowingValueForOpenedParent();
    this.findDisplayedGroupNode();
    if (!topLevelFooter) {
      const showingFooterTotal = params.node.footer && params.node.rowGroupIndex === this.funcColsService.getRowGroupColumns().findIndex((c) => c.getColId() === params.colDef?.showRowGroup);
      const isAlwaysShowing = this.gos.get("groupDisplayType") != "multipleColumns" || this.gos.get("treeData");
      const showOpenGroupValue = isAlwaysShowing || this.gos.get("showOpenedGroup") && !params.node.footer && (!params.node.group || params.node.rowGroupIndex != null && params.node.rowGroupIndex > this.funcColsService.getRowGroupColumns().findIndex((c) => c.getColId() === params.colDef?.showRowGroup));
      const leafWithValues = !node.group && (this.params.colDef?.field || this.params.colDef?.valueGetter);
      const isExpandable = this.isExpandable();
      const showPivotModeLeafValue = this.columnModel.isPivotMode() && node.leafGroup && node.rowGroupColumn?.getColId() === params.column?.getColDef().showRowGroup;
      const canSkipRenderingCell = !this.showingValueForOpenedParent && !isExpandable && !leafWithValues && !showOpenGroupValue && !showingFooterTotal && !showPivotModeLeafValue;
      if (canSkipRenderingCell) {
        return;
      }
    }
    this.addExpandAndContract();
    this.addFullWidthRowDraggerIfNeeded();
    this.addCheckboxIfNeeded();
    this.addValueElement();
    this.setupIndent();
    this.refreshAriaExpanded();
  }
  getCellAriaRole() {
    const colDefAriaRole = this.params.colDef?.cellAriaRole;
    const columnColDefAriaRole = this.params.column?.getColDef().cellAriaRole;
    return colDefAriaRole || columnColDefAriaRole || "gridcell";
  }
  destroy() {
    super.destroy();
    this.expandListener = null;
  }
  refreshAriaExpanded() {
    const { node, eGridCell } = this.params;
    if (this.expandListener) {
      this.expandListener = this.expandListener();
    }
    if (!this.isExpandable()) {
      (0, import_core23._removeAriaExpanded)(eGridCell);
      return;
    }
    const listener = () => {
      (0, import_core23._setAriaExpanded)(eGridCell, !!node.expanded);
    };
    [this.expandListener] = this.addManagedListeners(node, { expandedChanged: listener }) || null;
    listener();
  }
  isTopLevelFooter() {
    const totalRow = this.gos.getGrandTotalRow();
    if (!totalRow) {
      return false;
    }
    if (this.params.value != null || this.params.node.level != -1) {
      return false;
    }
    const colDef = this.params.colDef;
    const doingFullWidth = colDef == null;
    if (doingFullWidth) {
      return true;
    }
    if (colDef.showRowGroup === true) {
      return true;
    }
    const rowGroupCols = this.funcColsService.getRowGroupColumns();
    if (!rowGroupCols || rowGroupCols.length === 0) {
      return true;
    }
    const firstRowGroupCol = rowGroupCols[0];
    return firstRowGroupCol.getId() === colDef.showRowGroup;
  }
  // if we are doing embedded full width rows, we only show the renderer when
  // in the body, or if pinning in the pinned section, or if pinning and RTL,
  // in the right section. otherwise we would have the cell repeated in each section.
  isEmbeddedRowMismatch() {
    if (!this.params.fullWidth || !this.gos.get("embedFullWidthRows")) {
      return false;
    }
    const pinnedLeftCell = this.params.pinned === "left";
    const pinnedRightCell = this.params.pinned === "right";
    const bodyCell = !pinnedLeftCell && !pinnedRightCell;
    if (this.gos.get("enableRtl")) {
      if (this.visibleColsService.isPinningLeft()) {
        return !pinnedRightCell;
      }
      return !bodyCell;
    }
    if (this.visibleColsService.isPinningLeft()) {
      return !pinnedLeftCell;
    }
    return !bodyCell;
  }
  findDisplayedGroupNode() {
    const column = this.params.column;
    const rowNode = this.params.node;
    if (this.showingValueForOpenedParent) {
      let pointer = rowNode.parent;
      while (pointer != null) {
        if (pointer.rowGroupColumn && column.isRowGroupDisplayed(pointer.rowGroupColumn.getId())) {
          this.displayedGroupNode = pointer;
          break;
        }
        pointer = pointer.parent;
      }
    }
    if ((0, import_core23._missing)(this.displayedGroupNode)) {
      this.displayedGroupNode = rowNode;
    }
  }
  setupShowingValueForOpenedParent() {
    const rowNode = this.params.node;
    const column = this.params.column;
    if (!this.gos.get("groupHideOpenParents")) {
      this.showingValueForOpenedParent = false;
      return;
    }
    if (!rowNode.groupData) {
      this.showingValueForOpenedParent = false;
      return;
    }
    const showingGroupNode = rowNode.rowGroupColumn != null;
    if (showingGroupNode) {
      const keyOfGroupingColumn = rowNode.rowGroupColumn.getId();
      const configuredToShowThisGroupLevel = column.isRowGroupDisplayed(keyOfGroupingColumn);
      if (configuredToShowThisGroupLevel) {
        this.showingValueForOpenedParent = false;
        return;
      }
    }
    const valPresent = rowNode.groupData[column.getId()] != null;
    this.showingValueForOpenedParent = valPresent;
  }
  addValueElement() {
    if (this.displayedGroupNode.footer) {
      this.addFooterValue();
    } else {
      this.addGroupValue();
      this.addChildCount();
    }
  }
  addGroupValue() {
    const paramsAdjusted = this.adjustParamsWithDetailsFromRelatedColumn();
    const innerCompDetails = this.getInnerCompDetails(paramsAdjusted);
    const { valueFormatted, value } = paramsAdjusted;
    let valueWhenNoRenderer = valueFormatted;
    if (valueWhenNoRenderer == null) {
      const isGroupColForNode = this.displayedGroupNode.rowGroupColumn && this.params.column?.isRowGroupDisplayed(this.displayedGroupNode.rowGroupColumn.getId());
      if (this.displayedGroupNode.key === "" && this.displayedGroupNode.group && isGroupColForNode) {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        valueWhenNoRenderer = localeTextFunc("blanks", "(Blanks)");
      } else {
        valueWhenNoRenderer = value ?? null;
      }
    }
    this.comp.setInnerRenderer(innerCompDetails, valueWhenNoRenderer);
  }
  adjustParamsWithDetailsFromRelatedColumn() {
    const relatedColumn = this.displayedGroupNode.rowGroupColumn;
    const column = this.params.column;
    if (!relatedColumn) {
      return this.params;
    }
    const notFullWidth = column != null;
    if (notFullWidth) {
      const showingThisRowGroup = column.isRowGroupDisplayed(relatedColumn.getId());
      if (!showingThisRowGroup) {
        return this.params;
      }
    }
    const params = this.params;
    const { value, node } = this.params;
    const valueFormatted = this.valueService.formatValue(relatedColumn, node, value);
    const paramsAdjusted = {
      ...params,
      valueFormatted
    };
    return paramsAdjusted;
  }
  addFooterValue() {
    let footerValueGetter = this.params.totalValueGetter;
    if (!footerValueGetter) {
      const legacyGetter = this.params.footerValueGetter;
      if (legacyGetter) {
        footerValueGetter = legacyGetter;
        (0, import_core23._warnOnce)("As of v31.3, footerValueGetter is deprecated. Use `totalValueGetter` instead.");
      }
    }
    let footerValue = "";
    if (footerValueGetter) {
      const paramsClone = (0, import_core23._cloneObject)(this.params);
      paramsClone.value = this.params.value;
      if (typeof footerValueGetter === "function") {
        footerValue = footerValueGetter(paramsClone);
      } else if (typeof footerValueGetter === "string") {
        footerValue = this.expressionService.evaluate(footerValueGetter, paramsClone);
      } else {
        (0, import_core23._warnOnce)("footerValueGetter should be either a function or a string (expression)");
      }
    } else {
      const localeTextFunc = this.localeService.getLocaleTextFunc();
      const footerTotalPrefix = localeTextFunc("footerTotal", "Total");
      footerValue = footerTotalPrefix + " " + (this.params.value != null ? this.params.value : "");
    }
    const innerCompDetails = this.getInnerCompDetails(this.params);
    this.comp.setInnerRenderer(innerCompDetails, footerValue);
  }
  getInnerCompDetails(params) {
    if (params.fullWidth) {
      return this.userComponentFactory.getFullWidthGroupRowInnerCellRenderer(
        this.gos.get("groupRowRendererParams"),
        params
      );
    }
    const innerCompDetails = this.userComponentFactory.getInnerRendererDetails(params, params);
    const isGroupRowRenderer = (details) => details && details.componentClass == this.compClass;
    if (innerCompDetails && !isGroupRowRenderer(innerCompDetails)) {
      return innerCompDetails;
    }
    const relatedColumn = this.displayedGroupNode.rowGroupColumn;
    const relatedColDef = relatedColumn ? relatedColumn.getColDef() : void 0;
    if (!relatedColDef) {
      return;
    }
    const relatedCompDetails = this.userComponentFactory.getCellRendererDetails(relatedColDef, params);
    if (relatedCompDetails && !isGroupRowRenderer(relatedCompDetails)) {
      return relatedCompDetails;
    }
    if (isGroupRowRenderer(relatedCompDetails) && relatedColDef.cellRendererParams && relatedColDef.cellRendererParams.innerRenderer) {
      const res = this.userComponentFactory.getInnerRendererDetails(relatedColDef.cellRendererParams, params);
      return res;
    }
  }
  addChildCount() {
    if (this.params.suppressCount) {
      return;
    }
    this.addManagedListeners(this.displayedGroupNode, {
      allChildrenCountChanged: this.updateChildCount.bind(this)
    });
    this.updateChildCount();
  }
  updateChildCount() {
    const allChildrenCount = this.displayedGroupNode.allChildrenCount;
    const showingGroupForThisNode = this.isShowRowGroupForThisRow();
    const showCount = showingGroupForThisNode && allChildrenCount != null && allChildrenCount >= 0;
    const countString = showCount ? `(${allChildrenCount})` : ``;
    this.comp.setChildCount(countString);
  }
  isShowRowGroupForThisRow() {
    if (this.gos.get("treeData")) {
      return true;
    }
    const rowGroupColumn = this.displayedGroupNode.rowGroupColumn;
    if (!rowGroupColumn) {
      return false;
    }
    const column = this.params.column;
    const thisColumnIsInterested = column == null || column.isRowGroupDisplayed(rowGroupColumn.getId());
    return thisColumnIsInterested;
  }
  addExpandAndContract() {
    const params = this.params;
    const eExpandedIcon = (0, import_core23._createIconNoSpan)("groupExpanded", this.gos, null);
    const eContractedIcon = (0, import_core23._createIconNoSpan)("groupContracted", this.gos, null);
    if (eExpandedIcon) {
      this.eExpanded.appendChild(eExpandedIcon);
    }
    if (eContractedIcon) {
      this.eContracted.appendChild(eContractedIcon);
    }
    const eGroupCell = params.eGridCell;
    const isDoubleClickEdit = this.params.column?.isCellEditable(params.node) && this.gos.get("enableGroupEdit");
    if (!isDoubleClickEdit && this.isExpandable() && !params.suppressDoubleClickExpand) {
      this.addManagedListeners(eGroupCell, { dblclick: this.onCellDblClicked.bind(this) });
    }
    this.addManagedListeners(this.eExpanded, { click: this.onExpandClicked.bind(this) });
    this.addManagedListeners(this.eContracted, { click: this.onExpandClicked.bind(this) });
    this.addManagedListeners(eGroupCell, { keydown: this.onKeyDown.bind(this) });
    this.addManagedListeners(params.node, { expandedChanged: this.showExpandAndContractIcons.bind(this) });
    this.showExpandAndContractIcons();
    const expandableChangedListener = this.onRowNodeIsExpandableChanged.bind(this);
    this.addManagedListeners(this.displayedGroupNode, {
      allChildrenCountChanged: expandableChangedListener,
      masterChanged: expandableChangedListener,
      groupChanged: expandableChangedListener,
      hasChildrenChanged: expandableChangedListener
    });
  }
  onExpandClicked(mouseEvent) {
    if ((0, import_core23._isStopPropagationForAgGrid)(mouseEvent)) {
      return;
    }
    (0, import_core23._stopPropagationForAgGrid)(mouseEvent);
    this.onExpandOrContract(mouseEvent);
  }
  onExpandOrContract(e) {
    const rowNode = this.displayedGroupNode;
    const nextExpandState = !rowNode.expanded;
    if (!nextExpandState && rowNode.sticky) {
      this.scrollToStickyNode(rowNode);
    }
    rowNode.setExpanded(nextExpandState, e);
  }
  scrollToStickyNode(rowNode) {
    const gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
    const scrollFeature = gridBodyCtrl.getScrollFeature();
    scrollFeature.setVerticalScrollPosition(rowNode.rowTop - rowNode.stickyRowTop);
  }
  isExpandable() {
    if (this.showingValueForOpenedParent) {
      return true;
    }
    const rowNode = this.displayedGroupNode;
    const reducedLeafNode = this.columnModel.isPivotMode() && rowNode.leafGroup;
    const expandableGroup = rowNode.isExpandable() && !rowNode.footer && !reducedLeafNode;
    if (!expandableGroup) {
      return false;
    }
    const column = this.params.column;
    const displayingForOneColumnOnly = column != null && typeof column.getColDef().showRowGroup === "string";
    if (displayingForOneColumnOnly) {
      const showing = this.isShowRowGroupForThisRow();
      return showing;
    }
    return true;
  }
  showExpandAndContractIcons() {
    const { params, displayedGroupNode: displayedGroup, columnModel } = this;
    const { node } = params;
    const isExpandable = this.isExpandable();
    if (isExpandable) {
      const expanded = this.showingValueForOpenedParent ? true : node.expanded;
      this.comp.setExpandedDisplayed(expanded);
      this.comp.setContractedDisplayed(!expanded);
    } else {
      this.comp.setExpandedDisplayed(false);
      this.comp.setContractedDisplayed(false);
    }
    const pivotMode = columnModel.isPivotMode();
    const pivotModeAndLeafGroup = pivotMode && displayedGroup.leafGroup;
    const addExpandableCss = isExpandable && !pivotModeAndLeafGroup;
    const isTotalFooterNode = node.footer && node.level === -1;
    this.comp.addOrRemoveCssClass("ag-cell-expandable", addExpandableCss);
    this.comp.addOrRemoveCssClass("ag-row-group", addExpandableCss);
    if (pivotMode) {
      this.comp.addOrRemoveCssClass("ag-pivot-leaf-group", !!pivotModeAndLeafGroup);
    } else if (!isTotalFooterNode) {
      this.comp.addOrRemoveCssClass("ag-row-group-leaf-indent", !addExpandableCss);
    }
  }
  onRowNodeIsExpandableChanged() {
    this.showExpandAndContractIcons();
    this.setIndent();
    this.refreshAriaExpanded();
  }
  setupIndent() {
    const node = this.params.node;
    const suppressPadding = this.params.suppressPadding;
    if (!suppressPadding) {
      this.addManagedListeners(node, { uiLevelChanged: this.setIndent.bind(this) });
      this.setIndent();
    }
  }
  setIndent() {
    if (this.gos.get("groupHideOpenParents")) {
      return;
    }
    const params = this.params;
    const rowNode = params.node;
    const fullWithRow = !!params.colDef;
    const treeData = this.gos.get("treeData");
    const manyDimensionThisColumn = !fullWithRow || treeData || params.colDef.showRowGroup === true;
    const paddingCount = manyDimensionThisColumn ? rowNode.uiLevel : 0;
    if (this.indentClass) {
      this.comp.addOrRemoveCssClass(this.indentClass, false);
    }
    this.indentClass = "ag-row-group-indent-" + paddingCount;
    this.comp.addOrRemoveCssClass(this.indentClass, true);
    this.eGui.style.setProperty("--ag-indentation-level", String(paddingCount));
  }
  addFullWidthRowDraggerIfNeeded() {
    if (!this.params.fullWidth || !this.params.rowDrag) {
      return;
    }
    const rowDragComp = new import_core23.RowDragComp(() => this.params.value, this.params.node);
    this.createManagedBean(rowDragComp);
    this.eGui.insertAdjacentElement("afterbegin", rowDragComp.getGui());
  }
  isUserWantsSelected() {
    const paramsCheckbox = this.params.checkbox;
    return typeof paramsCheckbox === "function" || paramsCheckbox === true;
  }
  addCheckboxIfNeeded() {
    const rowNode = this.displayedGroupNode;
    const checkboxNeeded = this.isUserWantsSelected() && // footers cannot be selected
    !rowNode.footer && // pinned rows cannot be selected
    !rowNode.rowPinned && // details cannot be selected
    !rowNode.detail;
    if (checkboxNeeded) {
      const cbSelectionComponent = new import_core23.CheckboxSelectionComponent();
      this.createBean(cbSelectionComponent);
      cbSelectionComponent.init({
        rowNode: this.params.node,
        // when groupHideOpenParents = true and group expanded, we want the checkbox to refer to leaf node state (not group node state)
        column: this.params.column,
        overrides: {
          isVisible: this.params.checkbox,
          callbackParams: this.params,
          removeHidden: true
        }
      });
      this.eCheckbox.appendChild(cbSelectionComponent.getGui());
      this.addDestroyFunc(() => this.destroyBean(cbSelectionComponent));
    }
    this.comp.setCheckboxVisible(checkboxNeeded);
  }
  onKeyDown(event) {
    const isEnterKey = event.key === import_core23.KeyCode.ENTER;
    if (!isEnterKey || this.params.suppressEnterExpand) {
      return;
    }
    const cellEditable = this.params.column && this.params.column.isCellEditable(this.params.node);
    if (cellEditable) {
      return;
    }
    this.onExpandOrContract(event);
  }
  onCellDblClicked(mouseEvent) {
    if ((0, import_core23._isStopPropagationForAgGrid)(mouseEvent)) {
      return;
    }
    const targetIsExpandIcon = (0, import_core23._isElementInEventPath)(this.eExpanded, mouseEvent) || (0, import_core23._isElementInEventPath)(this.eContracted, mouseEvent);
    if (!targetIsExpandIcon) {
      this.onExpandOrContract(mouseEvent);
    }
  }
};

// enterprise-modules/core/src/rendering/groupCellRenderer.ts
var groupTemplate = (
  /* html */
  `<span class="ag-cell-wrapper">
        <span class="ag-group-expanded" data-ref="eExpanded"></span>
        <span class="ag-group-contracted" data-ref="eContracted"></span>
        <span class="ag-group-checkbox ag-invisible" data-ref="eCheckbox"></span>
        <span class="ag-group-value" data-ref="eValue"></span>
        <span class="ag-group-child-count" data-ref="eChildCount"></span>
    </span>`
);
var GroupCellRenderer = class extends import_core24.Component {
  constructor() {
    super(groupTemplate);
    this.eExpanded = import_core24.RefPlaceholder;
    this.eContracted = import_core24.RefPlaceholder;
    this.eCheckbox = import_core24.RefPlaceholder;
    this.eValue = import_core24.RefPlaceholder;
    this.eChildCount = import_core24.RefPlaceholder;
  }
  init(params) {
    const compProxy = {
      setInnerRenderer: (compDetails, valueToDisplay) => this.setRenderDetails(compDetails, valueToDisplay),
      setChildCount: (count) => this.eChildCount.textContent = count,
      addOrRemoveCssClass: (cssClass, value) => this.addOrRemoveCssClass(cssClass, value),
      setContractedDisplayed: (expanded) => (0, import_core24._setDisplayed)(this.eContracted, expanded),
      setExpandedDisplayed: (expanded) => (0, import_core24._setDisplayed)(this.eExpanded, expanded),
      setCheckboxVisible: (visible) => this.eCheckbox.classList.toggle("ag-invisible", !visible)
    };
    const ctrl = this.createManagedBean(new GroupCellRendererCtrl());
    const fullWidth = !params.colDef;
    const eGui = this.getGui();
    ctrl.init(compProxy, eGui, this.eCheckbox, this.eExpanded, this.eContracted, this.constructor, params);
    if (fullWidth) {
      (0, import_core24._setAriaRole)(eGui, ctrl.getCellAriaRole());
    }
  }
  setRenderDetails(compDetails, valueToDisplay) {
    if (compDetails) {
      const componentPromise = compDetails.newAgStackInstance();
      if (componentPromise == null) {
        return;
      }
      componentPromise.then((comp) => {
        if (!comp) {
          return;
        }
        const destroyComp = () => this.destroyBean(comp);
        if (this.isAlive()) {
          this.eValue.appendChild(comp.getGui());
          this.addDestroyFunc(destroyComp);
        } else {
          destroyComp();
        }
      });
    } else {
      this.eValue.innerText = valueToDisplay;
    }
  }
  // this is a user component, and IComponent has "public destroy()" as part of the interface.
  // so we need to have public here instead of private or protected
  destroy() {
    this.destroyBean(this.innerCellRenderer);
    super.destroy();
  }
  refresh() {
    return false;
  }
};
