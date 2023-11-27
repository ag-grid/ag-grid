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
import { Autowired, PostConstruct } from "../context/context";
import { Events } from "../eventKeys";
import { bindCellRendererToHtmlElement } from "../utils/dom";
import { Component } from "./component";
import { escapeString } from "../utils/string";
import { exists } from "../utils/generic";
import { setAriaActiveDescendant, setAriaSelected } from "../utils/aria";
var RichSelectRow = /** @class */ (function (_super) {
    __extends(RichSelectRow, _super);
    function RichSelectRow(params, wrapperEl) {
        var _this = _super.call(this, /* html */ "<div class=\"ag-rich-select-row\" role=\"presentation\"></div>") || this;
        _this.params = params;
        _this.wrapperEl = wrapperEl;
        return _this;
    }
    RichSelectRow.prototype.postConstruct = function () {
        this.addManagedListener(this.getGui(), 'mouseup', this.onMouseUp.bind(this));
    };
    RichSelectRow.prototype.setState = function (value) {
        var formattedValue = '';
        if (this.params.valueFormatter) {
            formattedValue = this.params.valueFormatter(value);
        }
        var rendererSuccessful = this.populateWithRenderer(value, formattedValue);
        if (!rendererSuccessful) {
            this.populateWithoutRenderer(value, formattedValue);
        }
        this.value = value;
    };
    RichSelectRow.prototype.highlightString = function (matchString) {
        var parsedValue = this.parsedValue;
        if (this.params.cellRenderer || !exists(parsedValue)) {
            return;
        }
        var hasMatch = exists(matchString);
        if (hasMatch) {
            var index = parsedValue === null || parsedValue === void 0 ? void 0 : parsedValue.toLocaleLowerCase().indexOf(matchString.toLocaleLowerCase());
            if (index >= 0) {
                var highlightEndIndex = index + matchString.length;
                var startPart = escapeString(parsedValue.slice(0, index), true);
                var highlightedPart = escapeString(parsedValue.slice(index, highlightEndIndex), true);
                var endPart = escapeString(parsedValue.slice(highlightEndIndex));
                this.renderValueWithoutRenderer("".concat(startPart, "<span class=\"ag-rich-select-row-text-highlight\">").concat(highlightedPart, "</span>").concat(endPart));
            }
            else {
                hasMatch = false;
            }
        }
        if (!hasMatch) {
            this.renderValueWithoutRenderer(parsedValue);
        }
    };
    RichSelectRow.prototype.updateHighlighted = function (highlighted) {
        var _a;
        var eGui = this.getGui();
        var parentId = "ag-rich-select-row-".concat(this.getCompId());
        (_a = eGui.parentElement) === null || _a === void 0 ? void 0 : _a.setAttribute('id', parentId);
        if (highlighted) {
            var parentAriaEl = this.getParentComponent().getAriaElement();
            setAriaActiveDescendant(parentAriaEl, parentId);
            this.wrapperEl.setAttribute('data-active-option', parentId);
        }
        setAriaSelected(eGui.parentElement, highlighted);
        this.addOrRemoveCssClass('ag-rich-select-row-selected', highlighted);
    };
    RichSelectRow.prototype.populateWithoutRenderer = function (value, valueFormatted) {
        var eDocument = this.gridOptionsService.getDocument();
        var eGui = this.getGui();
        var span = eDocument.createElement('span');
        span.style.overflow = 'hidden';
        span.style.textOverflow = 'ellipsis';
        var parsedValue = escapeString(exists(valueFormatted) ? valueFormatted : value, true);
        this.parsedValue = exists(parsedValue) ? parsedValue : null;
        eGui.appendChild(span);
        this.renderValueWithoutRenderer(parsedValue);
    };
    RichSelectRow.prototype.renderValueWithoutRenderer = function (value) {
        var span = this.getGui().querySelector('span');
        if (!span) {
            return;
        }
        span.innerHTML = exists(value) ? value : '&nbsp;';
    };
    RichSelectRow.prototype.populateWithRenderer = function (value, valueFormatted) {
        var _this = this;
        // bad coder here - we are not populating all values of the cellRendererParams
        var cellRendererPromise;
        var userCompDetails;
        if (this.params.cellRenderer) {
            userCompDetails = this.userComponentFactory.getCellRendererDetails(this.params, {
                value: value,
                valueFormatted: valueFormatted,
                api: this.gridOptionsService.api
            });
        }
        if (userCompDetails) {
            cellRendererPromise = userCompDetails.newAgStackInstance();
        }
        if (cellRendererPromise) {
            bindCellRendererToHtmlElement(cellRendererPromise, this.getGui());
        }
        if (cellRendererPromise) {
            cellRendererPromise.then(function (childComponent) {
                _this.addDestroyFunc(function () {
                    _this.getContext().destroyBean(childComponent);
                });
            });
            return true;
        }
        return false;
    };
    RichSelectRow.prototype.onMouseUp = function () {
        var parent = this.getParentComponent();
        var event = {
            type: Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
            fromEnterKey: false,
            value: this.value
        };
        parent === null || parent === void 0 ? void 0 : parent.dispatchEvent(event);
    };
    __decorate([
        Autowired('userComponentFactory')
    ], RichSelectRow.prototype, "userComponentFactory", void 0);
    __decorate([
        PostConstruct
    ], RichSelectRow.prototype, "postConstruct", null);
    return RichSelectRow;
}(Component));
export { RichSelectRow };
