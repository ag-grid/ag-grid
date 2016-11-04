/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export var ViewFactoryDependency = (function () {
    function ViewFactoryDependency(comp, placeholder) {
        this.comp = comp;
        this.placeholder = placeholder;
    }
    return ViewFactoryDependency;
}());
export var ComponentFactoryDependency = (function () {
    function ComponentFactoryDependency(comp, placeholder) {
        this.comp = comp;
        this.placeholder = placeholder;
    }
    return ComponentFactoryDependency;
}());
export var DirectiveWrapperDependency = (function () {
    function DirectiveWrapperDependency(dir, placeholder) {
        this.dir = dir;
        this.placeholder = placeholder;
    }
    return DirectiveWrapperDependency;
}());
//# sourceMappingURL=deps.js.map