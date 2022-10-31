/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
import { loadTemplate } from "../../utils/dom";
let AgComponentUtils = class AgComponentUtils extends BeanStub {
    adaptFunction(propertyName, jsCompFunc) {
        const metadata = this.componentMetadataProvider.retrieve(propertyName);
        if (metadata && metadata.functionAdapter) {
            return metadata.functionAdapter(jsCompFunc);
        }
        return null;
    }
    adaptCellRendererFunction(callback) {
        class Adapter {
            refresh(params) {
                return false;
            }
            getGui() {
                return this.eGui;
            }
            init(params) {
                const callbackResult = callback(params);
                const type = typeof callbackResult;
                if (type === 'string' || type === 'number' || type === 'boolean') {
                    this.eGui = loadTemplate('<span>' + callbackResult + '</span>');
                    return;
                }
                if (callbackResult == null) {
                    this.eGui = loadTemplate('<span></span>');
                    return;
                }
                this.eGui = callbackResult;
            }
        }
        return Adapter;
    }
    doesImplementIComponent(candidate) {
        if (!candidate) {
            return false;
        }
        return candidate.prototype && 'getGui' in candidate.prototype;
    }
};
__decorate([
    Autowired("componentMetadataProvider")
], AgComponentUtils.prototype, "componentMetadataProvider", void 0);
AgComponentUtils = __decorate([
    Bean("agComponentUtils")
], AgComponentUtils);
export { AgComponentUtils };
