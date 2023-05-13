/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean } from "./context/context";
import { BeanStub } from "./context/beanStub";
let LocaleService = class LocaleService extends BeanStub {
    getLocaleTextFunc() {
        const getLocaleText = this.gridOptionsService.getCallback('getLocaleText');
        if (getLocaleText) {
            //key: string, defaultValue: string, variableValues?: string[]
            return (key, defaultValue, variableValues) => {
                const params = {
                    key,
                    defaultValue,
                    variableValues
                };
                return getLocaleText(params);
            };
        }
        const localeTextFunc = this.gridOptionsService.get('localeTextFunc');
        if (localeTextFunc) {
            return localeTextFunc;
        }
        const localeText = this.gridOptionsService.get('localeText');
        return (key, defaultValue, variableValues) => {
            let localisedText = localeText && localeText[key];
            if (localisedText && variableValues && variableValues.length) {
                let found = 0;
                while (true) {
                    if (found >= variableValues.length) {
                        break;
                    }
                    const idx = localisedText.indexOf('${variable}');
                    if (idx === -1) {
                        break;
                    }
                    localisedText = localisedText.replace('${variable}', variableValues[found++]);
                }
            }
            return localisedText !== null && localisedText !== void 0 ? localisedText : defaultValue;
        };
    }
};
LocaleService = __decorate([
    Bean('localeService')
], LocaleService);
export { LocaleService };
