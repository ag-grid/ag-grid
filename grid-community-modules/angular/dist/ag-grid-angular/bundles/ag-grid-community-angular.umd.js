(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@ag-grid-community/core')) :
    typeof define === 'function' && define.amd ? define('@ag-grid-community/angular', ['exports', '@angular/core', '@ag-grid-community/core'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global["ag-grid-community"] = global["ag-grid-community"] || {}, global["ag-grid-community"].angular = {}), global.ng.core, global.agGrid));
})(this, (function (exports, i0, core) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var i0__namespace = /*#__PURE__*/_interopNamespace(i0);

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
        function accept(f) { if (f !== void 0 && typeof f !== "function")
            throw new TypeError("Function expected"); return f; }
        var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
        var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
        var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
        var _, done = false;
        for (var i = decorators.length - 1; i >= 0; i--) {
            var context = {};
            for (var p in contextIn)
                context[p] = p === "access" ? {} : contextIn[p];
            for (var p in contextIn.access)
                context.access[p] = contextIn.access[p];
            context.addInitializer = function (f) { if (done)
                throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
            var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
            if (kind === "accessor") {
                if (result === void 0)
                    continue;
                if (result === null || typeof result !== "object")
                    throw new TypeError("Object expected");
                if (_ = accept(result.get))
                    descriptor.get = _;
                if (_ = accept(result.set))
                    descriptor.set = _;
                if (_ = accept(result.init))
                    initializers.push(_);
            }
            else if (_ = accept(result)) {
                if (kind === "field")
                    initializers.push(_);
                else
                    descriptor[key] = _;
            }
        }
        if (target)
            Object.defineProperty(target, contextIn.name, descriptor);
        done = true;
    }
    ;
    function __runInitializers(thisArg, initializers, value) {
        var useValue = arguments.length > 2;
        for (var i = 0; i < initializers.length; i++) {
            value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
        }
        return useValue ? value : void 0;
    }
    ;
    function __propKey(x) {
        return typeof x === "symbol" ? x : "".concat(x);
    }
    ;
    function __setFunctionName(f, name, prefix) {
        if (typeof name === "symbol")
            name = name.description ? "[".concat(name.description, "]") : "";
        return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
    }
    ;
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
            desc = { enumerable: true, get: function () { return m[k]; } };
        }
        Object.defineProperty(o, k2, desc);
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    /** @deprecated */
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2)
            for (var i = 0, l = from.length, ar; i < l; i++) {
                if (ar || !(i in from)) {
                    if (!ar)
                        ar = Array.prototype.slice.call(from, 0, i);
                    ar[i] = from[i];
                }
            }
        return to.concat(ar || Array.prototype.slice.call(from));
    }
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }
    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m")
            throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }
    function __classPrivateFieldIn(state, receiver) {
        if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function"))
            throw new TypeError("Cannot use 'in' operator on non-object");
        return typeof state === "function" ? receiver === state : state.has(receiver);
    }

    var AngularFrameworkOverrides = /** @class */ (function (_super) {
        __extends(AngularFrameworkOverrides, _super);
        function AngularFrameworkOverrides(_ngZone) {
            var _this = _super.call(this) || this;
            _this._ngZone = _ngZone;
            return _this;
        }
        AngularFrameworkOverrides.prototype.setEmitterUsedCallback = function (isEmitterUsed) {
            this.isEmitterUsed = isEmitterUsed;
        };
        AngularFrameworkOverrides.prototype.setTimeout = function (action, timeout) {
            if (this._ngZone) {
                this._ngZone.runOutsideAngular(function () {
                    window.setTimeout(function () {
                        action();
                    }, timeout);
                });
            }
            else {
                window.setTimeout(function () {
                    action();
                }, timeout);
            }
        };
        AngularFrameworkOverrides.prototype.setInterval = function (action, interval) {
            var _this = this;
            return new core.AgPromise(function (resolve) {
                if (_this._ngZone) {
                    _this._ngZone.runOutsideAngular(function () {
                        resolve(window.setInterval(function () {
                            action();
                        }, interval));
                    });
                }
                else {
                    resolve(window.setInterval(function () {
                        action();
                    }, interval));
                }
            });
        };
        AngularFrameworkOverrides.prototype.addEventListener = function (element, eventType, listener, useCapture) {
            if (this.isOutsideAngular(eventType) && this._ngZone) {
                this._ngZone.runOutsideAngular(function () {
                    element.addEventListener(eventType, listener, useCapture);
                });
            }
            else {
                element.addEventListener(eventType, listener, useCapture);
            }
        };
        AngularFrameworkOverrides.prototype.dispatchEvent = function (eventType, listener, global) {
            if (global === void 0) { global = false; }
            if (this.isOutsideAngular(eventType)) {
                if (this._ngZone) {
                    this._ngZone.runOutsideAngular(listener);
                }
                else {
                    listener();
                }
            }
            else if (this.isEmitterUsed(eventType) || global) {
                // only trigger off events (and potentially change detection) if actually used
                if (!i0.NgZone.isInAngularZone() && this._ngZone) {
                    this._ngZone.run(listener);
                }
                else {
                    listener();
                }
            }
        };
        AngularFrameworkOverrides.prototype.isFrameworkComponent = function (comp) {
            if (!comp) {
                return false;
            }
            var prototype = comp.prototype;
            var isAngularComp = prototype && 'agInit' in prototype;
            return isAngularComp;
        };
        return AngularFrameworkOverrides;
    }(core.VanillaFrameworkOverrides));
    AngularFrameworkOverrides.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: AngularFrameworkOverrides, deps: [{ token: i0__namespace.NgZone }], target: i0__namespace.ɵɵFactoryTarget.Injectable });
    AngularFrameworkOverrides.ɵprov = i0__namespace.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: AngularFrameworkOverrides });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: AngularFrameworkOverrides, decorators: [{
                type: i0.Injectable
            }], ctorParameters: function () { return [{ type: i0__namespace.NgZone }]; } });

    var AngularFrameworkComponentWrapper = /** @class */ (function (_super) {
        __extends(AngularFrameworkComponentWrapper, _super);
        function AngularFrameworkComponentWrapper() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AngularFrameworkComponentWrapper.prototype.setViewContainerRef = function (viewContainerRef) {
            this.viewContainerRef = viewContainerRef;
        };
        AngularFrameworkComponentWrapper.prototype.setComponentFactoryResolver = function (componentFactoryResolver) {
            this.componentFactoryResolver = componentFactoryResolver;
        };
        AngularFrameworkComponentWrapper.prototype.createWrapper = function (OriginalConstructor) {
            var that = this;
            var DynamicAgNg2Component = /** @class */ (function (_super) {
                __extends(DynamicAgNg2Component, _super);
                function DynamicAgNg2Component() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                DynamicAgNg2Component.prototype.init = function (params) {
                    _super.prototype.init.call(this, params);
                    this._componentRef.changeDetectorRef.detectChanges();
                };
                DynamicAgNg2Component.prototype.createComponent = function () {
                    return that.createComponent(OriginalConstructor);
                };
                DynamicAgNg2Component.prototype.hasMethod = function (name) {
                    return wrapper.getFrameworkComponentInstance()[name] != null;
                };
                DynamicAgNg2Component.prototype.callMethod = function (name, args) {
                    var componentRef = this.getFrameworkComponentInstance();
                    return wrapper.getFrameworkComponentInstance()[name].apply(componentRef, args);
                };
                DynamicAgNg2Component.prototype.addMethod = function (name, callback) {
                    wrapper[name] = callback;
                };
                return DynamicAgNg2Component;
            }(BaseGuiComponent));
            var wrapper = new DynamicAgNg2Component();
            return wrapper;
        };
        AngularFrameworkComponentWrapper.prototype.createComponent = function (componentType) {
            // used to cache the factory, but this a) caused issues when used with either webpack/angularcli with --prod
            // but more significantly, the underlying implementation of resolveComponentFactory uses a map too, so us
            // caching the factory here yields no performance benefits
            var factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
            return this.viewContainerRef.createComponent(factory);
        };
        return AngularFrameworkComponentWrapper;
    }(core.BaseComponentWrapper));
    AngularFrameworkComponentWrapper.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: AngularFrameworkComponentWrapper, deps: null, target: i0__namespace.ɵɵFactoryTarget.Injectable });
    AngularFrameworkComponentWrapper.ɵprov = i0__namespace.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: AngularFrameworkComponentWrapper });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: AngularFrameworkComponentWrapper, decorators: [{
                type: i0.Injectable
            }] });
    var BaseGuiComponent = /** @class */ (function () {
        function BaseGuiComponent() {
        }
        BaseGuiComponent.prototype.init = function (params) {
            this._params = params;
            this._componentRef = this.createComponent();
            this._agAwareComponent = this._componentRef.instance;
            this._frameworkComponentInstance = this._componentRef.instance;
            this._eGui = this._componentRef.location.nativeElement;
            this._agAwareComponent.agInit(this._params);
        };
        BaseGuiComponent.prototype.getGui = function () {
            return this._eGui;
        };
        BaseGuiComponent.prototype.destroy = function () {
            if (this._frameworkComponentInstance && typeof this._frameworkComponentInstance.destroy === 'function') {
                this._frameworkComponentInstance.destroy();
            }
            if (this._componentRef) {
                this._componentRef.destroy();
            }
        };
        BaseGuiComponent.prototype.getFrameworkComponentInstance = function () {
            return this._frameworkComponentInstance;
        };
        return BaseGuiComponent;
    }());

    var AgGridAngular = /** @class */ (function () {
        function AgGridAngular(elementDef, viewContainerRef, angularFrameworkOverrides, frameworkComponentWrapper, componentFactoryResolver) {
            this.viewContainerRef = viewContainerRef;
            this.angularFrameworkOverrides = angularFrameworkOverrides;
            this.frameworkComponentWrapper = frameworkComponentWrapper;
            this.componentFactoryResolver = componentFactoryResolver;
            this._initialised = false;
            this._destroyed = false;
            // in order to ensure firing of gridReady is deterministic
            this._fullyReady = core.AgPromise.resolve(true);
            // @START@
            /** Specifies the status bar components to use in the status bar.     */
            this.statusBar = undefined;
            /** Specifies the side bar components.     */
            this.sideBar = undefined;
            /** Set to `true` to not show the context menu. Use if you don't want to use the default 'right click' context menu. Default: `false`      */
            this.suppressContextMenu = undefined;
            /** When using `suppressContextMenu`, you can use the `onCellContextMenu` function to provide your own code to handle cell `contextmenu` events.
                 * This flag is useful to prevent the browser from showing its default context menu.
                 * Default: `false`
                 */
            this.preventDefaultOnContextMenu = undefined;
            /** Allows context menu to show, even when `Ctrl` key is held down. Default: `false`      */
            this.allowContextMenuWithControlKey = undefined;
            /** Set to `true` to always show the column menu button, rather than only showing when the mouse is over the column header. Default: `false`     */
            this.suppressMenuHide = undefined;
            /** Set to `true` to use the browser's default tooltip instead of using the grid's Tooltip Component. Default: `false`      */
            this.enableBrowserTooltips = undefined;
            /** The delay in milliseconds that it takes for tooltips to show up once an element is hovered over.
                 *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
                 * Default: `2000`
                 */
            this.tooltipShowDelay = undefined;
            /** The delay in milliseconds that it takes for tooltips to hide once they have been displayed.
                 *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
                 * Default: `10000`
                 */
            this.tooltipHideDelay = undefined;
            /** Set to `true` to have tooltips follow the cursor once they are displayed. Default: `false`      */
            this.tooltipMouseTrack = undefined;
            /** DOM element to use as the popup parent for grid popups (context menu, column menu etc).     */
            this.popupParent = undefined;
            /** Set to `true` to also include headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false`     */
            this.copyHeadersToClipboard = undefined;
            /** Set to `true` to also include group headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false`     */
            this.copyGroupHeadersToClipboard = undefined;
            /** Specify the delimiter to use when copying to clipboard.
                 * Default: `\t`
                */
            this.clipboardDelimiter = undefined;
            /** Set to `true` to copy the cell range or focused cell to the clipboard and never the selected rows. Default: `false`     */
            this.suppressCopyRowsToClipboard = undefined;
            /** Set to `true` to copy rows instead of ranges when a range with only a single cell is selected. Default: `false`     */
            this.suppressCopySingleCellRanges = undefined;
            /** Set to `true` to work around a bug with Excel (Windows) that adds an extra empty line at the end of ranges copied to the clipboard. Default: `false`     */
            this.suppressLastEmptyLineOnPaste = undefined;
            /** Set to `true` to turn off paste operations within the grid. Default: `false`     */
            this.suppressClipboardPaste = undefined;
            /** Set to `true` to stop the grid trying to use the Clipboard API, if it is blocked, and immediately fallback to the workaround. Default: `false`     */
            this.suppressClipboardApi = undefined;
            /** Set to `true` to block     **cut** operations within the grid. Default: `false`     */
            this.suppressCutToClipboard = undefined;
            /** Array of Column / Column Group definitions.     */
            this.columnDefs = undefined;
            /** A default column definition. Items defined in the actual column definitions get precedence.     */
            this.defaultColDef = undefined;
            /** A default column group definition. All column group definitions will use these properties. Items defined in the actual column group definition get precedence.     */
            this.defaultColGroupDef = undefined;
            /** An object map of custom column types which contain groups of properties that column definitions can inherit by referencing in their `type` property.     */
            this.columnTypes = undefined;
            /** Keeps the order of Columns maintained after new Column Definitions are updated. Default: `false`     */
            this.maintainColumnOrder = undefined;
            /** If `true`, then dots in field names (e.g. `'address.firstLine'`) are not treated as deep references. Allows you to use dots in your field name if you prefer. Default: `false`     */
            this.suppressFieldDotNotation = undefined;
            /** The height in pixels for the row containing the column label header. If not specified, it uses the theme value of `header-height`.     */
            this.headerHeight = undefined;
            /** The height in pixels for the rows containing header column groups. If not specified, it uses `headerHeight`.     */
            this.groupHeaderHeight = undefined;
            /** The height in pixels for the row containing the floating filters. If not specified, it uses the theme value of `header-height`.     */
            this.floatingFiltersHeight = undefined;
            /** The height in pixels for the row containing the columns when in pivot mode. If not specified, it uses `headerHeight`.     */
            this.pivotHeaderHeight = undefined;
            /** The height in pixels for the row containing header column groups when in pivot mode. If not specified, it uses `groupHeaderHeight`.     */
            this.pivotGroupHeaderHeight = undefined;
            /** Allow reordering and pinning columns by dragging columns from the Columns Tool Panel to the grid. Default: `false`     */
            this.allowDragFromColumnsToolPanel = undefined;
            /** Set to `true` to suppress column moving, i.e. to make the columns fixed position. Default: `false`     */
            this.suppressMovableColumns = undefined;
            /** If `true`, the `ag-column-moving` class is not added to the grid while columns are moving. In the default themes, this results in no animation when moving columns. Default: `false`     */
            this.suppressColumnMoveAnimation = undefined;
            /** If `true`, when you drag a column out of the grid (e.g. to the group zone) the column is not hidden. Default: `false`     */
            this.suppressDragLeaveHidesColumns = undefined;
            /** If `true`, when you drag a column into a row group panel the column is not hidden. Default: `false`     */
            this.suppressRowGroupHidesColumns = undefined;
            /** Set to `'shift'` to have shift-resize as the default resize operation (same as user holding down `Shift` while resizing).     */
            this.colResizeDefault = undefined;
            /** Suppresses auto-sizing columns for columns. In other words, double clicking a column's header's edge will not auto-size. Default: `false`     */
            this.suppressAutoSize = undefined;
            /** Number of pixels to add to a column width after the [auto-sizing](/column-sizing/#auto-size-columns) calculation.
                 * Set this if you want to add extra room to accommodate (for example) sort icons, or some other dynamic nature of the header.
                 * Default: `20`
                 */
            this.autoSizePadding = undefined;
            /** Set this to `true` to skip the `headerName` when `autoSize` is called by default. Default: `false`     */
            this.skipHeaderOnAutoSize = undefined;
            /** A map of component names to components.     */
            this.components = undefined;
            /** @deprecated As of v27, use `components` for framework components too.     */
            this.frameworkComponents = undefined;
            /** Set to `'fullRow'` to enable Full Row Editing. Otherwise leave blank to edit one cell at a time.     */
            this.editType = undefined;
            /** Set to `true` to enable Single Click Editing for cells, to start editing with a single click. Default: `false`     */
            this.singleClickEdit = undefined;
            /** Set to `true` so that neither single nor double click starts editing. Default: `false`     */
            this.suppressClickEdit = undefined;
            /** Set to `true` to stop the grid updating data after `Edit`, `Clipboard` and `Fill Handle` operations. When this is set, it is intended the application will update the data, eg in an external immutable store, and then pass the new dataset to the grid. <br />**Note:** `rowNode.setDataValue()` does not update the value of the cell when this is `True`, it fires `onCellEditRequest` instead. Default: `false`.         */
            this.readOnlyEdit = undefined;
            /** Set this to `true` to stop cell editing when grid loses focus.
                 * The default is that the grid stays editing until focus goes onto another cell.
                 * Default: `false`
                 */
            this.stopEditingWhenCellsLoseFocus = undefined;
            /** Set to `true` along with `enterMovesDownAfterEdit` to have Excel-style behaviour for the `Enter` key.
                 * i.e. pressing the `Enter` key will move down to the cell beneath.
                 * Default: `false`
                 */
            this.enterMovesDown = undefined;
            /** Set to `true` along with `enterMovesDown` to have Excel-style behaviour for the 'Enter' key.
                 * i.e. pressing the Enter key will move down to the cell beneath.
                 * Default: `false`
                 */
            this.enterMovesDownAfterEdit = undefined;
            /** Forces Cell Editing to start when backspace is pressed. This is only relevant for MacOS users.     */
            this.enableCellEditingOnBackspace = undefined;
            /** Set to `true` to enable Undo / Redo while editing.     */
            this.undoRedoCellEditing = undefined;
            /** Set the size of the undo / redo stack. Default: `10`     */
            this.undoRedoCellEditingLimit = undefined;
            /** A default configuration object used to export to CSV.     */
            this.defaultCsvExportParams = undefined;
            /** Prevents the user from exporting the grid to CSV. Default: `false`     */
            this.suppressCsvExport = undefined;
            /** A default configuration object used to export to Excel.     */
            this.defaultExcelExportParams = undefined;
            /** Prevents the user from exporting the grid to Excel. Default: `false`     */
            this.suppressExcelExport = undefined;
            /** A list (array) of Excel styles to be used when exporting to Excel with styles.     */
            this.excelStyles = undefined;
            /** Rows are filtered using this text as a Quick Filter.     */
            this.quickFilterText = undefined;
            /** Set to `true` to turn on the Quick Filter cache, used to improve performance when using the Quick Filter. Default: `false`     */
            this.cacheQuickFilter = undefined;
            /** Set to `true` to exclude hidden columns from being checked by the Quick Filter.
                 * This can give a significant performance improvement when there are a large number of hidden columns,
                 * and you are only interested in filtering on what's visible. Default: `false`
                 */
            this.excludeHiddenColumnsFromQuickFilter = undefined;
            /** Set to `true` to override the default tree data filtering behaviour to instead exclude child nodes from filter results. Default: `false`     */
            this.excludeChildrenWhenTreeDataFiltering = undefined;
            /** Set to `true` to Enable Charts. Default: `false`     */
            this.enableCharts = undefined;
            /** The list of chart themes to be used.     */
            this.chartThemes = undefined;
            /** A map containing custom chart themes.     */
            this.customChartThemes = undefined;
            /** Chart theme overrides applied to all themes.     */
            this.chartThemeOverrides = undefined;
            /** @deprecated As of v29, no longer used. To suppress use `suppressChartToolPanelsButton`.     */
            this.enableChartToolPanelsButton = undefined;
            /** Set to `true` to show the 'hamburger' menu option from the Chart Toolbar and display the remaining toolbar buttons. Default: `false`     */
            this.suppressChartToolPanelsButton = undefined;
            /** Allows customisation of the Chart Tool Panels, such as changing the tool panels visibility and order, as well as choosing which charts should be displayed in the settings panel.     */
            this.chartToolPanelsDef = undefined;
            /** Provide your own loading cell renderer to use when data is loading via a DataSource.
                * See [Loading Cell Renderer](https://www.ag-grid.com/javascript-data-grid/component-loading-cell-renderer/) for framework specific implementation details.
                */
            this.loadingCellRenderer = undefined;
            /** @deprecated As of v27, use `loadingCellRenderer` for framework components too.     */
            this.loadingCellRendererFramework = undefined;
            /** Params to be passed to the `loadingCellRenderer` component.     */
            this.loadingCellRendererParams = undefined;
            /** Callback to select which loading cell renderer to be used when data is loading via a DataSource.     */
            this.loadingCellRendererSelector = undefined;
            /** A map of key->value pairs for localising text within the grid.     */
            this.localeText = undefined;
            /** Set to `true` to enable Master Detail. Default: `false`     */
            this.masterDetail = undefined;
            /** Set to `true` to keep detail rows for when they are displayed again. Default: `false`     */
            this.keepDetailRows = undefined;
            /** Sets the number of details rows to keep. Default: `10`     */
            this.keepDetailRowsCount = undefined;
            /** Provide a custom `detailCellRenderer` to use when a master row is expanded.
                * See [Detail Cell Renderer](https://www.ag-grid.com/javascript-data-grid/master-detail-custom-detail/) for framework specific implementation details.
                */
            this.detailCellRenderer = undefined;
            /** @deprecated As of v27, use `detailCellRenderer` for framework components too.     */
            this.detailCellRendererFramework = undefined;
            /** Specifies the params to be used by the Detail Cell Renderer. Can also be a function that provides the params to enable dynamic definitions of the params.     */
            this.detailCellRendererParams = undefined;
            /** Set fixed height in pixels for each detail row.     */
            this.detailRowHeight = undefined;
            /** Set to `true` to have the detail grid dynamically change it's height to fit it's rows.     */
            this.detailRowAutoHeight = undefined;
            /** Provides a context object that is provided to different callbacks the grid uses. Used for passing additional information to the callbacks by your application.     */
            this.context = undefined;
            /** A list of grids to treat as Aligned Grids. If grids are aligned then the columns and horizontal scrolling will be kept in sync.     */
            this.alignedGrids = undefined;
            /** Change this value to set the tabIndex order of the Grid within your application. Default: `0`     */
            this.tabIndex = undefined;
            /** The number of rows rendered outside the viewable area the grid renders.
                 * Having a buffer means the grid will have rows ready to show as the user slowly scrolls vertically.
                 * Default: `10`
                 */
            this.rowBuffer = undefined;
            /** Set to `true` to turn on the value cache. Default: `false`     */
            this.valueCache = undefined;
            /** Set to `true` to configure the value cache to not expire after data updates. Default: `false`     */
            this.valueCacheNeverExpires = undefined;
            /** Set to `true` to allow cell expressions. Default: `false`     */
            this.enableCellExpressions = undefined;
            /** If `true`, row nodes do not have their parents set.
                 * The grid doesn't use the parent reference, but it is included to help the client code navigate the node tree if it wants by providing bi-direction navigation up and down the tree.
                 * If this is a problem (e.g. if you need to convert the tree to JSON, which does not allow cyclic dependencies) then set this to `true`.
                 * Default: `false`
                 */
            this.suppressParentsInRowNodes = undefined;
            /** Disables touch support (but does not remove the browser's efforts to simulate mouse events on touch). Default: `false`     */
            this.suppressTouch = undefined;
            /** Set to `true` to not set focus back on the grid after a refresh. This can avoid issues where you want to keep the focus on another part of the browser. Default: `false`     */
            this.suppressFocusAfterRefresh = undefined;
            /** Disables the asynchronous nature of the events introduced in v10, and makes them synchronous. This property only exists for the purpose of supporting legacy code which has a dependency on synchronous events from earlier versions (v9 or earlier) of AG Grid.     **It is strongly recommended that you do not change this property unless you have legacy issues.** Default: `false`     */
            this.suppressAsyncEvents = undefined;
            /** The grid will check for `ResizeObserver` and use it if it exists in the browser, otherwise it will use the grid's alternative implementation. Some users reported issues with Chrome's `ResizeObserver`. Use this property to always use the grid's alternative implementation should such problems exist. Default: `false`     */
            this.suppressBrowserResizeObserver = undefined;
            /** Disables showing a warning message in the console if using a `gridOptions` or `colDef` property that doesn't exist. Default: `false`     */
            this.suppressPropertyNamesCheck = undefined;
            /** Disables change detection. Default: `false`     */
            this.suppressChangeDetection = undefined;
            /** Set this to `true` to enable debug information from the grid and related components. Will result in additional logging being output, but very useful when investigating problems. Default: `false`     */
            this.debug = undefined;
            /** Provide a template for 'loading' overlay.     */
            this.overlayLoadingTemplate = undefined;
            /** Provide a custom loading overlay component.
                * See [Loading Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-loading-overlay-component) for framework specific implementation details.
                */
            this.loadingOverlayComponent = undefined;
            /** @deprecated As of v27, use `loadingOverlayComponent` for framework components too.     */
            this.loadingOverlayComponentFramework = undefined;
            /** Customise the parameters provided to the loading overlay component.     */
            this.loadingOverlayComponentParams = undefined;
            /** Disables the 'loading' overlay. Default: `false`     */
            this.suppressLoadingOverlay = undefined;
            /** Provide a template for 'no rows' overlay.     */
            this.overlayNoRowsTemplate = undefined;
            /** Provide a custom no rows overlay component.
                * See [No Rows Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-no-rows-overlay-component) for framework specific implementation details.
                */
            this.noRowsOverlayComponent = undefined;
            /** @deprecated As of v27, use `noRowsOverlayComponent` for framework components too.     */
            this.noRowsOverlayComponentFramework = undefined;
            /** Customise the parameters provided to the no rows overlay component.     */
            this.noRowsOverlayComponentParams = undefined;
            /** Disables the 'no rows' overlay. Default: `false`     */
            this.suppressNoRowsOverlay = undefined;
            /** Set whether pagination is enabled. Default: `false`     */
            this.pagination = undefined;
            /** How many rows to load per page. If `paginationAutoPageSize` is specified, this property is ignored. Default: `100`     */
            this.paginationPageSize = undefined;
            /** Set to `true` so that the number of rows to load per page is automatically adjusted by the grid so each page shows enough rows to just fill the area designated for the grid. If `false`, `paginationPageSize` is used. Default: `false`     */
            this.paginationAutoPageSize = undefined;
            /** Set to `true` to have pages split children of groups when using Row Grouping or detail rows with Master Detail. Default: `false`     */
            this.paginateChildRows = undefined;
            /** If `true`, the default grid controls for navigation are hidden.
                 * This is useful if `pagination=true` and you want to provide your own pagination controls.
                 * Otherwise, when `pagination=true` the grid automatically shows the necessary controls at the bottom so that the user can navigate through the different pages.
                 * Default: `false`
                 */
            this.suppressPaginationPanel = undefined;
            /** Set to `true` to enable pivot mode. Default: `false`     */
            this.pivotMode = undefined;
            /** When to show the 'pivot panel' (where you drag rows to pivot) at the top. Note that the pivot panel will never show if `pivotMode` is off. Default: `never`     */
            this.pivotPanelShow = undefined;
            /** When set and the grid is in pivot mode, automatically calculated totals will appear within the Pivot Column Groups, in the position specified.     */
            this.pivotColumnGroupTotals = undefined;
            /** When set and the grid is in pivot mode, automatically calculated totals will appear for each value column in the position specified.     */
            this.pivotRowTotals = undefined;
            /** If `true`, the grid will not swap in the grouping column when pivoting. Useful if pivoting using Server Side Row Model or Viewport Row Model and you want full control of all columns including the group column. Default: `false`     */
            this.pivotSuppressAutoColumn = undefined;
            /** When enabled, pivot column groups will appear 'fixed', without the ability to expand and collapse the column groups. Default: `false`     */
            this.suppressExpandablePivotGroups = undefined;
            /** If `true`, then row group, pivot and value aggregation will be read-only from the GUI. The grid will display what values are used for each, but will not allow the user to change the selection. Default: `false`     */
            this.functionsReadOnly = undefined;
            /** A map of 'function name' to 'function' for custom aggregation functions.     */
            this.aggFuncs = undefined;
            /** When `true`, column headers won't include the `aggFunc` name, e.g. `'sum(Bank Balance)`' will just be `'Bank Balance'`. Default: `false`     */
            this.suppressAggFuncInHeader = undefined;
            /** When `true`, the aggregations won't be computed for the root node of the grid. Default: `false`     */
            this.suppressAggAtRootLevel = undefined;
            /** When using change detection, only the updated column will be re-aggregated. Default: `false`     */
            this.aggregateOnlyChangedColumns = undefined;
            /** Set to `true` so that aggregations are not impacted by filtering. Default: `false`     */
            this.suppressAggFilteredOnly = undefined;
            /** Set to `true` to omit the value Column header when there is only a single value column. Default: `false`     */
            this.removePivotHeaderRowWhenSingleValueColumn = undefined;
            /** Set to `true` to enable Row Animation. Default: `false`     */
            this.animateRows = undefined;
            /** Set to `true` to have cells flash after data changes. Default: `false`     */
            this.enableCellChangeFlash = undefined;
            /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long a cell should remain in its "flashed" state.
                 * Default: `500`
                 */
            this.cellFlashDelay = undefined;
            /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long the "flashed" state animation takes to fade away after the timer set by `cellFlashDelay` has completed.
                 * Default: `1000`
                 */
            this.cellFadeDelay = undefined;
            /** Set to `true` to have cells flash after data changes even when the change is due to filtering. Default: `false`     */
            this.allowShowChangeAfterFilter = undefined;
            /** Switch between layout options: `normal`, `autoHeight`, `print`.
                 * Default: `normal`
                 */
            this.domLayout = undefined;
            /** When `true`, the order of rows and columns in the DOM are consistent with what is on screen. Default: `false`     */
            this.ensureDomOrder = undefined;
            /** Set to `true` to operate the grid in RTL (Right to Left) mode. Default: `false`     */
            this.enableRtl = undefined;
            /** Set to `true` so that the grid doesn't virtualise the columns. For example, if you have 100 columns, but only 10 visible due to scrolling, all 100 will always be rendered. Default: `false`     */
            this.suppressColumnVirtualisation = undefined;
            /** By default the grid has a limit of rendering a maximum of 500 rows at once (remember the grid only renders rows you can see, so unless your display shows more than 500 rows without vertically scrolling this will never be an issue).
                 * <br />**This is only relevant if you are manually setting `rowBuffer` to a high value (rendering more rows than can be seen), or `suppressRowVirtualisation` is true, or if your grid height is able to display more than 500 rows at once.**
                 * Default: `false`
                 */
            this.suppressMaxRenderedRowRestriction = undefined;
            /** Set to `true` so that the grid doesn't virtualise the rows. For example, if you have 100 rows, but only 10 visible due to scrolling, all 100 will always be rendered. Default: `false`     */
            this.suppressRowVirtualisation = undefined;
            /** Set to `true` to enable Managed Row Dragging. Default: `false`     */
            this.rowDragManaged = undefined;
            /** Set to `true` to suppress row dragging. Default: `false`     */
            this.suppressRowDrag = undefined;
            /** Set to `true` to suppress moving rows while dragging the `rowDrag` waffle. This option highlights the position where the row will be placed and it will only move the row on mouse up. Default: `false`     */
            this.suppressMoveWhenRowDragging = undefined;
            /** Set to `true` to enable clicking and dragging anywhere on the row without the need for a drag handle. Default: `false`     */
            this.rowDragEntireRow = undefined;
            /** Set to `true` to enable dragging multiple rows at the same time. Default: `false`     */
            this.rowDragMultiRow = undefined;
            /** A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
                 * If this callback is not set, the current cell value will be used.
                 * If the `rowDragText` callback is set in the ColDef it will take precedence over this, except when
                 * `rowDragEntireRow=true`.
                 */
            this.rowDragText = undefined;
            /** Provide your own cell renderer component to use for full width rows.
                * See [Full Width Rows](https://www.ag-grid.com/javascript-data-grid/full-width-rows/) for framework specific implementation details.
                */
            this.fullWidthCellRenderer = undefined;
            /** @deprecated As of v27, use `fullWidthCellRenderer` for framework components too.     */
            this.fullWidthCellRendererFramework = undefined;
            /** Customise the parameters provided to the `fullWidthCellRenderer` component.     */
            this.fullWidthCellRendererParams = undefined;
            /** Set to `true` to have the detail grid embedded in the master grid's container and so link their horizontal scrolling.     */
            this.embedFullWidthRows = undefined;
            /** Specifies how the results of row grouping should be displayed.
                 *
                 *  The options are:
                 *
                 * - `'singleColumn'`: single group column automatically added by the grid.
                 * - `'multipleColumns'`: a group column per row group is added automatically.
                 * - `'groupRows'`: group rows are automatically added instead of group columns.
                 * - `'custom'`: informs the grid that group columns will be provided.
                 */
            this.groupDisplayType = undefined;
            /** If grouping, set to the number of levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything. Default: `0`     */
            this.groupDefaultExpanded = undefined;
            /** Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column definition is included as the first column in the grid. If not grouping, this column is not included.     */
            this.autoGroupColumnDef = undefined;
            /** When `true`, preserves the current group order when sorting on non-group columns. Default: `false`     */
            this.groupMaintainOrder = undefined;
            /** When `true`, if you select a group, the children of the group will also be selected. Default: `false`     */
            this.groupSelectsChildren = undefined;
            /** Set to determine whether filters should be applied on aggregated group values. Default: `false`     */
            this.groupAggFiltering = undefined;
            /** If grouping, this controls whether to show a group footer when the group is expanded.
                 * If `true`, then by default, the footer will contain aggregate data (if any) when shown and the header will be blank.
                 * When closed, the header will contain the aggregate data regardless of this setting (as the footer is hidden anyway).
                 * This is handy for 'total' rows, that are displayed below the data when the group is open, and alongside the group when it is closed.
                 * Default: `false`
                 */
            this.groupIncludeFooter = undefined;
            /** Set to `true` to show a 'grand total' group footer across all groups. Default: `false`     */
            this.groupIncludeTotalFooter = undefined;
            /** If `true`, and showing footer, aggregate data will always be displayed at both the header and footer levels. This stops the possibly undesirable behaviour of the header details 'jumping' to the footer on expand. Default: `false`     */
            this.groupSuppressBlankHeader = undefined;
            /** If using `groupSelectsChildren`, then only the children that pass the current filter will get selected. Default: `false`     */
            this.groupSelectsFiltered = undefined;
            /** Shows the open group in the group column for non-group rows. Default: `false`     */
            this.showOpenedGroup = undefined;
            /** Set to `true` to collapse groups that only have one child.     */
            this.groupRemoveSingleChildren = undefined;
            /** Set to `true` to collapse lowest level groups that only have one child. Default: `false`     */
            this.groupRemoveLowestSingleChildren = undefined;
            /** Set to `true` to hide parents that are open. When used with multiple columns for showing groups, it can give a more pleasing user experience. Default: `false`     */
            this.groupHideOpenParents = undefined;
            /** Set to `true` to prevent the grid from creating a '(Blanks)' group for nodes which do not belong to a group, and display the unbalanced nodes alongside group nodes. Default: `false`     */
            this.groupAllowUnbalanced = undefined;
            /** When to show the 'row group panel' (where you drag rows to group) at the top. Default: `never`     */
            this.rowGroupPanelShow = undefined;
            /** Provide the Cell Renderer to use when `groupDisplayType = 'groupRows'`.
                * See [Group Row Cell Renderer](https://www.ag-grid.com/javascript-data-grid/grouping-group-rows/#providing-cell-renderer) for framework specific implementation details.
                */
            this.groupRowRenderer = undefined;
            /** @deprecated As of v27, use `groupRowRenderer` for framework components too.     */
            this.groupRowRendererFramework = undefined;
            /** Customise the parameters provided to the `groupRowRenderer` component.     */
            this.groupRowRendererParams = undefined;
            /** By default, when a column is un-grouped, i.e. using the Row Group Panel, it is made visible in the grid. This property stops the column becoming visible again when un-grouping. Default: `false`     */
            this.suppressMakeColumnVisibleAfterUnGroup = undefined;
            /** Set to `true` to enable the Grid to work with Tree Data. You must also implement the `getDataPath(data)` callback.     */
            this.treeData = undefined;
            /** Set to `true` to suppress sort indicators and actions from the row group panel. Default: `false`.     */
            this.rowGroupPanelSuppressSort = undefined;
            /** Set to `true` to keep open Group Rows visible at the top of the grid. Default: `false`.*/
            this.groupRowsSticky = undefined;
            /** @deprecated v24 - no longer needed, transaction updates keep group state     */
            this.rememberGroupStateWhenNewData = undefined;
            /** Data to be displayed as pinned top rows in the grid.     */
            this.pinnedTopRowData = undefined;
            /** Data to be displayed as pinned bottom rows in the grid.     */
            this.pinnedBottomRowData = undefined;
            /** Sets the row model type. Default: `clientSide`     */
            this.rowModelType = undefined;
            /** Set the data to be displayed as rows in the grid.     */
            this.rowData = undefined;
            /** @deprecated 27.1 Immutable Data is on by default when grid callback getRowId() is implemented
                 * Enables Immutable Data mode, for compatibility with immutable stores. Default: `false`     */
            this.immutableData = undefined;
            /** How many milliseconds to wait before executing a batch of async transactions.     */
            this.asyncTransactionWaitMillis = undefined;
            /** Prevents Transactions changing sort, filter, group or pivot state when transaction only contains updates. Default: `false`     */
            this.suppressModelUpdateAfterUpdateTransaction = undefined;
            /** Provide the datasource for infinite scrolling.     */
            this.datasource = undefined;
            /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
                 * Default: `1`
                 */
            this.cacheOverflowSize = undefined;
            /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
                 * Default: `1`
                 */
            this.infiniteInitialRowCount = undefined;
            /** Set how many loading rows to display to the user for the root level group.
                 * Default: `1`
                 */
            this.serverSideInitialRowCount = undefined;
            /** @deprecated v28 Whether to use Full Store or Partial Store for storing rows. Default: `partial`.
                 * Deprecated in favour of suppressServerSideInfiniteScroll. When false, Partial Store is used. When true,
                 * Full Store is used.
                 */
            this.serverSideStoreType = undefined;
            /** When `true`, the Server-side Row Model will suppress Infinite Scrolling and load all the data at the current level.
                 * Default: `false`
                 */
            this.suppressServerSideInfiniteScroll = undefined;
            /** How many rows for each block in the store, i.e. how many rows returned from the server at a time.
                 * Default: `100`
                 */
            this.cacheBlockSize = undefined;
            /** How many blocks to keep in the store. Default is no limit, so every requested block is kept. Use this if you have memory concerns, and blocks that were least recently viewed will be purged when the limit is hit. The grid will additionally make sure it has all the blocks needed to display what is currently visible, in case this property is set to a low value.     */
            this.maxBlocksInCache = undefined;
            /** How many requests to hit the server with concurrently. If the max is reached, requests are queued.
                 * Set to `-1` for no maximum restriction on requests.
                 * Default: `2`
                 */
            this.maxConcurrentDatasourceRequests = undefined;
            /** How many milliseconds to wait before loading a block. Useful when scrolling over many blocks, as it prevents blocks loading until scrolling has settled.     */
            this.blockLoadDebounceMillis = undefined;
            /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping. Default: `false`      */
            this.purgeClosedRowNodes = undefined;
            /** Provide the `serverSideDatasource` for server side row model.     */
            this.serverSideDatasource = undefined;
            /** When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping & sorting is handled on the server. Default: `false`     */
            this.serverSideSortAllLevels = undefined;
            /** When enabled, always refreshes top level groups regardless of which column was filtered. This property only applies when there is Row Grouping & filtering is handled on the server. Default: `false`     */
            this.serverSideFilterAllLevels = undefined;
            /**
                 * When enabled, Sorting will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
                 * Default: `false`
                 */
            this.serverSideSortOnServer = undefined;
            /** When enabled, Filtering will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
                 * Default: `false`
                 */
            this.serverSideFilterOnServer = undefined;
            /** @deprecated v28 This property has been deprecated. Use `serverSideSortAllLevels` instead.     */
            this.serverSideSortingAlwaysResets = undefined;
            /** @deprecated v28 This property has been deprecated. Use `serverSideFilterAllLevels` instead.     */
            this.serverSideFilteringAlwaysResets = undefined;
            /** To use the viewport row model you need to provide the grid with a `viewportDatasource`.     */
            this.viewportDatasource = undefined;
            /** When using viewport row model, sets the page size for the viewport.     */
            this.viewportRowModelPageSize = undefined;
            /** When using viewport row model, sets the buffer size for the viewport.     */
            this.viewportRowModelBufferSize = undefined;
            /** Set to `true` to always show the horizontal scrollbar. Default: `false`     */
            this.alwaysShowHorizontalScroll = undefined;
            /** Set to `true` to always show the vertical scrollbar. Default: `false`     */
            this.alwaysShowVerticalScroll = undefined;
            /** Set to `true` to debounce the vertical scrollbar. Can provide smoother scrolling on slow machines. Default: `false`     */
            this.debounceVerticalScrollbar = undefined;
            /** Set to `true` to never show the horizontal scroll. This is useful if the grid is aligned with another grid and will scroll when the other grid scrolls. (Should not be used in combination with `alwaysShowHorizontalScroll`.) Default: `false`     */
            this.suppressHorizontalScroll = undefined;
            /** When `true`, the grid will not scroll to the top when new row data is provided. Use this if you don't want the default behaviour of scrolling to the top every time you load new data. Default: `false`     */
            this.suppressScrollOnNewData = undefined;
            /** When `true`, the grid will not allow mousewheel / touchpad scroll when popup elements are present. Default: `false`     */
            this.suppressScrollWhenPopupsAreOpen = undefined;
            /** When `true`, the grid will not use animation frames when drawing rows while scrolling. Use this if the grid is working fast enough that you don't need animation frames and you don't want the grid to flicker. Default: `false`     */
            this.suppressAnimationFrame = undefined;
            /** If `true`, middle clicks will result in `click` events for cells and rows. Otherwise the browser will use middle click to scroll the grid.<br />**Note:** Not all browsers fire `click` events with the middle button. Most will fire only `mousedown` and `mouseup` events, which can be used to focus a cell, but will not work to call the `onCellClicked` function. Default: `false`     */
            this.suppressMiddleClickScrolls = undefined;
            /** If `true`, mouse wheel events will be passed to the browser. Useful if your grid has no vertical scrolls and you want the mouse to scroll the browser page. Default: `false`     */
            this.suppressPreventDefaultOnMouseWheel = undefined;
            /** Tell the grid how wide in pixels the scrollbar is, which is used in grid width calculations. Set only if using non-standard browser-provided scrollbars, so the grid can use the non-standard size in its calculations.     */
            this.scrollbarWidth = undefined;
            /** Type of Row Selection: `single`, `multiple`.     */
            this.rowSelection = undefined;
            /** Set to `true` to allow multiple rows to be selected using single click. Default: `false`     */
            this.rowMultiSelectWithClick = undefined;
            /** If `true`, rows will not be deselected if you hold down `Ctrl` and click the row or press `Space`. Default: `false`     */
            this.suppressRowDeselection = undefined;
            /** If `true`, row selection won't happen when rows are clicked. Use when you only want checkbox selection. Default: `false`     */
            this.suppressRowClickSelection = undefined;
            /** @deprecated v27 This property has been deprecated. Use `suppressCellFocus` instead.
                 */
            this.suppressCellSelection = undefined;
            /** If `true`, cells won't be focusable. This means keyboard navigation will be disabled for grid cells, but remain enabled in other elements of the grid such as column headers, floating filters, tool panels. Default: `false`     */
            this.suppressCellFocus = undefined;
            /** If `true`, only a single range can be selected. Default: `false`     */
            this.suppressMultiRangeSelection = undefined;
            /** Set to `true` to be able to select the text within cells.
                 *
                 *     **Note:** When this is set to `true`, the clipboard service is disabled.
                 * Default: `false`
                 */
            this.enableCellTextSelection = undefined;
            /** Set to `true` to enable Range Selection. Default: `false`     */
            this.enableRangeSelection = undefined;
            /** Set to `true` to enable the Range Handle. Default: `false`     */
            this.enableRangeHandle = undefined;
            /** Set to `true` to enable the Fill Handle. Default: `false`     */
            this.enableFillHandle = undefined;
            /** Set to `'x'` to force the fill handle direction to horizontal, or set to `'y'` to force the fill handle direction to vertical. Default: `xy`     */
            this.fillHandleDirection = undefined;
            /** Set this to `true` to prevent cell values from being cleared when the Range Selection is reduced by the Fill Handle. Default: `false`*/
            this.suppressClearOnFillReduction = undefined;
            /** Array defining the order in which sorting occurs (if sorting is enabled). Values can be `'asc'`, `'desc'` or `null`. For example: `sortingOrder: ['asc', 'desc']`. Default: `[null, 'asc', 'desc']`      */
            this.sortingOrder = undefined;
            /** Set to `true` to specify that the sort should take accented characters into account. If this feature is turned on the sort will be slower. Default: `false`     */
            this.accentedSort = undefined;
            /** Set to `true` to show the 'no sort' icon. Default: `false`     */
            this.unSortIcon = undefined;
            /** Set to `true` to suppress multi-sort when the user shift-clicks a column header. Default: `false`     */
            this.suppressMultiSort = undefined;
            /** Set to `true` to always multi-sort when the user clicks a column header, regardless of key presses. Default: `false`     */
            this.alwaysMultiSort = undefined;
            /** Set to `'ctrl'` to have multi sorting work using the `Ctrl` (or `Command ⌘` for Mac) key.     */
            this.multiSortKey = undefined;
            /** Set to `true` to suppress sorting of un-sorted data to match original row data. Default: `false`     */
            this.suppressMaintainUnsortedOrder = undefined;
            /** Icons to use inside the grid instead of the grid's default icons.     */
            this.icons = undefined;
            /** Default row height in pixels. Default: `25`     */
            this.rowHeight = undefined;
            /** The style properties to apply to all rows. Set to an object of key (style names) and values (style values)     */
            this.rowStyle = undefined;
            /** CSS class(es) for all rows. Provide either a string (class name) or array of strings (array of class names).     */
            this.rowClass = undefined;
            /** Rules which can be applied to include certain CSS classes.     */
            this.rowClassRules = undefined;
            /** Set to `true` to not highlight rows by adding the `ag-row-hover` CSS class. Default: `false`     */
            this.suppressRowHoverHighlight = undefined;
            /** Uses CSS `top` instead of CSS `transform` for positioning rows. Useful if the transform function is causing issues such as used in row spanning. Default: `false`     */
            this.suppressRowTransform = undefined;
            /** Set to `true` to highlight columns by adding the `ag-column-hover` CSS class. Default: `false`     */
            this.columnHoverHighlight = undefined;
            this.deltaSort = undefined;
            this.treeDataDisplayType = undefined;
            /** @deprecated v29.2     */
            this.functionsPassive = undefined;
            this.enableGroupEdit = undefined;
            /** For customising the context menu.     */
            this.getContextMenuItems = undefined;
            /** For customising the main 'column header' menu.     */
            this.getMainMenuItems = undefined;
            /** Allows user to process popups after they are created. Applications can use this if they want to, for example, reposition the popup.     */
            this.postProcessPopup = undefined;
            /** Allows you to process cells for the clipboard. Handy if for example you have `Date` objects that need to have a particular format if importing into Excel.     */
            this.processCellForClipboard = undefined;
            /** Allows you to process header values for the clipboard.      */
            this.processHeaderForClipboard = undefined;
            /** Allows you to process group header values for the clipboard.      */
            this.processGroupHeaderForClipboard = undefined;
            /** Allows you to process cells from the clipboard. Handy if for example you have number fields, and want to block non-numbers from getting into the grid.     */
            this.processCellFromClipboard = undefined;
            /** Allows you to get the data that would otherwise go to the clipboard. To be used when you want to control the 'copy to clipboard' operation yourself.     */
            this.sendToClipboard = undefined;
            /** Allows complete control of the paste operation, including cancelling the operation (so nothing happens) or replacing the data with other data.     */
            this.processDataFromClipboard = undefined;
            /** Grid calls this method to know if an external filter is present.     */
            this.isExternalFilterPresent = undefined;
            /** Should return `true` if external filter passes, otherwise `false`.     */
            this.doesExternalFilterPass = undefined;
            /** Callback to be used to customise the chart toolbar items.     */
            this.getChartToolbarItems = undefined;
            /** Callback to enable displaying the chart in an alternative chart container.     */
            this.createChartContainer = undefined;
            /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.     */
            this.navigateToNextHeader = undefined;
            /** Allows overriding the default behaviour for when user hits `Tab` key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.      */
            this.tabToNextHeader = undefined;
            /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a cell is focused. Return the next Cell position to navigate to or `null` to stay on current cell.      */
            this.navigateToNextCell = undefined;
            /** Allows overriding the default behaviour for when user hits `Tab` key when a cell is focused. Return the next Cell position to navigate to or null to stay on current cell.      */
            this.tabToNextCell = undefined;
            /** @deprecated v27.2 - Use `getLocaleText` instead.     */
            this.localeTextFunc = undefined;
            /** A callback for localising text within the grid.     */
            this.getLocaleText = undefined;
            /** Allows overriding what `document` is used. Currently used by Drag and Drop (may extend to other places in the future). Use this when you want the grid to use a different `document` than the one available on the global scope. This can happen if docking out components (something which Electron supports)     */
            this.getDocument = undefined;
            /** Allows user to format the numbers in the pagination panel, i.e. 'row count' and 'page number' labels. This is for pagination panel only, to format numbers inside the grid's cells (i.e. your data), then use `valueFormatter` in the column definitions.     */
            this.paginationNumberFormatter = undefined;
            /** @deprecated v27.2 - Use `getGroupRowAgg` instead.     */
            this.groupRowAggNodes = undefined;
            /** Callback to use when you need access to more then the current column for aggregation.     */
            this.getGroupRowAgg = undefined;
            /** (Client-side Row Model only) Allows groups to be open by default.     */
            this.isGroupOpenByDefault = undefined;
            /** Allows default sorting of groups.     */
            this.initialGroupOrderComparator = undefined;
            /** @deprecated v27.2 - Use `initialGroupOrderComparator` instead     */
            this.defaultGroupOrderComparator = undefined;
            /** @deprecated v28 - Use `processPivotResultColDef` instead     */
            this.processSecondaryColDef = undefined;
            /** @deprecated v28 - Use `processPivotResultColGroupDef` instead     */
            this.processSecondaryColGroupDef = undefined;
            /** Callback to be used with pivoting, to allow changing the second column definition.     */
            this.processPivotResultColDef = undefined;
            /** Callback to be used with pivoting, to allow changing the second column group definition.     */
            this.processPivotResultColGroupDef = undefined;
            /** Callback to be used when working with Tree Data when `treeData = true`.     */
            this.getDataPath = undefined;
            /** Allows setting the child count for a group row.     */
            this.getChildCount = undefined;
            /** Allows providing different params for different levels of grouping.     */
            this.getServerSideGroupLevelParams = undefined;
            /** @deprecated v28 Use `getServerSideGroupLevelParams` instead.     */
            this.getServerSideStoreParams = undefined;
            /** Allows groups to be open by default.     */
            this.isServerSideGroupOpenByDefault = undefined;
            /** Allows cancelling transactions.     */
            this.isApplyServerSideTransaction = undefined;
            /** SSRM Tree Data: Allows specifying which rows are expandable.     */
            this.isServerSideGroup = undefined;
            /** SSRM Tree Data: Allows specifying group keys.     */
            this.getServerSideGroupKey = undefined;
            /** Return a business key for the node. If implemented, each row in the DOM will have an attribute `row-id='abc'` where `abc` is what you return as the business key.
                 * This is useful for automated testing, as it provides a way for your tool to identify rows based on unique business keys.
                 */
            this.getBusinessKeyForNode = undefined;
            /** @deprecated v27.1 Use `getRowId` instead - however be aware, `getRowId()` will also set grid option `immutableData=true`
                 * Allows you to set the ID for a particular row node based on the data.     */
            this.getRowNodeId = undefined;
            /** Allows setting the ID for a particular row node based on the data.     */
            this.getRowId = undefined;
            /** When enabled, getRowId() callback is implemented and new Row Data is set, the grid will disregard all previous rows and treat the new Row Data as new data. As a consequence, all Row State (eg selection, rendered rows) will be reset.  Default: `false`     */
            this.resetRowDataOnUpdate = undefined;
            /** Allows you to process rows after they are created, so you can do final adding of custom attributes etc.     */
            this.processRowPostCreate = undefined;
            /** Callback to be used to determine which rows are selectable. By default rows are selectable, so return `false` to make a row un-selectable.     */
            this.isRowSelectable = undefined;
            /** Callback to be used with Master Detail to determine if a row should be a master row. If `false` is returned no detail row will exist for this row.     */
            this.isRowMaster = undefined;
            /** Callback to fill values instead of simply copying values or increasing number values using linear progression.     */
            this.fillOperation = undefined;
            /** @deprecated v27.2 Use `postSortRows` instead     */
            this.postSort = undefined;
            /** Callback to perform additional sorting after the grid has sorted the rows.     */
            this.postSortRows = undefined;
            /** Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values or undefined for no styles.     */
            this.getRowStyle = undefined;
            /** Callback version of property `rowClass` to set class(es) for each row individually. Function should return either a string (class name), array of strings (array of class names) or undefined for no class.     */
            this.getRowClass = undefined;
            /** Callback version of property `rowHeight` to set height for each row individually. Function should return a positive number of pixels, or return `null`/`undefined` to use the default row height.     */
            this.getRowHeight = undefined;
            /** @deprecated v27.2 Use `isFullWidthRow` instead.     */
            this.isFullWidthCell = undefined;
            /** Tells the grid if this row should be rendered as full width.     */
            this.isFullWidthRow = undefined;
            /** The tool panel was hidden or shown. Use `api.isToolPanelShowing()` to get status.     */
            this.toolPanelVisibleChanged = new i0.EventEmitter();
            /** The tool panel size has been changed.     */
            this.toolPanelSizeChanged = new i0.EventEmitter();
            /** Paste operation has started.     */
            this.pasteStart = new i0.EventEmitter();
            /** Paste operation has ended.     */
            this.pasteEnd = new i0.EventEmitter();
            /** A column, or group of columns, was hidden / shown.     */
            this.columnVisible = new i0.EventEmitter();
            /** A column, or group of columns, was pinned / unpinned.     */
            this.columnPinned = new i0.EventEmitter();
            /** A column was resized.     */
            this.columnResized = new i0.EventEmitter();
            /** A column was moved.     */
            this.columnMoved = new i0.EventEmitter();
            /** A value column was added or removed.     */
            this.columnValueChanged = new i0.EventEmitter();
            /** The pivot mode flag was changed.     */
            this.columnPivotModeChanged = new i0.EventEmitter();
            /** A pivot column was added, removed or order changed.     */
            this.columnPivotChanged = new i0.EventEmitter();
            /** A column group was opened / closed.     */
            this.columnGroupOpened = new i0.EventEmitter();
            /** User set new columns.     */
            this.newColumnsLoaded = new i0.EventEmitter();
            /** The list of grid columns changed.     */
            this.gridColumnsChanged = new i0.EventEmitter();
            /** The list of displayed columns changed. This can result from columns open / close, column move, pivot, group, etc.     */
            this.displayedColumnsChanged = new i0.EventEmitter();
            /** The list of rendered columns changed (only columns in the visible scrolled viewport are rendered by default).     */
            this.virtualColumnsChanged = new i0.EventEmitter();
            /** Shotgun - gets called when either a) new columns are set or b) `columnApi.applyColumnState()` is used, so everything has changed.     */
            this.columnEverythingChanged = new i0.EventEmitter();
            /** Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript).
                 * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.
                 */
            this.componentStateChanged = new i0.EventEmitter();
            /** Value has changed after editing (this event will not fire if editing was cancelled, eg ESC was pressed) or
                 *  if cell value has changed as a result of cut, paste, cell clear (pressing Delete key),
                 * fill handle, copy range down, undo and redo.
                */
            this.cellValueChanged = new i0.EventEmitter();
            /** Value has changed after editing. Only fires when `readOnlyEdit=true`.     */
            this.cellEditRequest = new i0.EventEmitter();
            /** A cell's value within a row has changed. This event corresponds to Full Row Editing only.     */
            this.rowValueChanged = new i0.EventEmitter();
            /** Editing a cell has started.     */
            this.cellEditingStarted = new i0.EventEmitter();
            /** Editing a cell has stopped.     */
            this.cellEditingStopped = new i0.EventEmitter();
            /** Editing a row has started (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStarted` will be fired for each individual cell. Only fires when doing Full Row Editing.     */
            this.rowEditingStarted = new i0.EventEmitter();
            /** Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStopped` will be fired for each individual cell. Only fires when doing Full Row Editing.     */
            this.rowEditingStopped = new i0.EventEmitter();
            /** Undo operation has started.     */
            this.undoStarted = new i0.EventEmitter();
            /** Undo operation has ended.     */
            this.undoEnded = new i0.EventEmitter();
            /** Redo operation has started.     */
            this.redoStarted = new i0.EventEmitter();
            /** Redo operation has ended.     */
            this.redoEnded = new i0.EventEmitter();
            /** Filter has been opened.     */
            this.filterOpened = new i0.EventEmitter();
            /** Filter has been modified and applied.     */
            this.filterChanged = new i0.EventEmitter();
            /** Filter was modified but not applied. Used when filters have 'Apply' buttons.     */
            this.filterModified = new i0.EventEmitter();
            /** A chart has been created.     */
            this.chartCreated = new i0.EventEmitter();
            /** The data range for the chart has been changed.     */
            this.chartRangeSelectionChanged = new i0.EventEmitter();
            /** Formatting changes have been made by users through the Format Panel.     */
            this.chartOptionsChanged = new i0.EventEmitter();
            /** A chart has been destroyed.     */
            this.chartDestroyed = new i0.EventEmitter();
            /** DOM event `keyDown` happened on a cell.     */
            this.cellKeyDown = new i0.EventEmitter();
            /** DOM event `keyPress` happened on a cell.     */
            this.cellKeyPress = new i0.EventEmitter();
            /** The grid has initialised and is ready for most api calls, but may not be fully rendered yet      */
            this.gridReady = new i0.EventEmitter();
            /** Fired the first time data is rendered into the grid. Use this event if you want to auto resize columns based on their contents     */
            this.firstDataRendered = new i0.EventEmitter();
            /** The size of the grid `div` has changed. In other words, the grid was resized.     */
            this.gridSizeChanged = new i0.EventEmitter();
            /** Displayed rows have changed. Triggered after sort, filter or tree expand / collapse events.     */
            this.modelUpdated = new i0.EventEmitter();
            /** A row was removed from the DOM, for any reason. Use to clean up resources (if any) used by the row.     */
            this.virtualRowRemoved = new i0.EventEmitter();
            /** Which rows are rendered in the DOM has changed.     */
            this.viewportChanged = new i0.EventEmitter();
            /** The body was scrolled horizontally or vertically.     */
            this.bodyScroll = new i0.EventEmitter();
            /** Main body of the grid has stopped scrolling, either horizontally or vertically.     */
            this.bodyScrollEnd = new i0.EventEmitter();
            /** When dragging starts. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.     */
            this.dragStarted = new i0.EventEmitter();
            /** When dragging stops. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.     */
            this.dragStopped = new i0.EventEmitter();
            /** Triggered every time the paging state changes. Some of the most common scenarios for this event to be triggered are:
                 *
                 *  - The page size changes.
                 *  - The current shown page is changed.
                 *  - New data is loaded onto the grid.
                 */
            this.paginationChanged = new i0.EventEmitter();
            /** A drag has started, or dragging was already started and the mouse has re-entered the grid having previously left the grid.     */
            this.rowDragEnter = new i0.EventEmitter();
            /** The mouse has moved while dragging.     */
            this.rowDragMove = new i0.EventEmitter();
            /** The mouse has left the grid while dragging.     */
            this.rowDragLeave = new i0.EventEmitter();
            /** The drag has finished over the grid.     */
            this.rowDragEnd = new i0.EventEmitter();
            /** A row group column was added or removed.     */
            this.columnRowGroupChanged = new i0.EventEmitter();
            /** A row group was opened or closed.     */
            this.rowGroupOpened = new i0.EventEmitter();
            /** Fired when calling either of the API methods `expandAll()` or `collapseAll()`.     */
            this.expandOrCollapseAll = new i0.EventEmitter();
            /** The client has set new pinned row data into the grid.     */
            this.pinnedRowDataChanged = new i0.EventEmitter();
            /** @deprecated v28 No longer fired, use onRowDataUpdated instead     */
            this.rowDataChanged = new i0.EventEmitter();
            /** The client has updated data for the grid by either a) setting new Row Data or b) Applying a Row Transaction.     */
            this.rowDataUpdated = new i0.EventEmitter();
            /** Async transactions have been applied. Contains a list of all transaction results.     */
            this.asyncTransactionsFlushed = new i0.EventEmitter();
            /** Cell is clicked.     */
            this.cellClicked = new i0.EventEmitter();
            /** Cell is double clicked.     */
            this.cellDoubleClicked = new i0.EventEmitter();
            /** Cell is focused.     */
            this.cellFocused = new i0.EventEmitter();
            /** Mouse entered cell.     */
            this.cellMouseOver = new i0.EventEmitter();
            /** Mouse left cell.     */
            this.cellMouseOut = new i0.EventEmitter();
            /** Mouse down on cell.     */
            this.cellMouseDown = new i0.EventEmitter();
            /** Row is clicked.     */
            this.rowClicked = new i0.EventEmitter();
            /** Row is double clicked.     */
            this.rowDoubleClicked = new i0.EventEmitter();
            /** Row is selected or deselected. The event contains the node in question, so call the node's `isSelected()` method to see if it was just selected or deselected.     */
            this.rowSelected = new i0.EventEmitter();
            /** Row selection is changed. Use the grid API `getSelectedNodes()` or `getSelectedRows()` to get the new list of selected nodes / row data.     */
            this.selectionChanged = new i0.EventEmitter();
            /** Cell is right clicked.     */
            this.cellContextMenu = new i0.EventEmitter();
            /** A change to range selection has occurred.     */
            this.rangeSelectionChanged = new i0.EventEmitter();
            /** Sort has changed. The grid also listens for this and updates the model.     */
            this.sortChanged = new i0.EventEmitter();
            /** @deprecated v29.2     */
            this.columnRowGroupChangeRequest = new i0.EventEmitter();
            /** @deprecated v29.2     */
            this.columnPivotChangeRequest = new i0.EventEmitter();
            /** @deprecated v29.2     */
            this.columnValueChangeRequest = new i0.EventEmitter();
            /** @deprecated v29.2     */
            this.columnAggFuncChangeRequest = new i0.EventEmitter();
            this._nativeElement = elementDef.nativeElement;
        }
        AgGridAngular.prototype.ngAfterViewInit = function () {
            this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef);
            this.frameworkComponentWrapper.setComponentFactoryResolver(this.componentFactoryResolver);
            this.angularFrameworkOverrides.setEmitterUsedCallback(this.isEmitterUsed.bind(this));
            this.gridOptions = core.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
            this.gridParams = {
                globalEventListener: this.globalEventListener.bind(this),
                frameworkOverrides: this.angularFrameworkOverrides,
                providedBeanInstances: {
                    frameworkComponentWrapper: this.frameworkComponentWrapper
                },
                modules: (this.modules || [])
            };
            new core.Grid(this._nativeElement, this.gridOptions, this.gridParams);
            if (this.gridOptions.api) {
                this.api = this.gridOptions.api;
            }
            if (this.gridOptions.columnApi) {
                this.columnApi = this.gridOptions.columnApi;
            }
            this._initialised = true;
            // sometimes, especially in large client apps gridReady can fire before ngAfterViewInit
            // this ties these together so that gridReady will always fire after agGridAngular's ngAfterViewInit
            // the actual containing component's ngAfterViewInit will fire just after agGridAngular's
            this._fullyReady.resolveNow(null, function (resolve) { return resolve; });
        };
        AgGridAngular.prototype.ngOnChanges = function (changes) {
            if (this._initialised) {
                core.ComponentUtil.processOnChange(changes, this.api);
            }
        };
        AgGridAngular.prototype.ngOnDestroy = function () {
            if (this._initialised) {
                // need to do this before the destroy, so we know not to emit any events
                // while tearing down the grid.
                this._destroyed = true;
                if (this.api) {
                    this.api.destroy();
                }
            }
        };
        // we'll emit the emit if a user is listening for a given event either on the component via normal angular binding
        // or via gridOptions
        AgGridAngular.prototype.isEmitterUsed = function (eventType) {
            var emitter = this[eventType];
            var hasEmitter = !!emitter && emitter.observers && emitter.observers.length > 0;
            // gridReady => onGridReady
            var asEventName = "on" + eventType.charAt(0).toUpperCase() + eventType.substring(1);
            var hasGridOptionListener = !!this.gridOptions && !!this.gridOptions[asEventName];
            return hasEmitter || hasGridOptionListener;
        };
        AgGridAngular.prototype.globalEventListener = function (eventType, event) {
            // if we are tearing down, don't emit angular events, as this causes
            // problems with the angular router
            if (this._destroyed) {
                return;
            }
            // generically look up the eventType
            var emitter = this[eventType];
            if (emitter && this.isEmitterUsed(eventType)) {
                if (eventType === 'gridReady') {
                    // if the user is listening for gridReady, wait for ngAfterViewInit to fire first, then emit the
                    // gridReady event
                    this._fullyReady.then((function (result) {
                        emitter.emit(event);
                    }));
                }
                else {
                    emitter.emit(event);
                }
            }
        };
        return AgGridAngular;
    }());
    AgGridAngular.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: AgGridAngular, deps: [{ token: i0__namespace.ElementRef }, { token: i0__namespace.ViewContainerRef }, { token: AngularFrameworkOverrides }, { token: AngularFrameworkComponentWrapper }, { token: i0__namespace.ComponentFactoryResolver }], target: i0__namespace.ɵɵFactoryTarget.Component });
    AgGridAngular.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.17", type: AgGridAngular, selector: "ag-grid-angular", inputs: { gridOptions: "gridOptions", modules: "modules", statusBar: "statusBar", sideBar: "sideBar", suppressContextMenu: "suppressContextMenu", preventDefaultOnContextMenu: "preventDefaultOnContextMenu", allowContextMenuWithControlKey: "allowContextMenuWithControlKey", suppressMenuHide: "suppressMenuHide", enableBrowserTooltips: "enableBrowserTooltips", tooltipShowDelay: "tooltipShowDelay", tooltipHideDelay: "tooltipHideDelay", tooltipMouseTrack: "tooltipMouseTrack", popupParent: "popupParent", copyHeadersToClipboard: "copyHeadersToClipboard", copyGroupHeadersToClipboard: "copyGroupHeadersToClipboard", clipboardDelimiter: "clipboardDelimiter", suppressCopyRowsToClipboard: "suppressCopyRowsToClipboard", suppressCopySingleCellRanges: "suppressCopySingleCellRanges", suppressLastEmptyLineOnPaste: "suppressLastEmptyLineOnPaste", suppressClipboardPaste: "suppressClipboardPaste", suppressClipboardApi: "suppressClipboardApi", suppressCutToClipboard: "suppressCutToClipboard", columnDefs: "columnDefs", defaultColDef: "defaultColDef", defaultColGroupDef: "defaultColGroupDef", columnTypes: "columnTypes", maintainColumnOrder: "maintainColumnOrder", suppressFieldDotNotation: "suppressFieldDotNotation", headerHeight: "headerHeight", groupHeaderHeight: "groupHeaderHeight", floatingFiltersHeight: "floatingFiltersHeight", pivotHeaderHeight: "pivotHeaderHeight", pivotGroupHeaderHeight: "pivotGroupHeaderHeight", allowDragFromColumnsToolPanel: "allowDragFromColumnsToolPanel", suppressMovableColumns: "suppressMovableColumns", suppressColumnMoveAnimation: "suppressColumnMoveAnimation", suppressDragLeaveHidesColumns: "suppressDragLeaveHidesColumns", suppressRowGroupHidesColumns: "suppressRowGroupHidesColumns", colResizeDefault: "colResizeDefault", suppressAutoSize: "suppressAutoSize", autoSizePadding: "autoSizePadding", skipHeaderOnAutoSize: "skipHeaderOnAutoSize", components: "components", frameworkComponents: "frameworkComponents", editType: "editType", singleClickEdit: "singleClickEdit", suppressClickEdit: "suppressClickEdit", readOnlyEdit: "readOnlyEdit", stopEditingWhenCellsLoseFocus: "stopEditingWhenCellsLoseFocus", enterMovesDown: "enterMovesDown", enterMovesDownAfterEdit: "enterMovesDownAfterEdit", enableCellEditingOnBackspace: "enableCellEditingOnBackspace", undoRedoCellEditing: "undoRedoCellEditing", undoRedoCellEditingLimit: "undoRedoCellEditingLimit", defaultCsvExportParams: "defaultCsvExportParams", suppressCsvExport: "suppressCsvExport", defaultExcelExportParams: "defaultExcelExportParams", suppressExcelExport: "suppressExcelExport", excelStyles: "excelStyles", quickFilterText: "quickFilterText", cacheQuickFilter: "cacheQuickFilter", excludeHiddenColumnsFromQuickFilter: "excludeHiddenColumnsFromQuickFilter", excludeChildrenWhenTreeDataFiltering: "excludeChildrenWhenTreeDataFiltering", enableCharts: "enableCharts", chartThemes: "chartThemes", customChartThemes: "customChartThemes", chartThemeOverrides: "chartThemeOverrides", enableChartToolPanelsButton: "enableChartToolPanelsButton", suppressChartToolPanelsButton: "suppressChartToolPanelsButton", chartToolPanelsDef: "chartToolPanelsDef", loadingCellRenderer: "loadingCellRenderer", loadingCellRendererFramework: "loadingCellRendererFramework", loadingCellRendererParams: "loadingCellRendererParams", loadingCellRendererSelector: "loadingCellRendererSelector", localeText: "localeText", masterDetail: "masterDetail", keepDetailRows: "keepDetailRows", keepDetailRowsCount: "keepDetailRowsCount", detailCellRenderer: "detailCellRenderer", detailCellRendererFramework: "detailCellRendererFramework", detailCellRendererParams: "detailCellRendererParams", detailRowHeight: "detailRowHeight", detailRowAutoHeight: "detailRowAutoHeight", context: "context", alignedGrids: "alignedGrids", tabIndex: "tabIndex", rowBuffer: "rowBuffer", valueCache: "valueCache", valueCacheNeverExpires: "valueCacheNeverExpires", enableCellExpressions: "enableCellExpressions", suppressParentsInRowNodes: "suppressParentsInRowNodes", suppressTouch: "suppressTouch", suppressFocusAfterRefresh: "suppressFocusAfterRefresh", suppressAsyncEvents: "suppressAsyncEvents", suppressBrowserResizeObserver: "suppressBrowserResizeObserver", suppressPropertyNamesCheck: "suppressPropertyNamesCheck", suppressChangeDetection: "suppressChangeDetection", debug: "debug", overlayLoadingTemplate: "overlayLoadingTemplate", loadingOverlayComponent: "loadingOverlayComponent", loadingOverlayComponentFramework: "loadingOverlayComponentFramework", loadingOverlayComponentParams: "loadingOverlayComponentParams", suppressLoadingOverlay: "suppressLoadingOverlay", overlayNoRowsTemplate: "overlayNoRowsTemplate", noRowsOverlayComponent: "noRowsOverlayComponent", noRowsOverlayComponentFramework: "noRowsOverlayComponentFramework", noRowsOverlayComponentParams: "noRowsOverlayComponentParams", suppressNoRowsOverlay: "suppressNoRowsOverlay", pagination: "pagination", paginationPageSize: "paginationPageSize", paginationAutoPageSize: "paginationAutoPageSize", paginateChildRows: "paginateChildRows", suppressPaginationPanel: "suppressPaginationPanel", pivotMode: "pivotMode", pivotPanelShow: "pivotPanelShow", pivotColumnGroupTotals: "pivotColumnGroupTotals", pivotRowTotals: "pivotRowTotals", pivotSuppressAutoColumn: "pivotSuppressAutoColumn", suppressExpandablePivotGroups: "suppressExpandablePivotGroups", functionsReadOnly: "functionsReadOnly", aggFuncs: "aggFuncs", suppressAggFuncInHeader: "suppressAggFuncInHeader", suppressAggAtRootLevel: "suppressAggAtRootLevel", aggregateOnlyChangedColumns: "aggregateOnlyChangedColumns", suppressAggFilteredOnly: "suppressAggFilteredOnly", removePivotHeaderRowWhenSingleValueColumn: "removePivotHeaderRowWhenSingleValueColumn", animateRows: "animateRows", enableCellChangeFlash: "enableCellChangeFlash", cellFlashDelay: "cellFlashDelay", cellFadeDelay: "cellFadeDelay", allowShowChangeAfterFilter: "allowShowChangeAfterFilter", domLayout: "domLayout", ensureDomOrder: "ensureDomOrder", enableRtl: "enableRtl", suppressColumnVirtualisation: "suppressColumnVirtualisation", suppressMaxRenderedRowRestriction: "suppressMaxRenderedRowRestriction", suppressRowVirtualisation: "suppressRowVirtualisation", rowDragManaged: "rowDragManaged", suppressRowDrag: "suppressRowDrag", suppressMoveWhenRowDragging: "suppressMoveWhenRowDragging", rowDragEntireRow: "rowDragEntireRow", rowDragMultiRow: "rowDragMultiRow", rowDragText: "rowDragText", fullWidthCellRenderer: "fullWidthCellRenderer", fullWidthCellRendererFramework: "fullWidthCellRendererFramework", fullWidthCellRendererParams: "fullWidthCellRendererParams", embedFullWidthRows: "embedFullWidthRows", groupDisplayType: "groupDisplayType", groupDefaultExpanded: "groupDefaultExpanded", autoGroupColumnDef: "autoGroupColumnDef", groupMaintainOrder: "groupMaintainOrder", groupSelectsChildren: "groupSelectsChildren", groupAggFiltering: "groupAggFiltering", groupIncludeFooter: "groupIncludeFooter", groupIncludeTotalFooter: "groupIncludeTotalFooter", groupSuppressBlankHeader: "groupSuppressBlankHeader", groupSelectsFiltered: "groupSelectsFiltered", showOpenedGroup: "showOpenedGroup", groupRemoveSingleChildren: "groupRemoveSingleChildren", groupRemoveLowestSingleChildren: "groupRemoveLowestSingleChildren", groupHideOpenParents: "groupHideOpenParents", groupAllowUnbalanced: "groupAllowUnbalanced", rowGroupPanelShow: "rowGroupPanelShow", groupRowRenderer: "groupRowRenderer", groupRowRendererFramework: "groupRowRendererFramework", groupRowRendererParams: "groupRowRendererParams", suppressMakeColumnVisibleAfterUnGroup: "suppressMakeColumnVisibleAfterUnGroup", treeData: "treeData", rowGroupPanelSuppressSort: "rowGroupPanelSuppressSort", groupRowsSticky: "groupRowsSticky", rememberGroupStateWhenNewData: "rememberGroupStateWhenNewData", pinnedTopRowData: "pinnedTopRowData", pinnedBottomRowData: "pinnedBottomRowData", rowModelType: "rowModelType", rowData: "rowData", immutableData: "immutableData", asyncTransactionWaitMillis: "asyncTransactionWaitMillis", suppressModelUpdateAfterUpdateTransaction: "suppressModelUpdateAfterUpdateTransaction", datasource: "datasource", cacheOverflowSize: "cacheOverflowSize", infiniteInitialRowCount: "infiniteInitialRowCount", serverSideInitialRowCount: "serverSideInitialRowCount", serverSideStoreType: "serverSideStoreType", suppressServerSideInfiniteScroll: "suppressServerSideInfiniteScroll", cacheBlockSize: "cacheBlockSize", maxBlocksInCache: "maxBlocksInCache", maxConcurrentDatasourceRequests: "maxConcurrentDatasourceRequests", blockLoadDebounceMillis: "blockLoadDebounceMillis", purgeClosedRowNodes: "purgeClosedRowNodes", serverSideDatasource: "serverSideDatasource", serverSideSortAllLevels: "serverSideSortAllLevels", serverSideFilterAllLevels: "serverSideFilterAllLevels", serverSideSortOnServer: "serverSideSortOnServer", serverSideFilterOnServer: "serverSideFilterOnServer", serverSideSortingAlwaysResets: "serverSideSortingAlwaysResets", serverSideFilteringAlwaysResets: "serverSideFilteringAlwaysResets", viewportDatasource: "viewportDatasource", viewportRowModelPageSize: "viewportRowModelPageSize", viewportRowModelBufferSize: "viewportRowModelBufferSize", alwaysShowHorizontalScroll: "alwaysShowHorizontalScroll", alwaysShowVerticalScroll: "alwaysShowVerticalScroll", debounceVerticalScrollbar: "debounceVerticalScrollbar", suppressHorizontalScroll: "suppressHorizontalScroll", suppressScrollOnNewData: "suppressScrollOnNewData", suppressScrollWhenPopupsAreOpen: "suppressScrollWhenPopupsAreOpen", suppressAnimationFrame: "suppressAnimationFrame", suppressMiddleClickScrolls: "suppressMiddleClickScrolls", suppressPreventDefaultOnMouseWheel: "suppressPreventDefaultOnMouseWheel", scrollbarWidth: "scrollbarWidth", rowSelection: "rowSelection", rowMultiSelectWithClick: "rowMultiSelectWithClick", suppressRowDeselection: "suppressRowDeselection", suppressRowClickSelection: "suppressRowClickSelection", suppressCellSelection: "suppressCellSelection", suppressCellFocus: "suppressCellFocus", suppressMultiRangeSelection: "suppressMultiRangeSelection", enableCellTextSelection: "enableCellTextSelection", enableRangeSelection: "enableRangeSelection", enableRangeHandle: "enableRangeHandle", enableFillHandle: "enableFillHandle", fillHandleDirection: "fillHandleDirection", suppressClearOnFillReduction: "suppressClearOnFillReduction", sortingOrder: "sortingOrder", accentedSort: "accentedSort", unSortIcon: "unSortIcon", suppressMultiSort: "suppressMultiSort", alwaysMultiSort: "alwaysMultiSort", multiSortKey: "multiSortKey", suppressMaintainUnsortedOrder: "suppressMaintainUnsortedOrder", icons: "icons", rowHeight: "rowHeight", rowStyle: "rowStyle", rowClass: "rowClass", rowClassRules: "rowClassRules", suppressRowHoverHighlight: "suppressRowHoverHighlight", suppressRowTransform: "suppressRowTransform", columnHoverHighlight: "columnHoverHighlight", deltaSort: "deltaSort", treeDataDisplayType: "treeDataDisplayType", functionsPassive: "functionsPassive", enableGroupEdit: "enableGroupEdit", getContextMenuItems: "getContextMenuItems", getMainMenuItems: "getMainMenuItems", postProcessPopup: "postProcessPopup", processCellForClipboard: "processCellForClipboard", processHeaderForClipboard: "processHeaderForClipboard", processGroupHeaderForClipboard: "processGroupHeaderForClipboard", processCellFromClipboard: "processCellFromClipboard", sendToClipboard: "sendToClipboard", processDataFromClipboard: "processDataFromClipboard", isExternalFilterPresent: "isExternalFilterPresent", doesExternalFilterPass: "doesExternalFilterPass", getChartToolbarItems: "getChartToolbarItems", createChartContainer: "createChartContainer", navigateToNextHeader: "navigateToNextHeader", tabToNextHeader: "tabToNextHeader", navigateToNextCell: "navigateToNextCell", tabToNextCell: "tabToNextCell", localeTextFunc: "localeTextFunc", getLocaleText: "getLocaleText", getDocument: "getDocument", paginationNumberFormatter: "paginationNumberFormatter", groupRowAggNodes: "groupRowAggNodes", getGroupRowAgg: "getGroupRowAgg", isGroupOpenByDefault: "isGroupOpenByDefault", initialGroupOrderComparator: "initialGroupOrderComparator", defaultGroupOrderComparator: "defaultGroupOrderComparator", processSecondaryColDef: "processSecondaryColDef", processSecondaryColGroupDef: "processSecondaryColGroupDef", processPivotResultColDef: "processPivotResultColDef", processPivotResultColGroupDef: "processPivotResultColGroupDef", getDataPath: "getDataPath", getChildCount: "getChildCount", getServerSideGroupLevelParams: "getServerSideGroupLevelParams", getServerSideStoreParams: "getServerSideStoreParams", isServerSideGroupOpenByDefault: "isServerSideGroupOpenByDefault", isApplyServerSideTransaction: "isApplyServerSideTransaction", isServerSideGroup: "isServerSideGroup", getServerSideGroupKey: "getServerSideGroupKey", getBusinessKeyForNode: "getBusinessKeyForNode", getRowNodeId: "getRowNodeId", getRowId: "getRowId", resetRowDataOnUpdate: "resetRowDataOnUpdate", processRowPostCreate: "processRowPostCreate", isRowSelectable: "isRowSelectable", isRowMaster: "isRowMaster", fillOperation: "fillOperation", postSort: "postSort", postSortRows: "postSortRows", getRowStyle: "getRowStyle", getRowClass: "getRowClass", getRowHeight: "getRowHeight", isFullWidthCell: "isFullWidthCell", isFullWidthRow: "isFullWidthRow" }, outputs: { toolPanelVisibleChanged: "toolPanelVisibleChanged", toolPanelSizeChanged: "toolPanelSizeChanged", pasteStart: "pasteStart", pasteEnd: "pasteEnd", columnVisible: "columnVisible", columnPinned: "columnPinned", columnResized: "columnResized", columnMoved: "columnMoved", columnValueChanged: "columnValueChanged", columnPivotModeChanged: "columnPivotModeChanged", columnPivotChanged: "columnPivotChanged", columnGroupOpened: "columnGroupOpened", newColumnsLoaded: "newColumnsLoaded", gridColumnsChanged: "gridColumnsChanged", displayedColumnsChanged: "displayedColumnsChanged", virtualColumnsChanged: "virtualColumnsChanged", columnEverythingChanged: "columnEverythingChanged", componentStateChanged: "componentStateChanged", cellValueChanged: "cellValueChanged", cellEditRequest: "cellEditRequest", rowValueChanged: "rowValueChanged", cellEditingStarted: "cellEditingStarted", cellEditingStopped: "cellEditingStopped", rowEditingStarted: "rowEditingStarted", rowEditingStopped: "rowEditingStopped", undoStarted: "undoStarted", undoEnded: "undoEnded", redoStarted: "redoStarted", redoEnded: "redoEnded", filterOpened: "filterOpened", filterChanged: "filterChanged", filterModified: "filterModified", chartCreated: "chartCreated", chartRangeSelectionChanged: "chartRangeSelectionChanged", chartOptionsChanged: "chartOptionsChanged", chartDestroyed: "chartDestroyed", cellKeyDown: "cellKeyDown", cellKeyPress: "cellKeyPress", gridReady: "gridReady", firstDataRendered: "firstDataRendered", gridSizeChanged: "gridSizeChanged", modelUpdated: "modelUpdated", virtualRowRemoved: "virtualRowRemoved", viewportChanged: "viewportChanged", bodyScroll: "bodyScroll", bodyScrollEnd: "bodyScrollEnd", dragStarted: "dragStarted", dragStopped: "dragStopped", paginationChanged: "paginationChanged", rowDragEnter: "rowDragEnter", rowDragMove: "rowDragMove", rowDragLeave: "rowDragLeave", rowDragEnd: "rowDragEnd", columnRowGroupChanged: "columnRowGroupChanged", rowGroupOpened: "rowGroupOpened", expandOrCollapseAll: "expandOrCollapseAll", pinnedRowDataChanged: "pinnedRowDataChanged", rowDataChanged: "rowDataChanged", rowDataUpdated: "rowDataUpdated", asyncTransactionsFlushed: "asyncTransactionsFlushed", cellClicked: "cellClicked", cellDoubleClicked: "cellDoubleClicked", cellFocused: "cellFocused", cellMouseOver: "cellMouseOver", cellMouseOut: "cellMouseOut", cellMouseDown: "cellMouseDown", rowClicked: "rowClicked", rowDoubleClicked: "rowDoubleClicked", rowSelected: "rowSelected", selectionChanged: "selectionChanged", cellContextMenu: "cellContextMenu", rangeSelectionChanged: "rangeSelectionChanged", sortChanged: "sortChanged", columnRowGroupChangeRequest: "columnRowGroupChangeRequest", columnPivotChangeRequest: "columnPivotChangeRequest", columnValueChangeRequest: "columnValueChangeRequest", columnAggFuncChangeRequest: "columnAggFuncChangeRequest" }, providers: [
            AngularFrameworkOverrides,
            AngularFrameworkComponentWrapper
        ], usesOnChanges: true, ngImport: i0__namespace, template: '', isInline: true, encapsulation: i0__namespace.ViewEncapsulation.None });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: AgGridAngular, decorators: [{
                type: i0.Component,
                args: [{
                        selector: 'ag-grid-angular',
                        template: '',
                        providers: [
                            AngularFrameworkOverrides,
                            AngularFrameworkComponentWrapper
                        ],
                        // tell angular we don't want view encapsulation, we don't want a shadow root
                        encapsulation: i0.ViewEncapsulation.None
                    }]
            }], ctorParameters: function () { return [{ type: i0__namespace.ElementRef }, { type: i0__namespace.ViewContainerRef }, { type: AngularFrameworkOverrides }, { type: AngularFrameworkComponentWrapper }, { type: i0__namespace.ComponentFactoryResolver }]; }, propDecorators: { gridOptions: [{
                    type: i0.Input
                }], modules: [{
                    type: i0.Input
                }], statusBar: [{
                    type: i0.Input
                }], sideBar: [{
                    type: i0.Input
                }], suppressContextMenu: [{
                    type: i0.Input
                }], preventDefaultOnContextMenu: [{
                    type: i0.Input
                }], allowContextMenuWithControlKey: [{
                    type: i0.Input
                }], suppressMenuHide: [{
                    type: i0.Input
                }], enableBrowserTooltips: [{
                    type: i0.Input
                }], tooltipShowDelay: [{
                    type: i0.Input
                }], tooltipHideDelay: [{
                    type: i0.Input
                }], tooltipMouseTrack: [{
                    type: i0.Input
                }], popupParent: [{
                    type: i0.Input
                }], copyHeadersToClipboard: [{
                    type: i0.Input
                }], copyGroupHeadersToClipboard: [{
                    type: i0.Input
                }], clipboardDelimiter: [{
                    type: i0.Input
                }], suppressCopyRowsToClipboard: [{
                    type: i0.Input
                }], suppressCopySingleCellRanges: [{
                    type: i0.Input
                }], suppressLastEmptyLineOnPaste: [{
                    type: i0.Input
                }], suppressClipboardPaste: [{
                    type: i0.Input
                }], suppressClipboardApi: [{
                    type: i0.Input
                }], suppressCutToClipboard: [{
                    type: i0.Input
                }], columnDefs: [{
                    type: i0.Input
                }], defaultColDef: [{
                    type: i0.Input
                }], defaultColGroupDef: [{
                    type: i0.Input
                }], columnTypes: [{
                    type: i0.Input
                }], maintainColumnOrder: [{
                    type: i0.Input
                }], suppressFieldDotNotation: [{
                    type: i0.Input
                }], headerHeight: [{
                    type: i0.Input
                }], groupHeaderHeight: [{
                    type: i0.Input
                }], floatingFiltersHeight: [{
                    type: i0.Input
                }], pivotHeaderHeight: [{
                    type: i0.Input
                }], pivotGroupHeaderHeight: [{
                    type: i0.Input
                }], allowDragFromColumnsToolPanel: [{
                    type: i0.Input
                }], suppressMovableColumns: [{
                    type: i0.Input
                }], suppressColumnMoveAnimation: [{
                    type: i0.Input
                }], suppressDragLeaveHidesColumns: [{
                    type: i0.Input
                }], suppressRowGroupHidesColumns: [{
                    type: i0.Input
                }], colResizeDefault: [{
                    type: i0.Input
                }], suppressAutoSize: [{
                    type: i0.Input
                }], autoSizePadding: [{
                    type: i0.Input
                }], skipHeaderOnAutoSize: [{
                    type: i0.Input
                }], components: [{
                    type: i0.Input
                }], frameworkComponents: [{
                    type: i0.Input
                }], editType: [{
                    type: i0.Input
                }], singleClickEdit: [{
                    type: i0.Input
                }], suppressClickEdit: [{
                    type: i0.Input
                }], readOnlyEdit: [{
                    type: i0.Input
                }], stopEditingWhenCellsLoseFocus: [{
                    type: i0.Input
                }], enterMovesDown: [{
                    type: i0.Input
                }], enterMovesDownAfterEdit: [{
                    type: i0.Input
                }], enableCellEditingOnBackspace: [{
                    type: i0.Input
                }], undoRedoCellEditing: [{
                    type: i0.Input
                }], undoRedoCellEditingLimit: [{
                    type: i0.Input
                }], defaultCsvExportParams: [{
                    type: i0.Input
                }], suppressCsvExport: [{
                    type: i0.Input
                }], defaultExcelExportParams: [{
                    type: i0.Input
                }], suppressExcelExport: [{
                    type: i0.Input
                }], excelStyles: [{
                    type: i0.Input
                }], quickFilterText: [{
                    type: i0.Input
                }], cacheQuickFilter: [{
                    type: i0.Input
                }], excludeHiddenColumnsFromQuickFilter: [{
                    type: i0.Input
                }], excludeChildrenWhenTreeDataFiltering: [{
                    type: i0.Input
                }], enableCharts: [{
                    type: i0.Input
                }], chartThemes: [{
                    type: i0.Input
                }], customChartThemes: [{
                    type: i0.Input
                }], chartThemeOverrides: [{
                    type: i0.Input
                }], enableChartToolPanelsButton: [{
                    type: i0.Input
                }], suppressChartToolPanelsButton: [{
                    type: i0.Input
                }], chartToolPanelsDef: [{
                    type: i0.Input
                }], loadingCellRenderer: [{
                    type: i0.Input
                }], loadingCellRendererFramework: [{
                    type: i0.Input
                }], loadingCellRendererParams: [{
                    type: i0.Input
                }], loadingCellRendererSelector: [{
                    type: i0.Input
                }], localeText: [{
                    type: i0.Input
                }], masterDetail: [{
                    type: i0.Input
                }], keepDetailRows: [{
                    type: i0.Input
                }], keepDetailRowsCount: [{
                    type: i0.Input
                }], detailCellRenderer: [{
                    type: i0.Input
                }], detailCellRendererFramework: [{
                    type: i0.Input
                }], detailCellRendererParams: [{
                    type: i0.Input
                }], detailRowHeight: [{
                    type: i0.Input
                }], detailRowAutoHeight: [{
                    type: i0.Input
                }], context: [{
                    type: i0.Input
                }], alignedGrids: [{
                    type: i0.Input
                }], tabIndex: [{
                    type: i0.Input
                }], rowBuffer: [{
                    type: i0.Input
                }], valueCache: [{
                    type: i0.Input
                }], valueCacheNeverExpires: [{
                    type: i0.Input
                }], enableCellExpressions: [{
                    type: i0.Input
                }], suppressParentsInRowNodes: [{
                    type: i0.Input
                }], suppressTouch: [{
                    type: i0.Input
                }], suppressFocusAfterRefresh: [{
                    type: i0.Input
                }], suppressAsyncEvents: [{
                    type: i0.Input
                }], suppressBrowserResizeObserver: [{
                    type: i0.Input
                }], suppressPropertyNamesCheck: [{
                    type: i0.Input
                }], suppressChangeDetection: [{
                    type: i0.Input
                }], debug: [{
                    type: i0.Input
                }], overlayLoadingTemplate: [{
                    type: i0.Input
                }], loadingOverlayComponent: [{
                    type: i0.Input
                }], loadingOverlayComponentFramework: [{
                    type: i0.Input
                }], loadingOverlayComponentParams: [{
                    type: i0.Input
                }], suppressLoadingOverlay: [{
                    type: i0.Input
                }], overlayNoRowsTemplate: [{
                    type: i0.Input
                }], noRowsOverlayComponent: [{
                    type: i0.Input
                }], noRowsOverlayComponentFramework: [{
                    type: i0.Input
                }], noRowsOverlayComponentParams: [{
                    type: i0.Input
                }], suppressNoRowsOverlay: [{
                    type: i0.Input
                }], pagination: [{
                    type: i0.Input
                }], paginationPageSize: [{
                    type: i0.Input
                }], paginationAutoPageSize: [{
                    type: i0.Input
                }], paginateChildRows: [{
                    type: i0.Input
                }], suppressPaginationPanel: [{
                    type: i0.Input
                }], pivotMode: [{
                    type: i0.Input
                }], pivotPanelShow: [{
                    type: i0.Input
                }], pivotColumnGroupTotals: [{
                    type: i0.Input
                }], pivotRowTotals: [{
                    type: i0.Input
                }], pivotSuppressAutoColumn: [{
                    type: i0.Input
                }], suppressExpandablePivotGroups: [{
                    type: i0.Input
                }], functionsReadOnly: [{
                    type: i0.Input
                }], aggFuncs: [{
                    type: i0.Input
                }], suppressAggFuncInHeader: [{
                    type: i0.Input
                }], suppressAggAtRootLevel: [{
                    type: i0.Input
                }], aggregateOnlyChangedColumns: [{
                    type: i0.Input
                }], suppressAggFilteredOnly: [{
                    type: i0.Input
                }], removePivotHeaderRowWhenSingleValueColumn: [{
                    type: i0.Input
                }], animateRows: [{
                    type: i0.Input
                }], enableCellChangeFlash: [{
                    type: i0.Input
                }], cellFlashDelay: [{
                    type: i0.Input
                }], cellFadeDelay: [{
                    type: i0.Input
                }], allowShowChangeAfterFilter: [{
                    type: i0.Input
                }], domLayout: [{
                    type: i0.Input
                }], ensureDomOrder: [{
                    type: i0.Input
                }], enableRtl: [{
                    type: i0.Input
                }], suppressColumnVirtualisation: [{
                    type: i0.Input
                }], suppressMaxRenderedRowRestriction: [{
                    type: i0.Input
                }], suppressRowVirtualisation: [{
                    type: i0.Input
                }], rowDragManaged: [{
                    type: i0.Input
                }], suppressRowDrag: [{
                    type: i0.Input
                }], suppressMoveWhenRowDragging: [{
                    type: i0.Input
                }], rowDragEntireRow: [{
                    type: i0.Input
                }], rowDragMultiRow: [{
                    type: i0.Input
                }], rowDragText: [{
                    type: i0.Input
                }], fullWidthCellRenderer: [{
                    type: i0.Input
                }], fullWidthCellRendererFramework: [{
                    type: i0.Input
                }], fullWidthCellRendererParams: [{
                    type: i0.Input
                }], embedFullWidthRows: [{
                    type: i0.Input
                }], groupDisplayType: [{
                    type: i0.Input
                }], groupDefaultExpanded: [{
                    type: i0.Input
                }], autoGroupColumnDef: [{
                    type: i0.Input
                }], groupMaintainOrder: [{
                    type: i0.Input
                }], groupSelectsChildren: [{
                    type: i0.Input
                }], groupAggFiltering: [{
                    type: i0.Input
                }], groupIncludeFooter: [{
                    type: i0.Input
                }], groupIncludeTotalFooter: [{
                    type: i0.Input
                }], groupSuppressBlankHeader: [{
                    type: i0.Input
                }], groupSelectsFiltered: [{
                    type: i0.Input
                }], showOpenedGroup: [{
                    type: i0.Input
                }], groupRemoveSingleChildren: [{
                    type: i0.Input
                }], groupRemoveLowestSingleChildren: [{
                    type: i0.Input
                }], groupHideOpenParents: [{
                    type: i0.Input
                }], groupAllowUnbalanced: [{
                    type: i0.Input
                }], rowGroupPanelShow: [{
                    type: i0.Input
                }], groupRowRenderer: [{
                    type: i0.Input
                }], groupRowRendererFramework: [{
                    type: i0.Input
                }], groupRowRendererParams: [{
                    type: i0.Input
                }], suppressMakeColumnVisibleAfterUnGroup: [{
                    type: i0.Input
                }], treeData: [{
                    type: i0.Input
                }], rowGroupPanelSuppressSort: [{
                    type: i0.Input
                }], groupRowsSticky: [{
                    type: i0.Input
                }], rememberGroupStateWhenNewData: [{
                    type: i0.Input
                }], pinnedTopRowData: [{
                    type: i0.Input
                }], pinnedBottomRowData: [{
                    type: i0.Input
                }], rowModelType: [{
                    type: i0.Input
                }], rowData: [{
                    type: i0.Input
                }], immutableData: [{
                    type: i0.Input
                }], asyncTransactionWaitMillis: [{
                    type: i0.Input
                }], suppressModelUpdateAfterUpdateTransaction: [{
                    type: i0.Input
                }], datasource: [{
                    type: i0.Input
                }], cacheOverflowSize: [{
                    type: i0.Input
                }], infiniteInitialRowCount: [{
                    type: i0.Input
                }], serverSideInitialRowCount: [{
                    type: i0.Input
                }], serverSideStoreType: [{
                    type: i0.Input
                }], suppressServerSideInfiniteScroll: [{
                    type: i0.Input
                }], cacheBlockSize: [{
                    type: i0.Input
                }], maxBlocksInCache: [{
                    type: i0.Input
                }], maxConcurrentDatasourceRequests: [{
                    type: i0.Input
                }], blockLoadDebounceMillis: [{
                    type: i0.Input
                }], purgeClosedRowNodes: [{
                    type: i0.Input
                }], serverSideDatasource: [{
                    type: i0.Input
                }], serverSideSortAllLevels: [{
                    type: i0.Input
                }], serverSideFilterAllLevels: [{
                    type: i0.Input
                }], serverSideSortOnServer: [{
                    type: i0.Input
                }], serverSideFilterOnServer: [{
                    type: i0.Input
                }], serverSideSortingAlwaysResets: [{
                    type: i0.Input
                }], serverSideFilteringAlwaysResets: [{
                    type: i0.Input
                }], viewportDatasource: [{
                    type: i0.Input
                }], viewportRowModelPageSize: [{
                    type: i0.Input
                }], viewportRowModelBufferSize: [{
                    type: i0.Input
                }], alwaysShowHorizontalScroll: [{
                    type: i0.Input
                }], alwaysShowVerticalScroll: [{
                    type: i0.Input
                }], debounceVerticalScrollbar: [{
                    type: i0.Input
                }], suppressHorizontalScroll: [{
                    type: i0.Input
                }], suppressScrollOnNewData: [{
                    type: i0.Input
                }], suppressScrollWhenPopupsAreOpen: [{
                    type: i0.Input
                }], suppressAnimationFrame: [{
                    type: i0.Input
                }], suppressMiddleClickScrolls: [{
                    type: i0.Input
                }], suppressPreventDefaultOnMouseWheel: [{
                    type: i0.Input
                }], scrollbarWidth: [{
                    type: i0.Input
                }], rowSelection: [{
                    type: i0.Input
                }], rowMultiSelectWithClick: [{
                    type: i0.Input
                }], suppressRowDeselection: [{
                    type: i0.Input
                }], suppressRowClickSelection: [{
                    type: i0.Input
                }], suppressCellSelection: [{
                    type: i0.Input
                }], suppressCellFocus: [{
                    type: i0.Input
                }], suppressMultiRangeSelection: [{
                    type: i0.Input
                }], enableCellTextSelection: [{
                    type: i0.Input
                }], enableRangeSelection: [{
                    type: i0.Input
                }], enableRangeHandle: [{
                    type: i0.Input
                }], enableFillHandle: [{
                    type: i0.Input
                }], fillHandleDirection: [{
                    type: i0.Input
                }], suppressClearOnFillReduction: [{
                    type: i0.Input
                }], sortingOrder: [{
                    type: i0.Input
                }], accentedSort: [{
                    type: i0.Input
                }], unSortIcon: [{
                    type: i0.Input
                }], suppressMultiSort: [{
                    type: i0.Input
                }], alwaysMultiSort: [{
                    type: i0.Input
                }], multiSortKey: [{
                    type: i0.Input
                }], suppressMaintainUnsortedOrder: [{
                    type: i0.Input
                }], icons: [{
                    type: i0.Input
                }], rowHeight: [{
                    type: i0.Input
                }], rowStyle: [{
                    type: i0.Input
                }], rowClass: [{
                    type: i0.Input
                }], rowClassRules: [{
                    type: i0.Input
                }], suppressRowHoverHighlight: [{
                    type: i0.Input
                }], suppressRowTransform: [{
                    type: i0.Input
                }], columnHoverHighlight: [{
                    type: i0.Input
                }], deltaSort: [{
                    type: i0.Input
                }], treeDataDisplayType: [{
                    type: i0.Input
                }], functionsPassive: [{
                    type: i0.Input
                }], enableGroupEdit: [{
                    type: i0.Input
                }], getContextMenuItems: [{
                    type: i0.Input
                }], getMainMenuItems: [{
                    type: i0.Input
                }], postProcessPopup: [{
                    type: i0.Input
                }], processCellForClipboard: [{
                    type: i0.Input
                }], processHeaderForClipboard: [{
                    type: i0.Input
                }], processGroupHeaderForClipboard: [{
                    type: i0.Input
                }], processCellFromClipboard: [{
                    type: i0.Input
                }], sendToClipboard: [{
                    type: i0.Input
                }], processDataFromClipboard: [{
                    type: i0.Input
                }], isExternalFilterPresent: [{
                    type: i0.Input
                }], doesExternalFilterPass: [{
                    type: i0.Input
                }], getChartToolbarItems: [{
                    type: i0.Input
                }], createChartContainer: [{
                    type: i0.Input
                }], navigateToNextHeader: [{
                    type: i0.Input
                }], tabToNextHeader: [{
                    type: i0.Input
                }], navigateToNextCell: [{
                    type: i0.Input
                }], tabToNextCell: [{
                    type: i0.Input
                }], localeTextFunc: [{
                    type: i0.Input
                }], getLocaleText: [{
                    type: i0.Input
                }], getDocument: [{
                    type: i0.Input
                }], paginationNumberFormatter: [{
                    type: i0.Input
                }], groupRowAggNodes: [{
                    type: i0.Input
                }], getGroupRowAgg: [{
                    type: i0.Input
                }], isGroupOpenByDefault: [{
                    type: i0.Input
                }], initialGroupOrderComparator: [{
                    type: i0.Input
                }], defaultGroupOrderComparator: [{
                    type: i0.Input
                }], processSecondaryColDef: [{
                    type: i0.Input
                }], processSecondaryColGroupDef: [{
                    type: i0.Input
                }], processPivotResultColDef: [{
                    type: i0.Input
                }], processPivotResultColGroupDef: [{
                    type: i0.Input
                }], getDataPath: [{
                    type: i0.Input
                }], getChildCount: [{
                    type: i0.Input
                }], getServerSideGroupLevelParams: [{
                    type: i0.Input
                }], getServerSideStoreParams: [{
                    type: i0.Input
                }], isServerSideGroupOpenByDefault: [{
                    type: i0.Input
                }], isApplyServerSideTransaction: [{
                    type: i0.Input
                }], isServerSideGroup: [{
                    type: i0.Input
                }], getServerSideGroupKey: [{
                    type: i0.Input
                }], getBusinessKeyForNode: [{
                    type: i0.Input
                }], getRowNodeId: [{
                    type: i0.Input
                }], getRowId: [{
                    type: i0.Input
                }], resetRowDataOnUpdate: [{
                    type: i0.Input
                }], processRowPostCreate: [{
                    type: i0.Input
                }], isRowSelectable: [{
                    type: i0.Input
                }], isRowMaster: [{
                    type: i0.Input
                }], fillOperation: [{
                    type: i0.Input
                }], postSort: [{
                    type: i0.Input
                }], postSortRows: [{
                    type: i0.Input
                }], getRowStyle: [{
                    type: i0.Input
                }], getRowClass: [{
                    type: i0.Input
                }], getRowHeight: [{
                    type: i0.Input
                }], isFullWidthCell: [{
                    type: i0.Input
                }], isFullWidthRow: [{
                    type: i0.Input
                }], toolPanelVisibleChanged: [{
                    type: i0.Output
                }], toolPanelSizeChanged: [{
                    type: i0.Output
                }], pasteStart: [{
                    type: i0.Output
                }], pasteEnd: [{
                    type: i0.Output
                }], columnVisible: [{
                    type: i0.Output
                }], columnPinned: [{
                    type: i0.Output
                }], columnResized: [{
                    type: i0.Output
                }], columnMoved: [{
                    type: i0.Output
                }], columnValueChanged: [{
                    type: i0.Output
                }], columnPivotModeChanged: [{
                    type: i0.Output
                }], columnPivotChanged: [{
                    type: i0.Output
                }], columnGroupOpened: [{
                    type: i0.Output
                }], newColumnsLoaded: [{
                    type: i0.Output
                }], gridColumnsChanged: [{
                    type: i0.Output
                }], displayedColumnsChanged: [{
                    type: i0.Output
                }], virtualColumnsChanged: [{
                    type: i0.Output
                }], columnEverythingChanged: [{
                    type: i0.Output
                }], componentStateChanged: [{
                    type: i0.Output
                }], cellValueChanged: [{
                    type: i0.Output
                }], cellEditRequest: [{
                    type: i0.Output
                }], rowValueChanged: [{
                    type: i0.Output
                }], cellEditingStarted: [{
                    type: i0.Output
                }], cellEditingStopped: [{
                    type: i0.Output
                }], rowEditingStarted: [{
                    type: i0.Output
                }], rowEditingStopped: [{
                    type: i0.Output
                }], undoStarted: [{
                    type: i0.Output
                }], undoEnded: [{
                    type: i0.Output
                }], redoStarted: [{
                    type: i0.Output
                }], redoEnded: [{
                    type: i0.Output
                }], filterOpened: [{
                    type: i0.Output
                }], filterChanged: [{
                    type: i0.Output
                }], filterModified: [{
                    type: i0.Output
                }], chartCreated: [{
                    type: i0.Output
                }], chartRangeSelectionChanged: [{
                    type: i0.Output
                }], chartOptionsChanged: [{
                    type: i0.Output
                }], chartDestroyed: [{
                    type: i0.Output
                }], cellKeyDown: [{
                    type: i0.Output
                }], cellKeyPress: [{
                    type: i0.Output
                }], gridReady: [{
                    type: i0.Output
                }], firstDataRendered: [{
                    type: i0.Output
                }], gridSizeChanged: [{
                    type: i0.Output
                }], modelUpdated: [{
                    type: i0.Output
                }], virtualRowRemoved: [{
                    type: i0.Output
                }], viewportChanged: [{
                    type: i0.Output
                }], bodyScroll: [{
                    type: i0.Output
                }], bodyScrollEnd: [{
                    type: i0.Output
                }], dragStarted: [{
                    type: i0.Output
                }], dragStopped: [{
                    type: i0.Output
                }], paginationChanged: [{
                    type: i0.Output
                }], rowDragEnter: [{
                    type: i0.Output
                }], rowDragMove: [{
                    type: i0.Output
                }], rowDragLeave: [{
                    type: i0.Output
                }], rowDragEnd: [{
                    type: i0.Output
                }], columnRowGroupChanged: [{
                    type: i0.Output
                }], rowGroupOpened: [{
                    type: i0.Output
                }], expandOrCollapseAll: [{
                    type: i0.Output
                }], pinnedRowDataChanged: [{
                    type: i0.Output
                }], rowDataChanged: [{
                    type: i0.Output
                }], rowDataUpdated: [{
                    type: i0.Output
                }], asyncTransactionsFlushed: [{
                    type: i0.Output
                }], cellClicked: [{
                    type: i0.Output
                }], cellDoubleClicked: [{
                    type: i0.Output
                }], cellFocused: [{
                    type: i0.Output
                }], cellMouseOver: [{
                    type: i0.Output
                }], cellMouseOut: [{
                    type: i0.Output
                }], cellMouseDown: [{
                    type: i0.Output
                }], rowClicked: [{
                    type: i0.Output
                }], rowDoubleClicked: [{
                    type: i0.Output
                }], rowSelected: [{
                    type: i0.Output
                }], selectionChanged: [{
                    type: i0.Output
                }], cellContextMenu: [{
                    type: i0.Output
                }], rangeSelectionChanged: [{
                    type: i0.Output
                }], sortChanged: [{
                    type: i0.Output
                }], columnRowGroupChangeRequest: [{
                    type: i0.Output
                }], columnPivotChangeRequest: [{
                    type: i0.Output
                }], columnValueChangeRequest: [{
                    type: i0.Output
                }], columnAggFuncChangeRequest: [{
                    type: i0.Output
                }] } });

    var AgGridModule = /** @class */ (function () {
        function AgGridModule() {
        }
        return AgGridModule;
    }());
    AgGridModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: AgGridModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    AgGridModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: AgGridModule, declarations: [AgGridAngular], exports: [AgGridAngular] });
    AgGridModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: AgGridModule });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0__namespace, type: AgGridModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        declarations: [AgGridAngular],
                        exports: [AgGridAngular]
                    }]
            }] });

    /**
     * Generated bundle index. Do not edit.
     */

    exports.AgGridAngular = AgGridAngular;
    exports.AgGridModule = AgGridModule;
    exports.AngularFrameworkComponentWrapper = AngularFrameworkComponentWrapper;
    exports.AngularFrameworkOverrides = AngularFrameworkOverrides;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=ag-grid-community-angular.umd.js.map
