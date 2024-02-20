var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../context/beanStub.mjs";
import { Autowired, Bean, PostConstruct } from "../context/context.mjs";
import { setAriaAtomic, setAriaLive, setAriaRelevant } from "../utils/aria.mjs";
import { clearElement } from "../utils/dom.mjs";
import { debounce } from "../utils/function.mjs";
let AriaAnnouncementService = class AriaAnnouncementService extends BeanStub {
    constructor() {
        super();
        this.descriptionContainer = null;
        this.announceValue = debounce(this.announceValue.bind(this), 200);
    }
    postConstruct() {
        const eDocument = this.gridOptionsService.getDocument();
        const div = this.descriptionContainer = eDocument.createElement('div');
        div.classList.add('ag-aria-description-container');
        setAriaLive(div, 'polite');
        setAriaRelevant(div, 'additions text');
        setAriaAtomic(div, true);
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
            clearElement(descriptionContainer);
            if (descriptionContainer.parentElement) {
                descriptionContainer.parentElement.removeChild(descriptionContainer);
            }
        }
        this.descriptionContainer = null;
        this.eGridDiv = null;
    }
};
__decorate([
    Autowired('eGridDiv')
], AriaAnnouncementService.prototype, "eGridDiv", void 0);
__decorate([
    PostConstruct
], AriaAnnouncementService.prototype, "postConstruct", null);
AriaAnnouncementService = __decorate([
    Bean('ariaAnnouncementService')
], AriaAnnouncementService);
export { AriaAnnouncementService };
