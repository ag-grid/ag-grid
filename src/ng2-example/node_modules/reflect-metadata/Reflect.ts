/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
namespace Reflect {
    "use strict";

    interface HashMap<V> {
        [key: string]: V;
    }

    interface BufferLike {
        [offset: number]: number;
        length: number;
    }

    interface IteratorResult<T> {
        value?: T;
        done?: boolean;
    }

    interface Iterator<T> {
        next(value?: any): IteratorResult<T>;
        throw?(value: any): IteratorResult<T>;
        return?(value?: T): IteratorResult<T>;
    }

    interface Map<K, V> {
        size: number;
        clear(): void;
        delete(key: K): boolean;
        get(key: K): V;
        has(key: K): boolean;
        set(key: K, value?: V): Map<K, V>;
        keys?(): Iterator<K>;
        values?(): Iterator<V>;
        entries?(): Iterator<[K, V]>;
    }

    interface MapConstructor {
        new (): Map<any, any>;
        new <K, V>(): Map<K, V>;
        prototype: Map<any, any>;
    }

    interface Set<T> {
        size: number;
        add(value: T): Set<T>;
        clear(): void;
        delete(value: T): boolean;
        has(value: T): boolean;
        keys?(): Iterator<T>;
        values?(): Iterator<T>;
        entries?(): Iterator<[T, T]>;
    }

    interface SetConstructor {
        new (): Set<any>;
        new <T>(): Set<T>;
        prototype: Set<any>;
    }

    interface WeakMap<K, V> {
        clear(): void;
        delete(key: K): boolean;
        get(key: K): V;
        has(key: K): boolean;
        set(key: K, value?: V): WeakMap<K, V>;
    }

    interface WeakMapConstructor {
        new (): WeakMap<any, any>;
        new <K, V>(): WeakMap<K, V>;
        prototype: WeakMap<any, any>;
    }

    interface ForEachable<K, V> {
        forEach?(callbackfn: (value: V, index: K, map: ForEachable<K, V>) => void, thisArg?: any): void;
        entries?(): Iterator<[K, V]>;
    }

    declare const Set: SetConstructor;
    declare const WeakMap: WeakMapConstructor;
    declare const Map: MapConstructor;
    declare const global: any;
    declare const WorkerGlobalScope: any;
    declare const module: any;
    declare const crypto: Crypto;
    declare const msCrypto: Crypto;
    declare const require: Function;

    const hasOwn = Object.prototype.hasOwnProperty;

    // feature test for Object.create support
    const supportsCreate = typeof Object.create === "function";

    // feature test for __proto__ support
    const supportsProto = (function () {
        const sentinel = {};
        function __() { }
        __.prototype = sentinel;
        const instance = new (<any>__)();
        return instance.__proto__ === sentinel;
    })();

    // create an object in dictionary mode (a.k.a. "slow" mode in v8)
    const createDictionary =
        supportsCreate ? <V>() => MakeDictionary(Object.create(null) as HashMap<V>) :
            supportsProto ? <V>() => MakeDictionary({ __proto__: null } as HashMap<V>) :
                <V>() => MakeDictionary({} as HashMap<V>);

    namespace HashMap {
        const downLevel = !supportsCreate && !supportsProto;
        export const has = downLevel
            ? <V>(map: HashMap<V>, key: string | number) => hasOwn.call(map, key)
            : <V>(map: HashMap<V>, key: string | number) => key in map;
        export const get = downLevel
            ? <V>(map: HashMap<V>, key: string | number): V => hasOwn.call(map, key) ? map[key] : undefined
            : <V>(map: HashMap<V>, key: string | number): V => map[key];
    }

    // Load global or shim versions of Map, Set, and WeakMap
    const functionPrototype = Object.getPrototypeOf(Function);
    const _Map: typeof Map = typeof Map === "function" ? Map : CreateMapPolyfill();
    const _Set: typeof Set = typeof Set === "function" ? Set : CreateSetPolyfill();
    const _WeakMap: typeof WeakMap = typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();

    // [[Metadata]] internal slot
    const Metadata = new _WeakMap<Object, Map<string | symbol, Map<any, any>>>();

