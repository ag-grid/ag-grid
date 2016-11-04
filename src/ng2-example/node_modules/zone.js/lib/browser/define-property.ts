/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {zoneSymbol} from '../common/utils';
/*
 * This is necessary for Chrome and Chrome mobile, to enable
 * things like redefining `createdCallback` on an element.
 */

const _defineProperty = Object[zoneSymbol('defineProperty')] = Object.defineProperty;
const _getOwnPropertyDescriptor = Object[zoneSymbol('getOwnPropertyDescriptor')] =
    Object.getOwnPropertyDescriptor;
const _create = Object.create;
const unconfigurablesKey = zoneSymbol('unconfigurables');

export function propertyPatch() {
  Object.defineProperty = function(obj, prop, desc) {
    if (isUnconfigurable(obj, prop)) {
      throw new TypeError('Cannot assign to read only property \'' + prop + '\' of ' + obj);
    }
    const originalConfigurableFlag = desc.configurable;
    if (prop !== 'prototype') {
      desc = rewriteDescriptor(obj, prop, desc);
    }
    return _tryDefineProperty(obj, prop, desc, originalConfigurableFlag);
  };

  Object.defineProperties = function(obj, props) {
    Object.keys(props).forEach(function(prop) {
      Object.defineProperty(obj, prop, props[prop]);
    });
    return obj;
  };

  Object.create = <any>function(obj, proto) {
    if (typeof proto === 'object' && !Object.isFrozen(proto)) {
      Object.keys(proto).forEach(function(prop) {
        proto[prop] = rewriteDescriptor(obj, prop, proto[prop]);
      });
    }
    return _create(obj, proto);
  };

  Object.getOwnPropertyDescriptor = function(obj, prop) {
    const desc = _getOwnPropertyDescriptor(obj, prop);
    if (isUnconfigurable(obj, prop)) {
      desc.configurable = false;
    }
    return desc;
  };
};

export function _redefineProperty(obj, prop, desc) {
  const originalConfigurableFlag = desc.configurable;
  desc = rewriteDescriptor(obj, prop, desc);
  return _tryDefineProperty(obj, prop, desc, originalConfigurableFlag);
};

function isUnconfigurable(obj, prop) {
  return obj && obj[unconfigurablesKey] && obj[unconfigurablesKey][prop];
}

function rewriteDescriptor(obj, prop, desc) {
  desc.configurable = true;
  if (!desc.configurable) {
    if (!obj[unconfigurablesKey]) {
      _defineProperty(obj, unconfigurablesKey, {writable: true, value: {}});
    }
    obj[unconfigurablesKey][prop] = true;
  }
  return desc;
}

function _tryDefineProperty(obj, prop, desc, originalConfigurableFlag) {
  try {
    return _defineProperty(obj, prop, desc);
  } catch (e) {
    if (desc.configurable) {
      // In case of errors, when the configurable flag was likely set by rewriteDescriptor(), let's
      // retry with the original flag value
      if (typeof originalConfigurableFlag == 'undefined') {
        delete desc.configurable;
      } else {
        desc.configurable = originalConfigurableFlag;
      }
      try {
        return _defineProperty(obj, prop, desc);
      } catch (e) {
        var descJson: string = null;
        try {
          descJson = JSON.stringify(desc);
        } catch (e) {
          descJson = descJson.toString();
        }
        console.log(`Attempting to configure '${prop}' with descriptor '${descJson
                    }' on object '${obj}' and got error, giving up: ${e}`);
      }
    } else {
      throw e;
    }
  }
}
