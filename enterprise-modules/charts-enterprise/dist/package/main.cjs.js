var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// enterprise-modules/charts-enterprise/src/main.ts
var main_exports = {};
module.exports = __toCommonJS(main_exports);
var import_core = require("@ag-grid-enterprise/core");
var import_ag_charts_enterprise = require("ag-charts-enterprise");
var import_ag_charts_enterprise2 = require("ag-charts-enterprise");
__reExport(main_exports, require("@ag-grid-enterprise/charts"), module.exports);
import_ag_charts_enterprise.AgCharts.setGridContext(true);
import_core.LicenseManager.setChartsLicenseManager(import_ag_charts_enterprise.AgCharts);
//# sourceMappingURL=main.cjs.js.map
