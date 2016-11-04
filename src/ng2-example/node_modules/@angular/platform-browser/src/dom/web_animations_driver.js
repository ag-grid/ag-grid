/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AUTO_STYLE } from '@angular/core';
import { isPresent } from '../facade/lang';
import { dashCaseToCamelCase } from './util';
import { WebAnimationsPlayer } from './web_animations_player';
export var WebAnimationsDriver = (function () {
    function WebAnimationsDriver() {
    }
    WebAnimationsDriver.prototype.animate = function (element, startingStyles, keyframes, duration, delay, easing) {
        var formattedSteps = [];
        var startingStyleLookup = {};
        if (isPresent(startingStyles) && startingStyles.styles.length > 0) {
            startingStyleLookup = _populateStyles(element, startingStyles, {});
            startingStyleLookup['offset'] = 0;
            formattedSteps.push(startingStyleLookup);
        }
        keyframes.forEach(function (keyframe) {
            var data = _populateStyles(element, keyframe.styles, startingStyleLookup);
            data['offset'] = keyframe.offset;
            formattedSteps.push(data);
        });
        // this is a special case when only styles are applied as an
        // animation. When this occurs we want to animate from start to
        // end with the same values. Removing the offset and having only
        // start/end values is suitable enough for the web-animations API
        if (formattedSteps.length == 1) {
            var start = formattedSteps[0];
            start['offset'] = null;
            formattedSteps = [start, start];
        }
        var playerOptions = {
            'duration': duration,
            'delay': delay,
            'fill': 'both' // we use `both` because it allows for styling at 0% to work with `delay`
        };
        // we check for this to avoid having a null|undefined value be present
        // for the easing (which results in an error for certain browsers #9752)
        if (easing) {
            playerOptions['easing'] = easing;
        }
        return new WebAnimationsPlayer(element, formattedSteps, playerOptions);
    };
    return WebAnimationsDriver;
}());
function _populateStyles(element, styles, defaultStyles) {
    var data = {};
    styles.styles.forEach(function (entry) {
        Object.keys(entry).forEach(function (prop) {
            var val = entry[prop];
            var formattedProp = dashCaseToCamelCase(prop);
            data[formattedProp] =
                val == AUTO_STYLE ? val : val.toString() + _resolveStyleUnit(val, prop, formattedProp);
        });
    });
    Object.keys(defaultStyles).forEach(function (prop) {
        if (!isPresent(data[prop])) {
            data[prop] = defaultStyles[prop];
        }
    });
    return data;
}
function _resolveStyleUnit(val, userProvidedProp, formattedProp) {
    var unit = '';
    if (_isPixelDimensionStyle(formattedProp) && val != 0 && val != '0') {
        if (typeof val === 'number') {
            unit = 'px';
        }
        else if (_findDimensionalSuffix(val.toString()).length == 0) {
            throw new Error('Please provide a CSS unit value for ' + userProvidedProp + ':' + val);
        }
    }
    return unit;
}
var _$0 = 48;
var _$9 = 57;
var _$PERIOD = 46;
function _findDimensionalSuffix(value) {
    for (var i = 0; i < value.length; i++) {
        var c = value.charCodeAt(i);
        if ((c >= _$0 && c <= _$9) || c == _$PERIOD)
            continue;
        return value.substring(i, value.length);
    }
    return '';
}
function _isPixelDimensionStyle(prop) {
    switch (prop) {
        case 'width':
        case 'height':
        case 'minWidth':
        case 'minHeight':
        case 'maxWidth':
        case 'maxHeight':
        case 'left':
        case 'top':
        case 'bottom':
        case 'right':
        case 'fontSize':
        case 'outlineWidth':
        case 'outlineOffset':
        case 'paddingTop':
        case 'paddingLeft':
        case 'paddingBottom':
        case 'paddingRight':
        case 'marginTop':
        case 'marginLeft':
        case 'marginBottom':
        case 'marginRight':
        case 'borderRadius':
        case 'borderWidth':
        case 'borderTopWidth':
        case 'borderLeftWidth':
        case 'borderRightWidth':
        case 'borderBottomWidth':
        case 'textIndent':
            return true;
        default:
            return false;
    }
}
//# sourceMappingURL=web_animations_driver.js.map