/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PostConstruct } from '../context/context';
import { KeyCode } from '../constants/keyCode';
import { TabGuardComp } from './tabGuardComp';
export class AgMenuPanel extends TabGuardComp {
    constructor(wrappedComponent) {
        super();
        this.wrappedComponent = wrappedComponent;
        this.setTemplateFromElement(wrappedComponent.getGui());
    }
    postConstruct() {
        this.initialiseTabGuard({
            onTabKeyDown: e => this.onTabKeyDown(e),
            handleKeyDown: e => this.handleKeyDown(e)
        });
    }
    handleKeyDown(e) {
        if (e.key === KeyCode.ESCAPE) {
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
}
__decorate([
    PostConstruct
], AgMenuPanel.prototype, "postConstruct", null);