    /**
      * Applies a set of decorators to a target object.
      * @param decorators An array of decorators.
      * @param target The target object.
      * @returns The result of applying the provided decorators.
      * @remarks Decorators are applied in reverse order of their positions in the array.
      * @example
      *
      *     class Example { }
      *
      *     // constructor
      *     Example = Reflect.decorate(decoratorsArray, Example);
      *
      */
    export function decorate(decorators: ClassDecorator[], target: Function): Function;

    /**
      * Applies a set of decorators to a property of a target object.
      * @param decorators An array of decorators.
      * @param target The target object.
      * @param targetKey The property key to decorate.
      * @param descriptor A property descriptor
      * @remarks Decorators are applied in reverse order.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         static staticMethod() { }
      *         method() { }
      *     }
      *
      *     // property (on constructor)
      *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
      *
      *     // property (on prototype)
      *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
      *
      *     // method (on constructor)
      *     Object.defineProperty(Example, "staticMethod",
      *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
      *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
      *
      *     // method (on prototype)
      *     Object.defineProperty(Example.prototype, "method",
      *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
      *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
      *
      */
    export function decorate(decorators: (PropertyDecorator | MethodDecorator)[], target: Object, targetKey: string | symbol, descriptor?: PropertyDescriptor): PropertyDescriptor;

    /**
      * Applies a set of decorators to a property of a target object.
      * @param decorators An array of decorators.
      * @param target The target object.
      * @param targetKey (Optional) The property key to decorate.
      * @param targetDescriptor (Optional) The property descriptor for the target key
      * @remarks Decorators are applied in reverse order.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     Example = Reflect.decorate(decoratorsArray, Example);
      *
      *     // property (on constructor)
      *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
      *
      *     // property (on prototype)
      *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
      *
      *     // method (on constructor)
      *     Object.defineProperty(Example, "staticMethod",
      *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
      *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
      *
      *     // method (on prototype)
      *     Object.defineProperty(Example.prototype, "method",
      *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
      *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
      *
      */
    export function decorate(decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[], target: Object, targetKey?: string | symbol, targetDescriptor?: PropertyDescriptor): any {
        if (!IsUndefined(targetDescriptor)) {
            if (!IsArray(decorators)) throw new TypeError();
            if (!IsObject(target)) throw new TypeError();
            if (IsUndefined(targetKey)) throw new TypeError();
            if (!IsObject(targetDescriptor)) throw new TypeError();
            targetKey = ToPropertyKey(targetKey);
            return DecoratePropertyWithDescriptor(<MethodDecorator[]>decorators, target, targetKey, targetDescriptor);
        }
        else if (!IsUndefined(targetKey)) {
            if (!IsArray(decorators)) throw new TypeError();
            if (!IsObject(target)) throw new TypeError();
            targetKey = ToPropertyKey(targetKey);
            return DecoratePropertyWithoutDescriptor(<PropertyDecorator[]>decorators, target, targetKey);
        }
        else {
            if (!IsArray(decorators)) throw new TypeError();
            if (!IsConstructor(target)) throw new TypeError();
            return DecorateConstructor(<ClassDecorator[]>decorators, <Function>target);
        }
    }

