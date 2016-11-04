/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Pipe } from '@angular/core';
import { isBlank } from '../facade/lang';
import { NgLocalization, getPluralCategory } from '../localization';
import { InvalidPipeArgumentError } from './invalid_pipe_argument_error';
var _INTERPOLATION_REGEXP = /#/g;
/**
 * @ngModule CommonModule
 * @whatItDoes Maps a value to a string that pluralizes the value according to locale rules.
 * @howToUse `expression | i18nPlural:mapping`
 * @description
 *
 *  Where:
 *  - `expression` is a number.
 *  - `mapping` is an object that mimics the ICU format, see
 *    http://userguide.icu-project.org/formatparse/messages
 *
 *  ## Example
 *
 * {@example common/pipes/ts/i18n_pipe.ts region='I18nPluralPipeComponent'}
 *
 * @experimental
 */
export var I18nPluralPipe = (function () {
    function I18nPluralPipe(_localization) {
        this._localization = _localization;
    }
    I18nPluralPipe.prototype.transform = function (value, pluralMap) {
        if (isBlank(value))
            return '';
        if (typeof pluralMap !== 'object' || pluralMap === null) {
            throw new InvalidPipeArgumentError(I18nPluralPipe, pluralMap);
        }
        var key = getPluralCategory(value, Object.keys(pluralMap), this._localization);
        return pluralMap[key].replace(_INTERPOLATION_REGEXP, value.toString());
    };
    I18nPluralPipe.decorators = [
        { type: Pipe, args: [{ name: 'i18nPlural', pure: true },] },
    ];
    /** @nocollapse */
    I18nPluralPipe.ctorParameters = [
        { type: NgLocalization, },
    ];
    return I18nPluralPipe;
}());
//# sourceMappingURL=i18n_plural_pipe.js.map