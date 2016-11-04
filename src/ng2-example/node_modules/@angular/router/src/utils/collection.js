/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';
import { concatAll } from 'rxjs/operator/concatAll';
import { every } from 'rxjs/operator/every';
import * as l from 'rxjs/operator/last';
import { map } from 'rxjs/operator/map';
import { mergeAll } from 'rxjs/operator/mergeAll';
import { PRIMARY_OUTLET } from '../shared';
export function shallowEqualArrays(a, b) {
    if (a.length !== b.length)
        return false;
    for (var i = 0; i < a.length; ++i) {
        if (!shallowEqual(a[i], b[i]))
            return false;
    }
    return true;
}
export function shallowEqual(a, b) {
    var k1 = Object.keys(a);
    var k2 = Object.keys(b);
    if (k1.length != k2.length) {
        return false;
    }
    var key;
    for (var i = 0; i < k1.length; i++) {
        key = k1[i];
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}
export function flatten(a) {
    var target = [];
    for (var i = 0; i < a.length; ++i) {
        for (var j = 0; j < a[i].length; ++j) {
            target.push(a[i][j]);
        }
    }
    return target;
}
export function first(a) {
    return a.length > 0 ? a[0] : null;
}
export function last(a) {
    return a.length > 0 ? a[a.length - 1] : null;
}
export function and(bools) {
    return bools.reduce(function (a, b) { return a && b; }, true);
}
export function merge(m1, m2) {
    var m = {};
    for (var attr in m1) {
        if (m1.hasOwnProperty(attr)) {
            m[attr] = m1[attr];
        }
    }
    for (var attr in m2) {
        if (m2.hasOwnProperty(attr)) {
            m[attr] = m2[attr];
        }
    }
    return m;
}
export function forEach(map, callback) {
    for (var prop in map) {
        if (map.hasOwnProperty(prop)) {
            callback(map[prop], prop);
        }
    }
}
export function waitForMap(obj, fn) {
    var waitFor = [];
    var res = {};
    forEach(obj, function (a, k) {
        if (k === PRIMARY_OUTLET) {
            waitFor.push(map.call(fn(k, a), function (_) {
                res[k] = _;
                return _;
            }));
        }
    });
    forEach(obj, function (a, k) {
        if (k !== PRIMARY_OUTLET) {
            waitFor.push(map.call(fn(k, a), function (_) {
                res[k] = _;
                return _;
            }));
        }
    });
    if (waitFor.length > 0) {
        var concatted$ = concatAll.call(of.apply(void 0, waitFor));
        var last$ = l.last.call(concatted$);
        return map.call(last$, function () { return res; });
    }
    else {
        return of(res);
    }
}
export function andObservables(observables) {
    var merged$ = mergeAll.call(observables);
    return every.call(merged$, function (result) { return result === true; });
}
export function wrapIntoObservable(value) {
    if (value instanceof Observable) {
        return value;
    }
    else if (value instanceof Promise) {
        return fromPromise(value);
    }
    else {
        return of(value);
    }
}
//# sourceMappingURL=collection.js.map