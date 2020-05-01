"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("./observable");
var SubComponent = /** @class */ (function () {
    function SubComponent() {
        this.foo = 'bar';
    }
    return SubComponent;
}());
var Component = /** @class */ (function (_super) {
    __extends(Component, _super);
    function Component() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.john = 'smith';
        _this.bob = 'marley';
        _this.arr = [];
        _this.obj = {};
        return _this;
    }
    __decorate([
        observable_1.reactive('name', 'misc')
    ], Component.prototype, "john", void 0);
    __decorate([
        observable_1.reactive('name', 'misc')
    ], Component.prototype, "bob", void 0);
    __decorate([
        observable_1.reactive('change')
    ], Component.prototype, "foo", void 0);
    __decorate([
        observable_1.reactive()
    ], Component.prototype, "arr", void 0);
    __decorate([
        observable_1.reactive()
    ], Component.prototype, "obj", void 0);
    return Component;
}(observable_1.Observable));
var BaseClass = /** @class */ (function (_super) {
    __extends(BaseClass, _super);
    function BaseClass() {
        var _this = _super.call(this) || this;
        _this.foo = 5;
        _this.layoutTriggered = false;
        _this.addEventListener('layout', function () { return _this.layoutTriggered = true; });
        return _this;
    }
    __decorate([
        observable_1.reactive('layout')
    ], BaseClass.prototype, "foo", void 0);
    return BaseClass;
}(observable_1.Observable));
var SubClass = /** @class */ (function (_super) {
    __extends(SubClass, _super);
    function SubClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.bar = 10;
        return _this;
    }
    __decorate([
        observable_1.reactive('layout')
    ], SubClass.prototype, "bar", void 0);
    return SubClass;
}(BaseClass));
test('reactive', function () { return __awaiter(void 0, void 0, void 0, function () {
    var c, johnListenerPromise, nameCategoryListenerPromise;
    return __generator(this, function (_a) {
        c = new Component();
        expect(c.john).toBe('smith');
        johnListenerPromise = new Promise(function (resolve, reject) {
            c.addPropertyListener('john', function (event) {
                expect(event.type).toBe('john');
                expect(event.source).toBe(c);
                expect(event.oldValue).toBe('smith');
                expect(event.value).toBe('doe');
                resolve();
            });
        });
        nameCategoryListenerPromise = new Promise(function (resolve, reject) {
            c.addEventListener('name', function (event) {
                expect(event.type).toBe('name');
                resolve();
            });
        });
        c.john = 'doe';
        c.foo = 'blah';
        expect(c.foo).toBe('blah');
        return [2 /*return*/, Promise.all([johnListenerPromise, nameCategoryListenerPromise])];
    });
}); }, 100);
test('addPropertyListener', function () {
    var c = new Component();
    var sum = 0;
    var listener1 = function () { sum += 1; };
    var listener2 = function () { sum += 2; };
    var listener3 = function () { sum += 3; };
    expect(c.addPropertyListener('john', listener1)).toBe(undefined);
    c.addPropertyListener('john', listener2);
    c.addPropertyListener('john', listener3);
    c.john = 'test';
    expect(sum).toBe(6);
});
test('addPropertyListener', function () {
    var c = new Component();
    var sum = 0;
    var listener1 = function () { sum += 1; };
    var listener2 = function () { sum += 3; };
    var listener3 = function () { sum += 5; };
    c.addPropertyListener('john', listener1);
    c.addPropertyListener('john', listener2);
    c.addPropertyListener('john', listener3);
    c.john = 'test1';
    expect(sum).toBe(9);
    sum = 0;
    c.john = 'test1'; // value hasn't changed, no events fired
    expect(sum).toBe(0);
    sum = 0;
    c.removePropertyListener('john', listener1);
    c.john = 'test2';
    expect(sum).toBe(8);
    sum = 0;
    c.removePropertyListener('john', listener2);
    c.john = 'test3';
    expect(sum).toBe(5);
    sum = 0;
    c.removePropertyListener('john', listener3);
    c.john = 'test4';
    expect(sum).toBe(0);
});
test('addEventListener', function () {
    var c = new Component();
    var sum = 0;
    var eventSource;
    var listener1Scope;
    expect(c.addEventListener('name', function (event) {
        eventSource = event.source;
        listener1Scope = this;
        sum += 1;
    })).toBe(undefined);
    var that = {};
    var listener2Scope;
    c.addEventListener('name', function (event) {
        listener2Scope = this;
    }, that);
    c.john = 'test';
    c.bob = 'test';
    expect(sum).toBe(2);
    expect(eventSource).toBe(c);
    expect(listener1Scope).toBe(c);
    expect(listener2Scope).toBe(that);
    var arrChange = false;
    c.addPropertyListener('arr', function () { return arrChange = true; });
    c.arr = [];
    expect(arrChange).toBe(true);
    arrChange = false;
    c.arr = null;
    expect(arrChange).toBe(true);
    arrChange = false;
    c.arr = null;
    expect(arrChange).toBe(false);
    c.arr = undefined;
    expect(arrChange).toBe(true);
    var objChange = false;
    c.addPropertyListener('obj', function () { return objChange = true; });
    c.obj = {};
    expect(objChange).toBe(true);
    objChange = false;
    c.obj = null;
    expect(objChange).toBe(true);
    objChange = false;
    c.obj = null;
    expect(objChange).toBe(false);
    c.obj = undefined;
    expect(objChange).toBe(true);
});
test('removeEventListener', function () {
    var c = new Component();
    var sum = 0;
    var listener1 = function () { sum += 1; };
    var listener2 = function () { sum += 3; };
    var listener3 = function () { sum += 5; };
    c.addEventListener('name', listener1);
    c.addEventListener('name', listener2);
    c.addEventListener('name', listener3);
    c.john = 'test1';
    expect(sum).toBe(9);
    sum = 0;
    c.john = 'test1'; // value hasn't changed, no events fired
    expect(sum).toBe(0);
    sum = 0;
    c.removeEventListener('name', listener1);
    c.john = 'test2';
    expect(sum).toBe(8);
    sum = 0;
    c.removeEventListener('name', listener2);
    c.john = 'test3';
    expect(sum).toBe(5);
    sum = 0;
    c.removeEventListener('name', listener3);
    c.john = 'test4';
    expect(sum).toBe(0);
    var scopeSum = 0;
    function listener4() {
        scopeSum += this.$value || 1;
    }
    var scope1 = { $value: 5 };
    var scope2 = { $value: 7 };
    c.addEventListener('change', listener4);
    c.addEventListener('change', listener4, scope1);
    c.addEventListener('change', listener4, scope2);
    c.foo = 'lalala';
    expect(scopeSum).toBe(13);
    c.removeEventListener('change', listener4, scope2);
    scopeSum = 0;
    c.foo = 'lala';
    expect(scopeSum).toBe(6);
    c.removeEventListener('change', listener4, scope1);
    scopeSum = 0;
    c.foo = 'la';
    expect(scopeSum).toBe(1);
    c.removeEventListener('change', listener4);
    scopeSum = 0;
    c.foo = '';
    expect(scopeSum).toBe(0);
});
test('inheritance', function () {
    var subClass = new SubClass();
    subClass.bar = 42;
    expect(subClass.layoutTriggered).toBe(true);
    subClass.layoutTriggered = false;
    subClass.foo = 42;
    expect(subClass.layoutTriggered).toBe(true);
});
test('listener call order', function () {
    var c = new Component();
    var name = 2;
    var category = 2;
    var category2 = 2;
    c.addPropertyListener('bob', function () {
        name += 2;
        category += 2;
    });
    c.addPropertyListener('john', function () {
        name *= 3;
        category *= 3;
    });
    c.addEventListener('name', function () {
        category += 4;
        category2 += 2;
    });
    c.addEventListener('misc', function () {
        category2 *= 3;
    });
    c.bob = 'aaa';
    c.john = 'bbb';
    expect(name).toBe(12); // (2 + 2) * 3
    expect(category).toBe(28); // (2 + 2 + 4) * 3 + 4
    expect(category2).toBe(42); // ((2 + 2) * 3 + 2) * 3
});
//# sourceMappingURL=observable.test.js.map