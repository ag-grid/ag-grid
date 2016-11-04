/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {makeZoneAwareAddListener, makeZoneAwareListeners, makeZoneAwareRemoveListener, patchMethod} from '../common/utils';


// For EventEmitter
const EE_ADD_LISTENER = 'addListener';
const EE_PREPEND_LISTENER = 'prependListener';
const EE_REMOVE_LISTENER = 'removeListener';
const EE_LISTENERS = 'listeners';
const EE_ON = 'on';


const zoneAwareAddListener =
    makeZoneAwareAddListener(EE_ADD_LISTENER, EE_REMOVE_LISTENER, false, true);
const zoneAwarePrependListener =
    makeZoneAwareAddListener(EE_PREPEND_LISTENER, EE_REMOVE_LISTENER, false, true);
const zoneAwareRemoveListener = makeZoneAwareRemoveListener(EE_REMOVE_LISTENER, false);
const zoneAwareListeners = makeZoneAwareListeners(EE_LISTENERS);

export function patchEventEmitterMethods(obj: any): boolean {
  if (obj && obj.addListener) {
    patchMethod(obj, EE_ADD_LISTENER, () => zoneAwareAddListener);
    patchMethod(obj, EE_PREPEND_LISTENER, () => zoneAwarePrependListener);
    patchMethod(obj, EE_REMOVE_LISTENER, () => zoneAwareRemoveListener);
    patchMethod(obj, EE_LISTENERS, () => zoneAwareListeners);
    obj[EE_ON] = obj[EE_ADD_LISTENER];
    return true;
  } else {
    return false;
  }
}

// EventEmitter
let events;
try {
  events = require('events');
} catch (err) {
}

if (events && events.EventEmitter) {
  patchEventEmitterMethods(events.EventEmitter.prototype);
}