    /**
      * A default metadata decorator factory that can be used on a class, class member, or parameter.
      * @param metadataKey The key for the metadata entry.
      * @param metadataValue The value for the metadata entry.
      * @returns A decorator function.
      * @remarks
      * If `metadataKey` is already defined for the target and target key, the
      * metadataValue for that key will be overwritten.
      * @example
      *
      *     // constructor
      *     @Reflect.metadata(key, value)
      *     class Example {
      *     }
      *
      *     // property (on constructor, TypeScript only)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         static staticProperty;
      *     }
      *
      *     // property (on prototype, TypeScript only)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         property;
      *     }
      *
      *     // method (on constructor)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         static staticMethod() { }
      *     }
      *
      *     // method (on prototype)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         method() { }
      *     }
      *
      */
    export function metadata(metadataKey: any, metadataValue: any) {
        function decorator(target: Function): void;
        function decorator(target: Object, targetKey: string | symbol): void;
        function decorator(target: Object, targetKey?: string | symbol): void {
            if (!IsUndefined(targetKey)) {
                if (!IsObject(target)) throw new TypeError();
                targetKey = ToPropertyKey(targetKey);
                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, targetKey);
            }
            else {
                if (!IsConstructor(target)) throw new TypeError();
                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, /*targetKey*/ undefined);
            }
        }
        return decorator;
    }

    /**
      * Define a unique metadata entry on the target.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param metadataValue A value that contains attached metadata.
      * @param target The target object on which to define metadata.
      * @example
      *
      *     class Example {
      *     }
      *
      *     // constructor
      *     Reflect.defineMetadata("custom:annotation", options, Example);
      *
      *     // decorator factory as metadata-producing annotation.
      *     function MyAnnotation(options): ClassDecorator {
      *         return target => Reflect.defineMetadata("custom:annotation", options, target);
      *     }
      *
      */
    export function defineMetadata(metadataKey: any, metadataValue: any, target: Object): void;

    /**
      * Define a unique metadata entry on the target.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param metadataValue A value that contains attached metadata.
      * @param target The target object on which to define metadata.
      * @param targetKey The property key for the target.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // property (on constructor)
      *     Reflect.defineMetadata("custom:annotation", Number, Example, "staticProperty");
      *
      *     // property (on prototype)
      *     Reflect.defineMetadata("custom:annotation", Number, Example.prototype, "property");
      *
      *     // method (on constructor)
      *     Reflect.defineMetadata("custom:annotation", Number, Example, "staticMethod");
      *
      *     // method (on prototype)
      *     Reflect.defineMetadata("custom:annotation", Number, Example.prototype, "method");
      *
      *     // decorator factory as metadata-producing annotation.
      *     function MyAnnotation(options): PropertyDecorator {
      *         return (target, key) => Reflect.defineMetadata("custom:annotation", options, target, key);
      *     }
      *
      */
    export function defineMetadata(metadataKey: any, metadataValue: any, target: Object, targetKey: string | symbol): void;

    /**
      * Define a unique metadata entry on the target.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param metadataValue A value that contains attached metadata.
      * @param target The target object on which to define metadata.
      * @param targetKey (Optional) The property key for the target.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     Reflect.defineMetadata("custom:annotation", options, Example);
      *
      *     // property (on constructor)
      *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
      *
      *     // property (on prototype)
      *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
      *
      *     // method (on constructor)
      *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
      *
      *     // method (on prototype)
      *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
      *
      *     // decorator factory as metadata-producing annotation.
      *     function MyAnnotation(options): Decorator {
      *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
      *     }
      *
      */
    export function defineMetadata(metadataKey: any, metadataValue: any, target: Object, targetKey?: string | symbol): void {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(targetKey)) targetKey = ToPropertyKey(targetKey);
        return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, targetKey);
    }

    /**
      * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
      * @example
      *
      *     class Example {
      *     }
      *
      *     // constructor
      *     result = Reflect.hasMetadata("custom:annotation", Example);
      *
      */
    export function hasMetadata(metadataKey: any, target: Object): boolean;

    /**
      * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey The property key for the target.
      * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // property (on constructor)
      *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    export function hasMetadata(metadataKey: any, target: Object, targetKey: string | symbol): boolean;

    /**
      * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.hasMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    export function hasMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): boolean {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(targetKey)) targetKey = ToPropertyKey(targetKey);
        return OrdinaryHasMetadata(metadataKey, target, targetKey);
    }

    /**
      * Gets a value indicating whether the target object has the provided metadata key defined.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
      * @example
      *
      *     class Example {
      *     }
      *
      *     // constructor
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
      *
      */
    export function hasOwnMetadata(metadataKey: any, target: Object): boolean;

    /**
      * Gets a value indicating whether the target object has the provided metadata key defined.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey The property key for the target.
      * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // property (on constructor)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    export function hasOwnMetadata(metadataKey: any, target: Object, targetKey: string | symbol): boolean;

    /**
      * Gets a value indicating whether the target object has the provided metadata key defined.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    export function hasOwnMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): boolean {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(targetKey)) targetKey = ToPropertyKey(targetKey);
        return OrdinaryHasOwnMetadata(metadataKey, target, targetKey);
    }

    /**
      * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
      * @example
      *
      *     class Example {
      *     }
      *
      *     // constructor
      *     result = Reflect.getMetadata("custom:annotation", Example);
      *
      */
    export function getMetadata(metadataKey: any, target: Object): any;

    /**
      * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey The property key for the target.
      * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // property (on constructor)
      *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    export function getMetadata(metadataKey: any, target: Object, targetKey: string | symbol): any;

    /**
      * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    export function getMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): any {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(targetKey)) targetKey = ToPropertyKey(targetKey);
        return OrdinaryGetMetadata(metadataKey, target, targetKey);
    }

    /**
      * Gets the metadata value for the provided metadata key on the target object.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
      * @example
      *
      *     class Example {
      *     }
      *
      *     // constructor
      *     result = Reflect.getOwnMetadata("custom:annotation", Example);
      *
      */
    export function getOwnMetadata(metadataKey: any, target: Object): any;

    /**
      * Gets the metadata value for the provided metadata key on the target object.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey The property key for the target.
      * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // property (on constructor)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    export function getOwnMetadata(metadataKey: any, target: Object, targetKey: string | symbol): any;

    /**
      * Gets the metadata value for the provided metadata key on the target object.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getOwnMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    export function getOwnMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): any {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(targetKey)) targetKey = ToPropertyKey(targetKey);
        return OrdinaryGetOwnMetadata(metadataKey, target, targetKey);
    }

    /**
      * Gets the metadata keys defined on the target object or its prototype chain.
      * @param target The target object on which the metadata is defined.
      * @returns An array of unique metadata keys.
      * @example
      *
      *     class Example {
      *     }
      *
      *     // constructor
      *     result = Reflect.getMetadataKeys(Example);
      *
      */
    export function getMetadataKeys(target: Object): any[];

    /**
      * Gets the metadata keys defined on the target object or its prototype chain.
      * @param target The target object on which the metadata is defined.
      * @param targetKey The property key for the target.
      * @returns An array of unique metadata keys.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // property (on constructor)
      *     result = Reflect.getMetadataKeys(Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getMetadataKeys(Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getMetadataKeys(Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getMetadataKeys(Example.prototype, "method");
      *
      */
    export function getMetadataKeys(target: Object, targetKey: string | symbol): any[];

    /**
      * Gets the metadata keys defined on the target object or its prototype chain.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns An array of unique metadata keys.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getMetadataKeys(Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getMetadataKeys(Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getMetadataKeys(Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getMetadataKeys(Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getMetadataKeys(Example.prototype, "method");
      *
      */
    export function getMetadataKeys(target: Object, targetKey?: string | symbol): any[] {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(targetKey)) targetKey = ToPropertyKey(targetKey);
        return OrdinaryMetadataKeys(target, targetKey);
    }

    /**
      * Gets the unique metadata keys defined on the target object.
      * @param target The target object on which the metadata is defined.
      * @returns An array of unique metadata keys.
      * @example
      *
      *     class Example {
      *     }
      *
      *     // constructor
      *     result = Reflect.getOwnMetadataKeys(Example);
      *
      */
    export function getOwnMetadataKeys(target: Object): any[];

    /**
      * Gets the unique metadata keys defined on the target object.
      * @param target The target object on which the metadata is defined.
      * @param targetKey The property key for the target.
      * @returns An array of unique metadata keys.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // property (on constructor)
      *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
      *
      */
    export function getOwnMetadataKeys(target: Object, targetKey: string | symbol): any[];

    /**
      * Gets the unique metadata keys defined on the target object.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns An array of unique metadata keys.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getOwnMetadataKeys(Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
      *
      */
    export function getOwnMetadataKeys(target: Object, targetKey?: string | symbol): any[] {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(targetKey)) targetKey = ToPropertyKey(targetKey);
        return OrdinaryOwnMetadataKeys(target, targetKey);
    }

    /**
      * Deletes the metadata entry from the target object with the provided key.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @returns `true` if the metadata entry was found and deleted; otherwise, false.
      * @example
      *
      *     class Example {
      *     }
      *
      *     // constructor
      *     result = Reflect.deleteMetadata("custom:annotation", Example);
      *
      */
    export function deleteMetadata(metadataKey: any, target: Object): boolean;

    /**
      * Deletes the metadata entry from the target object with the provided key.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey The property key for the target.
      * @returns `true` if the metadata entry was found and deleted; otherwise, false.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // property (on constructor)
      *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    export function deleteMetadata(metadataKey: any, target: Object, targetKey: string | symbol): boolean;

    /**
      * Deletes the metadata entry from the target object with the provided key.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns `true` if the metadata entry was found and deleted; otherwise, false.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.deleteMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    export function deleteMetadata(metadataKey: any, target: Object, targetKey?: string | symbol): boolean {
        // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#deletemetadata-metadatakey-p-
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(targetKey)) targetKey = ToPropertyKey(targetKey);
        const metadataMap = GetOrCreateMetadataMap(target, targetKey, /*create*/ false);
        if (IsUndefined(metadataMap)) return false;
        if (!metadataMap.delete(metadataKey)) return false;
        if (metadataMap.size > 0) return true;
        const targetMetadata = Metadata.get(target);
        targetMetadata.delete(targetKey);
        if (targetMetadata.size > 0) return true;
        Metadata.delete(target);
        return true;
    }

    function DecorateConstructor(decorators: ClassDecorator[], target: Function): Function {
        for (let i = decorators.length - 1; i >= 0; --i) {
            const decorator = decorators[i];
            const decorated = decorator(target);
            if (!IsUndefined(decorated)) {
                if (!IsConstructor(decorated)) throw new TypeError();
                target = <Function>decorated;
            }
        }
        return target;
    }

    function DecoratePropertyWithDescriptor(decorators: MethodDecorator[], target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
        for (let i = decorators.length - 1; i >= 0; --i) {
            const decorator = decorators[i];
            const decorated = decorator(target, propertyKey, descriptor);
            if (!IsUndefined(decorated)) {
                if (!IsObject(decorated)) throw new TypeError();
                descriptor = <PropertyDescriptor>decorated;
            }
        }
        return descriptor;
    }

    function DecoratePropertyWithoutDescriptor(decorators: PropertyDecorator[], target: Object, propertyKey: string | symbol): void {
        for (let i = decorators.length - 1; i >= 0; --i) {
            const decorator = decorators[i];
            decorator(target, propertyKey);
        }
    }

    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#getorcreatemetadatamap--o-p-create-
    function GetOrCreateMetadataMap(target: Object, targetKey: string | symbol, create: boolean): Map<any, any> {
        let targetMetadata = Metadata.get(target);
        if (!targetMetadata) {
            if (!create) return undefined;
            targetMetadata = new _Map<string | symbol, Map<any, any>>();
            Metadata.set(target, targetMetadata);
        }
        let keyMetadata = targetMetadata.get(targetKey);
        if (!keyMetadata) {
            if (!create) return undefined;
            keyMetadata = new _Map<any, any>();
            targetMetadata.set(targetKey, keyMetadata);
        }
        return keyMetadata;
    }

    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinaryhasmetadata--metadatakey-o-p-
    function OrdinaryHasMetadata(MetadataKey: any, O: Object, P: string | symbol): boolean {
        const hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
        if (hasOwn) return true;
        const parent = GetPrototypeOf(O);
        return parent !== null ? OrdinaryHasMetadata(MetadataKey, parent, P) : false;
    }

    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinaryhasownmetadata--metadatakey-o-p-
    function OrdinaryHasOwnMetadata(MetadataKey: any, O: Object, P: string | symbol): boolean {
        const metadataMap = GetOrCreateMetadataMap(O, P, /*create*/ false);
        return metadataMap !== undefined && Boolean(metadataMap.has(MetadataKey));
    }

    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinarygetmetadata--metadatakey-o-p-
    function OrdinaryGetMetadata(MetadataKey: any, O: Object, P: string | symbol): any {
        const hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
        if (hasOwn) return OrdinaryGetOwnMetadata(MetadataKey, O, P);
        const parent = GetPrototypeOf(O);
        return parent !== null ? OrdinaryGetMetadata(MetadataKey, parent, P) : undefined;
    }

    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinarygetownmetadata--metadatakey-o-p-
    function OrdinaryGetOwnMetadata(MetadataKey: any, O: Object, P: string | symbol): any {
        const metadataMap = GetOrCreateMetadataMap(O, P, /*create*/ false);
        return metadataMap === undefined ? undefined : metadataMap.get(MetadataKey);
    }

    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinarydefineownmetadata--metadatakey-metadatavalue-o-p-
    function OrdinaryDefineOwnMetadata(MetadataKey: any, MetadataValue: any, O: Object, P: string | symbol): void {
        const metadataMap = GetOrCreateMetadataMap(O, P, /*create*/ true);
        metadataMap.set(MetadataKey, MetadataValue);
    }

    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinarymetadatakeys--o-p-
    function OrdinaryMetadataKeys(O: Object, P: string | symbol): any[] {
        const ownKeys = OrdinaryOwnMetadataKeys(O, P);
        const parent = GetPrototypeOf(O);
        if (parent === null) return ownKeys;
        const parentKeys = OrdinaryMetadataKeys(parent, P);
        if (parentKeys.length <= 0) return ownKeys;
        if (ownKeys.length <= 0) return parentKeys;
        const keys = new _Set<any>();
        for (const key of ownKeys) keys.add(key);
        for (const key of parentKeys) keys.add(key);
        return getKeys(keys);
    }

    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinaryownmetadatakeys--o-p-
    function OrdinaryOwnMetadataKeys(target: Object, targetKey: string | symbol): any[] {
        const metadataMap = GetOrCreateMetadataMap(target, targetKey, /*create*/ false);
        const keys: any[] = [];
        if (metadataMap) forEach(metadataMap, (_, key) => keys.push(key));
        return keys;
    }

    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ecmascript-language-types-undefined-type
    function IsUndefined(x: any): boolean {
        return x === undefined;
    }

    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isarray
    function IsArray(x: any): boolean {
        return Array.isArray ? Array.isArray(x) : x instanceof Array || Object.prototype.toString.call(x) === "[object Array]";
    }

    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object-type
    function IsObject(x: any): boolean {
        return typeof x === "object" ? x !== null : typeof x === "function";
    }

    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor
    function IsConstructor(x: any): boolean {
        return typeof x === "function";
    }

    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ecmascript-language-types-symbol-type
    function IsSymbol(x: any): boolean {
        return typeof x === "symbol";
    }

    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-topropertykey
    function ToPropertyKey(value: any): string | symbol {
        return IsSymbol(value) ? <symbol>value : String(value);
    }

    function GetPrototypeOf(O: any): Object {
        const proto = Object.getPrototypeOf(O);
        if (typeof O !== "function" || O === functionPrototype) return proto;

        // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
        // Try to determine the superclass Exampleonstructor. Compatible implementations
        // must either set __proto__ on a subclass Exampleonstructor to the superclass Exampleonstructor,
        // or ensure each class has a valid `constructor` property on its prototype that
        // points back to the constructor.

        // If this is not the same as Function.[[Prototype]], then this is definately inherited.
        // This is the case when in ES6 or when using __proto__ in a compatible browser.
        if (proto !== functionPrototype) return proto;

        // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
        const prototype = O.prototype;
        const prototypeProto = prototype && Object.getPrototypeOf(prototype);
        if (prototypeProto == null || prototypeProto === Object.prototype) return proto;

        // If the constructor was not a function, then we cannot determine the heritage.
        const constructor = prototypeProto.constructor;
        if (typeof constructor !== "function") return proto;

        // If we have some kind of self-reference, then we cannot determine the heritage.
        if (constructor === O) return proto;

        // we have a pretty good guess at the heritage.
        return constructor;
    }

    function IteratorStep<T>(iterator: Iterator<T>): IteratorResult<T> {
        const result = iterator.next();
        return result.done ? undefined : result;
    }

    function IteratorClose<T>(iterator: Iterator<T>) {
        const f = iterator["return"];
        if (f) f.call(iterator);
    }

    function forEach<K, V>(source: ForEachable<K, V>, callback: (value: V, key: K, source: ForEachable<K, V>) => void, thisArg?: any) {
        const entries = source.entries;
        if (typeof entries === "function") {
            const iterator: Iterator<[K, V]> = entries.call(source);
            let result: IteratorResult<[K, V]>;
            try {
                while (result = IteratorStep(iterator)) {
                    const [key, value] = result.value;
                    callback.call(thisArg, value, key, source);
                }
            }
            finally { if (result) IteratorClose(iterator); }
        }
        else {
            const forEach = source.forEach;
            if (typeof forEach === "function") {
                forEach.call(source, callback, thisArg);
            }
        }
    }

    function getKeys<K, V>(source: ForEachable<K, V>) {
        const keys: K[] = [];
        forEach(source, (_, key) => { keys.push(key); });
        return keys;
    }

    // naive MapIterator shim
    function CreateMapIterator<K, V>(keys: K[], values: V[], kind: string): Iterator<K | V | [K, V]> {
        let index = 0;
        return {
            next() {
                if ((keys || values) && index < (keys || values).length) {
                    const current = index++;
                    switch (kind) {
                        case "key": return { value: keys[current], done: false };
                        case "value": return { value: values[current], done: false };
                        case "key+value": return { value: [keys[current], values[current]], done: false };
                    }
                }
                keys = undefined;
                values = undefined;
                return { value: undefined, done: true };
            },
            "throw"(error: any): any {
                if (keys || values) {
                    keys = undefined;
                    values = undefined;
                }
                throw error;
            },
            "return"(value: any) {
                if (keys || values) {
                    keys = undefined;
                    values = undefined;
                }
                return { value, done: true };
            }
        };
    }

    // naive Map shim
    function CreateMapPolyfill(): MapConstructor {
        const cacheSentinel = {};
        return class Map<K, V> {
            private _keys: K[] = [];
            private _values: V[] = [];
            private _cacheKey = cacheSentinel;
            private _cacheIndex = -2;
            get size() { return this._keys.length; }
            has(key: K): boolean { return this._find(key, /*insert*/ false) >= 0; }
            get(key: K): V {
                const index = this._find(key, /*insert*/ false);
                return index >= 0 ? this._values[index] : undefined;
            }
            set(key: K, value: V): Map<K, V> {
                const index = this._find(key, /*insert*/ true);
                this._values[index] = value;
                return this;
            }
            delete(key: K): boolean {
                const index = this._find(key, /*insert*/ false);
                if (index >= 0) {
                    const size = this._keys.length;
                    for (let i = index + 1; i < size; i++) {
                        this._keys[i - 1] = this._keys[i];
                        this._values[i - 1] = this._values[i];
                    }
                    this._keys.length--;
                    this._values.length--;
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                    return true;
                }
                return false;
            }
            clear(): void {
                this._keys.length = 0;
                this._values.length = 0;
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
            }
            keys() { return CreateMapIterator(this._keys, /*values*/ undefined, "key") as Iterator<K>; }
            values() { return CreateMapIterator(/*keys*/ undefined, this._values, "value") as Iterator<V>; }
            entries() { return CreateMapIterator(this._keys, this._values, "key+value") as Iterator<[K, V]>; }
            private _find(key: K, insert?: boolean): number {
                if (this._cacheKey === key) return this._cacheIndex;
                let index = this._keys.indexOf(key);
                if (index < 0 && insert) {
                    index = this._keys.length;
                    this._keys.push(key);
                    this._values.push(undefined);
                }
                return this._cacheKey = key, this._cacheIndex = index;
            }
        };
    }

    // naive Set shim
    function CreateSetPolyfill(): SetConstructor {
        return class Set<T> {
            private _map = new _Map<any, any>();
            get size() { return this._map.size; }
            has(value: T): boolean { return this._map.has(value); }
            add(value: T): Set<T> { return this._map.set(value, value), this; }
            delete(value: T): boolean { return this._map.delete(value); }
            clear(): void { this._map.clear(); }
            keys() { return this._map.keys(); }
            values() { return this._map.values(); }
            entries() { return this._map.entries(); }
        };
    }

    // naive WeakMap shim
    function CreateWeakMapPolyfill(): WeakMapConstructor {
        const UUID_SIZE = 16;
        const keys = createDictionary();
        const rootKey = CreateUniqueKey();
        return class WeakMap<K, V> {
            private _key = CreateUniqueKey();
            has(target: K): boolean {
                const table = GetOrCreateWeakMapTable<K>(target, /*create*/ false);
                return table !== undefined ? HashMap.has(table, this._key) : false;
            }
            get(target: K): V {
                const table = GetOrCreateWeakMapTable<K>(target, /*create*/ false);
                return table !== undefined ? HashMap.get(table, this._key) : undefined;
            }
            set(target: K, value: V): WeakMap<K, V> {
                const table = GetOrCreateWeakMapTable<K>(target, /*create*/ true);
                table[this._key] = value;
                return this;
            }
            delete(target: K): boolean {
                const table = GetOrCreateWeakMapTable<K>(target, /*create*/ false);
                return table !== undefined ? delete table[this._key] : false;
            }
            clear(): void {
                // NOTE: not a real clear, just makes the previous data unreachable
                this._key = CreateUniqueKey();
            }
        };

        function FillRandomBytes(buffer: BufferLike, size: number): BufferLike {
            for (let i = 0; i < size; ++i) buffer[i] = Math.random() * 0xff | 0;
            return buffer;
        }

        function GenRandomBytes(size: number): BufferLike {
            if (typeof Uint8Array === "function") {
                if (typeof crypto !== "undefined") return crypto.getRandomValues(new Uint8Array(size)) as Uint8Array;
                if (typeof msCrypto !== "undefined") return msCrypto.getRandomValues(new Uint8Array(size)) as Uint8Array;
                return FillRandomBytes(new Uint8Array(size), size);
            }
            return FillRandomBytes(new Array(size), size);
        }

        function CreateUUID() {
            const data = GenRandomBytes(UUID_SIZE);
            // mark as random - RFC 4122 § 4.4
            data[6] = data[6] & 0x4f | 0x40;
            data[8] = data[8] & 0xbf | 0x80;
            let result = "";
            for (let offset = 0; offset < UUID_SIZE; ++offset) {
                const byte = data[offset];
                if (offset === 4 || offset === 6 || offset === 8) result += "-";
                if (byte < 16) result += "0";
                result += byte.toString(16).toLowerCase();
            }
            return result;
        }

        function CreateUniqueKey(): string {
            let key: string;
            do key = "@@WeakMap@@" + CreateUUID();
            while (HashMap.has(keys, key));
            keys[key] = true;
            return key;
        }

        function GetOrCreateWeakMapTable<K>(target: K, create: boolean): HashMap<any> {
            if (!hasOwn.call(target, rootKey)) {
                if (!create) return undefined;
                Object.defineProperty(target, rootKey, { value: createDictionary<any>() });
            }
            return (<any>target)[rootKey];
        }
    }

    // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
    function MakeDictionary<T>(obj: T): T {
        (<any>obj).__DICTIONARY_MODE__ = 1;
        delete (<any>obj).____DICTIONARY_MODE__;
        return obj;
    }

    // patch global Reflect
    (function (__global: any) {
        if (typeof __global.Reflect !== "undefined") {
            if (__global.Reflect !== Reflect) {
                for (const p in Reflect) {
                    if (hasOwn.call(Reflect, p)) {
                        __global.Reflect[p] = (<any>Reflect)[p];
                    }
                }
            }
        }
        else {
            __global.Reflect = Reflect;
        }
    })(
        typeof window !== "undefined" ? window :
            typeof WorkerGlobalScope !== "undefined" ? self :
                typeof global !== "undefined" ? global :
                    Function("return this;")());
}