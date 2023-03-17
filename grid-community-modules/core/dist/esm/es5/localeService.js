/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean } from "./context/context";
import { BeanStub } from "./context/beanStub";
var LocaleService = /** @class */ (function (_super) {
    __extends(LocaleService, _super);
    function LocaleService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LocaleService.prototype.getLocaleTextFunc = function () {
        var getLocaleText = this.gridOptionsService.getCallback('getLocaleText');
        if (getLocaleText) {
            //key: string, defaultValue: string, variableValues?: string[]
            return function (key, defaultValue, variableValues) {
                var params = {
                    key: key,
                    defaultValue: defaultValue,
                    variableValues: variableValues
                };
                return getLocaleText(params);
            };
        }
        var localeTextFunc = this.gridOptionsService.get('localeTextFunc');
        if (localeTextFunc) {
            return localeTextFunc;
        }
        var localeText = this.gridOptionsService.get('localeText');
        return function (key, defaultValue, variableValues) {
            var localisedText = localeText && localeText[key];
            if (localisedText && variableValues && variableValues.length) {
                var found = 0;
                while (true) {
                    if (found >= variableValues.length) {
                        break;
                    }
                    var idx = localisedText.indexOf('${variable}');
                    if (idx === -1) {
                        break;
                    }
                    localisedText = localisedText.replace('${variable}', variableValues[found++]);
                }
            }
            return localisedText !== null && localisedText !== void 0 ? localisedText : defaultValue;
        };
    };
    LocaleService = __decorate([
        Bean('localeService')
    ], LocaleService);
    return LocaleService;
}(BeanStub));
export { LocaleService };
