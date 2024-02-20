var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { setAriaAtomic, setAriaLive, setAriaRelevant } from "../utils/aria";
import { clearElement } from "../utils/dom";
import { debounce } from "../utils/function";
var AriaAnnouncementService = /** @class */ (function (_super) {
    __extends(AriaAnnouncementService, _super);
    function AriaAnnouncementService() {
        var _this = _super.call(this) || this;
        _this.descriptionContainer = null;
        _this.announceValue = debounce(_this.announceValue.bind(_this), 200);
        return _this;
    }
    AriaAnnouncementService.prototype.postConstruct = function () {
        var eDocument = this.gridOptionsService.getDocument();
        var div = this.descriptionContainer = eDocument.createElement('div');
        div.classList.add('ag-aria-description-container');
        setAriaLive(div, 'polite');
        setAriaRelevant(div, 'additions text');
        setAriaAtomic(div, true);
        this.eGridDiv.appendChild(div);
    };
    AriaAnnouncementService.prototype.announceValue = function (value) {
        var _this = this;
        if (!this.descriptionContainer) {
            return;
        }
        // screen readers announce a change in content, so we set it to an empty value
        // and then use a setTimeout to force the Screen Reader announcement 
        this.descriptionContainer.textContent = '';
        setTimeout(function () {
            _this.descriptionContainer.textContent = value;
        }, 50);
    };
    AriaAnnouncementService.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        var descriptionContainer = this.descriptionContainer;
        if (descriptionContainer) {
            clearElement(descriptionContainer);
            if (descriptionContainer.parentElement) {
                descriptionContainer.parentElement.removeChild(descriptionContainer);
            }
        }
        this.descriptionContainer = null;
        this.eGridDiv = null;
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
    return AriaAnnouncementService;
}(BeanStub));
export { AriaAnnouncementService };
