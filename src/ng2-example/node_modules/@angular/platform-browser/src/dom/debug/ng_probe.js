/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ApplicationRef, NgZone, Optional, RootRenderer, getDebugNode, isDevMode } from '@angular/core';
import { StringMapWrapper } from '../../facade/collection';
import { DebugDomRootRenderer } from '../../private_import_core';
import { getDOM } from '../dom_adapter';
import { DomRootRenderer } from '../dom_renderer';
var CORE_TOKENS = {
    'ApplicationRef': ApplicationRef,
    'NgZone': NgZone
};
var INSPECT_GLOBAL_NAME = 'ng.probe';
var CORE_TOKENS_GLOBAL_NAME = 'ng.coreTokens';
/**
 * Returns a {@link DebugElement} for the given native DOM element, or
 * null if the given native element does not have an Angular view associated
 * with it.
 */
export function inspectNativeElement(element /** TODO #9100 */) {
    return getDebugNode(element);
}
/**
 * @experimental
 */
export var NgProbeToken = (function () {
    function NgProbeToken(name, token) {
        this.name = name;
        this.token = token;
    }
    return NgProbeToken;
}());
export function _createConditionalRootRenderer(rootRenderer /** TODO #9100 */, extraTokens) {
    if (isDevMode()) {
        return _createRootRenderer(rootRenderer, extraTokens);
    }
    return rootRenderer;
}
function _createRootRenderer(rootRenderer /** TODO #9100 */, extraTokens) {
    getDOM().setGlobalVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
    getDOM().setGlobalVar(CORE_TOKENS_GLOBAL_NAME, StringMapWrapper.merge(CORE_TOKENS, _ngProbeTokensToMap(extraTokens || [])));
    return new DebugDomRootRenderer(rootRenderer);
}
function _ngProbeTokensToMap(tokens) {
    return tokens.reduce(function (prev, t) { return (prev[t.name] = t.token, prev); }, {});
}
/**
 * Providers which support debugging Angular applications (e.g. via `ng.probe`).
 */
export var ELEMENT_PROBE_PROVIDERS = [{
        provide: RootRenderer,
        useFactory: _createConditionalRootRenderer,
        deps: [DomRootRenderer, [NgProbeToken, new Optional()]]
    }];
export var ELEMENT_PROBE_PROVIDERS_PROD_MODE = [{
        provide: RootRenderer,
        useFactory: _createRootRenderer,
        deps: [DomRootRenderer, [NgProbeToken, new Optional()]]
    }];
//# sourceMappingURL=ng_probe.js.map