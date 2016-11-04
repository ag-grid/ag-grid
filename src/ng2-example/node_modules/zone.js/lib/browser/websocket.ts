/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {patchEventTargetMethods, patchOnProperties} from '../common/utils';

// we have to patch the instance since the proto is non-configurable
export function apply(_global: any) {
  const WS = (<any>_global).WebSocket;
  // On Safari window.EventTarget doesn't exist so need to patch WS add/removeEventListener
  // On older Chrome, no need since EventTarget was already patched
  if (!(<any>_global).EventTarget) {
    patchEventTargetMethods(WS.prototype);
  }
  (<any>_global).WebSocket = function(a, b) {
    const socket = arguments.length > 1 ? new WS(a, b) : new WS(a);
    let proxySocket;

    // Safari 7.0 has non-configurable own 'onmessage' and friends properties on the socket instance
    const onmessageDesc = Object.getOwnPropertyDescriptor(socket, 'onmessage');
    if (onmessageDesc && onmessageDesc.configurable === false) {
      proxySocket = Object.create(socket);
      ['addEventListener', 'removeEventListener', 'send', 'close'].forEach(function(propName) {
        proxySocket[propName] = function() {
          return socket[propName].apply(socket, arguments);
        };
      });
    } else {
      // we can patch the real socket
      proxySocket = socket;
    }

    patchOnProperties(proxySocket, ['close', 'error', 'message', 'open']);

    return proxySocket;
  };
  for (var prop in WS) {
    _global.WebSocket[prop] = WS[prop];
  }
}
