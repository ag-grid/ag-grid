/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isBrowser, isNode, patchClass, patchOnProperties, zoneSymbol} from '../common/utils';

import * as webSocketPatch from './websocket';

const eventNames =
    'copy cut paste abort blur focus canplay canplaythrough change click contextmenu dblclick drag dragend dragenter dragleave dragover dragstart drop durationchange emptied ended input invalid keydown keypress keyup load loadeddata loadedmetadata loadstart message mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup pause play playing progress ratechange reset scroll seeked seeking select show stalled submit suspend timeupdate volumechange waiting mozfullscreenchange mozfullscreenerror mozpointerlockchange mozpointerlockerror error webglcontextrestored webglcontextlost webglcontextcreationerror'
        .split(' ');

export function propertyDescriptorPatch(_global) {
  if (isNode) {
    return;
  }

  const supportsWebSocket = typeof WebSocket !== 'undefined';
  if (canPatchViaPropertyDescriptor()) {
    // for browsers that we can patch the descriptor:  Chrome & Firefox
    if (isBrowser) {
      patchOnProperties(HTMLElement.prototype, eventNames);
    }
    patchOnProperties(XMLHttpRequest.prototype, null);
    if (typeof IDBIndex !== 'undefined') {
      patchOnProperties(IDBIndex.prototype, null);
      patchOnProperties(IDBRequest.prototype, null);
      patchOnProperties(IDBOpenDBRequest.prototype, null);
      patchOnProperties(IDBDatabase.prototype, null);
      patchOnProperties(IDBTransaction.prototype, null);
      patchOnProperties(IDBCursor.prototype, null);
    }
    if (supportsWebSocket) {
      patchOnProperties(WebSocket.prototype, null);
    }
  } else {
    // Safari, Android browsers (Jelly Bean)
    patchViaCapturingAllTheEvents();
    patchClass('XMLHttpRequest');
    if (supportsWebSocket) {
      webSocketPatch.apply(_global);
    }
  }
}

function canPatchViaPropertyDescriptor() {
  if (isBrowser && !Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'onclick') &&
      typeof Element !== 'undefined') {
    // WebKit https://bugs.webkit.org/show_bug.cgi?id=134364
    // IDL interface attributes are not configurable
    const desc = Object.getOwnPropertyDescriptor(Element.prototype, 'onclick');
    if (desc && !desc.configurable) return false;
  }

  Object.defineProperty(XMLHttpRequest.prototype, 'onreadystatechange', {
    get: function() {
      return true;
    }
  });
  const req = new XMLHttpRequest();
  const result = !!req.onreadystatechange;
  Object.defineProperty(XMLHttpRequest.prototype, 'onreadystatechange', {});
  return result;
};

const unboundKey = zoneSymbol('unbound');

// Whenever any eventListener fires, we check the eventListener target and all parents
// for `onwhatever` properties and replace them with zone-bound functions
// - Chrome (for now)
function patchViaCapturingAllTheEvents() {
  for (let i = 0; i < eventNames.length; i++) {
    const property = eventNames[i];
    const onproperty = 'on' + property;
    self.addEventListener(property, function(event) {
      let elt = <Node>event.target, bound, source;
      if (elt) {
        source = elt.constructor['name'] + '.' + onproperty;
      } else {
        source = 'unknown.' + onproperty;
      }
      while (elt) {
        if (elt[onproperty] && !elt[onproperty][unboundKey]) {
          bound = Zone.current.wrap(elt[onproperty], source);
          bound[unboundKey] = elt[onproperty];
          elt[onproperty] = bound;
        }
        elt = elt.parentElement;
      }
    }, true);
  };
};
