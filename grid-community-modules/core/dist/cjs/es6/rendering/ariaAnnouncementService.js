"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AriaAnnouncementService = void 0;
const beanStub_1 = require("../context/beanStub");
const context_1 = require("../context/context");
const aria_1 = require("../utils/aria");
const dom_1 = require("../utils/dom");
const function_1 = require("../utils/function");
let AriaAnnouncementService = class AriaAnnouncementService extends beanStub_1.BeanStub {
    constructor() {
        super();
        this.descriptionContainer = null;
        this.announceValue = (0, function_1.debounce)(this.announceValue.bind(this), 200);
    }
    postConstruct() {
        const eDocument = this.gridOptionsService.getDocument();
        const div = this.descriptionContainer = eDocument.createElement('div');
        div.classList.add('ag-aria-description-container');
        (0, aria_1.setAriaLive)(div, 'polite');
        (0, aria_1.setAriaRelevant)(div, 'additions text');
        (0, aria_1.setAriaAtomic)(div, true);
        this.eGridDiv.appendChild(div);
    }
    announceValue(value) {
        if (!this.descriptionContainer) {
            return;
        }
        // screen readers announce a change in content, so we set it to an empty value
        // and then use a setTimeout to force the Screen Reader announcement 
        this.descriptionContainer.textContent = '';
        setTimeout(() => {
            this.descriptionContainer.textContent = value;
        }, 50);
    }
    destroy() {
        super.destroy();
        const { descriptionContainer } = this;
        if (descriptionContainer) {
            (0, dom_1.clearElement)(descriptionContainer);
            if (descriptionContainer.parentElement) {
                descriptionContainer.parentElement.removeChild(descriptionContainer);
            }
        }
        this.descriptionContainer = null;
        this.eGridDiv = null;
    }
};
__decorate([
    (0, context_1.Autowired)('eGridDiv')
], AriaAnnouncementService.prototype, "eGridDiv", void 0);
__decorate([
    context_1.PostConstruct
], AriaAnnouncementService.prototype, "postConstruct", null);
AriaAnnouncementService = __decorate([
    (0, context_1.Bean)('ariaAnnouncementService')
], AriaAnnouncementService);
exports.AriaAnnouncementService = AriaAnnouncementService;
