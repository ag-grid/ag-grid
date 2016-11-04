/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Host, Input, Optional, Renderer, forwardRef } from '@angular/core';
import { MapWrapper } from '../facade/collection';
import { isBlank, isPresent, isPrimitive, looseIdentical } from '../facade/lang';
import { NG_VALUE_ACCESSOR } from './control_value_accessor';
export var SELECT_MULTIPLE_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return SelectMultipleControlValueAccessor; }),
    multi: true
};
function _buildValueString(id, value) {
    if (isBlank(id))
        return "" + value;
    if (typeof value === 'string')
        value = "'" + value + "'";
    if (!isPrimitive(value))
        value = 'Object';
    return (id + ": " + value).slice(0, 50);
}
function _extractId(valueString) {
    return valueString.split(':')[0];
}
/** Mock interface for HTMLCollection */
var HTMLCollection = (function () {
    function HTMLCollection() {
    }
    return HTMLCollection;
}());
/**
 * The accessor for writing a value and listening to changes on a select element.
 *
 * @stable
 */
export var SelectMultipleControlValueAccessor = (function () {
    function SelectMultipleControlValueAccessor(_renderer, _elementRef) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        /** @internal */
        this._optionMap = new Map();
        /** @internal */
        this._idCounter = 0;
        this.onChange = function (_) { };
        this.onTouched = function () { };
    }
    SelectMultipleControlValueAccessor.prototype.writeValue = function (value) {
        var _this = this;
        this.value = value;
        if (value == null)
            return;
        var values = value;
        // convert values to ids
        var ids = values.map(function (v) { return _this._getOptionId(v); });
        this._optionMap.forEach(function (opt, o) { opt._setSelected(ids.indexOf(o.toString()) > -1); });
    };
    SelectMultipleControlValueAccessor.prototype.registerOnChange = function (fn) {
        var _this = this;
        this.onChange = function (_) {
            var selected = [];
            if (_.hasOwnProperty('selectedOptions')) {
                var options = _.selectedOptions;
                for (var i = 0; i < options.length; i++) {
                    var opt = options.item(i);
                    var val = _this._getOptionValue(opt.value);
                    selected.push(val);
                }
            }
            else {
                var options = _.options;
                for (var i = 0; i < options.length; i++) {
                    var opt = options.item(i);
                    if (opt.selected) {
                        var val = _this._getOptionValue(opt.value);
                        selected.push(val);
                    }
                }
            }
            fn(selected);
        };
    };
    SelectMultipleControlValueAccessor.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
    SelectMultipleControlValueAccessor.prototype.setDisabledState = function (isDisabled) {
        this._renderer.setElementProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
    };
    /** @internal */
    SelectMultipleControlValueAccessor.prototype._registerOption = function (value) {
        var id = (this._idCounter++).toString();
        this._optionMap.set(id, value);
        return id;
    };
    /** @internal */
    SelectMultipleControlValueAccessor.prototype._getOptionId = function (value) {
        for (var _i = 0, _a = MapWrapper.keys(this._optionMap); _i < _a.length; _i++) {
            var id = _a[_i];
            if (looseIdentical(this._optionMap.get(id)._value, value))
                return id;
        }
        return null;
    };
    /** @internal */
    SelectMultipleControlValueAccessor.prototype._getOptionValue = function (valueString) {
        var opt = this._optionMap.get(_extractId(valueString));
        return isPresent(opt) ? opt._value : valueString;
    };
    SelectMultipleControlValueAccessor.decorators = [
        { type: Directive, args: [{
                    selector: 'select[multiple][formControlName],select[multiple][formControl],select[multiple][ngModel]',
                    host: { '(change)': 'onChange($event.target)', '(blur)': 'onTouched()' },
                    providers: [SELECT_MULTIPLE_VALUE_ACCESSOR]
                },] },
    ];
    /** @nocollapse */
    SelectMultipleControlValueAccessor.ctorParameters = [
        { type: Renderer, },
        { type: ElementRef, },
    ];
    return SelectMultipleControlValueAccessor;
}());
/**
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * ### Example
 *
 * ```
 * <select multiple name="city" ngModel>
 *   <option *ngFor="let c of cities" [value]="c"></option>
 * </select>
 * ```
 */
export var NgSelectMultipleOption = (function () {
    function NgSelectMultipleOption(_element, _renderer, _select) {
        this._element = _element;
        this._renderer = _renderer;
        this._select = _select;
        if (isPresent(this._select)) {
            this.id = this._select._registerOption(this);
        }
    }
    Object.defineProperty(NgSelectMultipleOption.prototype, "ngValue", {
        set: function (value) {
            if (this._select == null)
                return;
            this._value = value;
            this._setElementValue(_buildValueString(this.id, value));
            this._select.writeValue(this._select.value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgSelectMultipleOption.prototype, "value", {
        set: function (value) {
            if (isPresent(this._select)) {
                this._value = value;
                this._setElementValue(_buildValueString(this.id, value));
                this._select.writeValue(this._select.value);
            }
            else {
                this._setElementValue(value);
            }
        },
        enumerable: true,
        configurable: true
    });
    /** @internal */
    NgSelectMultipleOption.prototype._setElementValue = function (value) {
        this._renderer.setElementProperty(this._element.nativeElement, 'value', value);
    };
    /** @internal */
    NgSelectMultipleOption.prototype._setSelected = function (selected) {
        this._renderer.setElementProperty(this._element.nativeElement, 'selected', selected);
    };
    NgSelectMultipleOption.prototype.ngOnDestroy = function () {
        if (isPresent(this._select)) {
            this._select._optionMap.delete(this.id);
            this._select.writeValue(this._select.value);
        }
    };
    NgSelectMultipleOption.decorators = [
        { type: Directive, args: [{ selector: 'option' },] },
    ];
    /** @nocollapse */
    NgSelectMultipleOption.ctorParameters = [
        { type: ElementRef, },
        { type: Renderer, },
        { type: SelectMultipleControlValueAccessor, decorators: [{ type: Optional }, { type: Host },] },
    ];
    NgSelectMultipleOption.propDecorators = {
        'ngValue': [{ type: Input, args: ['ngValue',] },],
        'value': [{ type: Input, args: ['value',] },],
    };
    return NgSelectMultipleOption;
}());
export var SELECT_DIRECTIVES = [SelectMultipleControlValueAccessor, NgSelectMultipleOption];
//# sourceMappingURL=select_multiple_control_value_accessor.js.map