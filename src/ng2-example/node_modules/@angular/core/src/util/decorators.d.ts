import { Type } from '../type';
/**
 * Declares the interface to be used with {@link Class}.
 *
 * @stable
 */
export interface ClassDefinition {
    /**
     * Optional argument for specifying the superclass.
     */
    extends?: Type<any>;
    /**
     * Required constructor function for a class.
     *
     * The function may be optionally wrapped in an `Array`, in which case additional parameter
     * annotations may be specified.
     * The number of arguments and the number of parameter annotations must match.
     *
     * See {@link Class} for example of usage.
     */
    constructor: Function | any[];
    /**
     * Other methods on the class. Note that values should have type 'Function' but TS requires
     * all properties to have a narrower type than the index signature.
     */
    [x: string]: Type<any> | Function | any[];
}
/**
 * An interface implemented by all Angular type decorators, which allows them to be used as ES7
 * decorators as well as
 * Angular DSL syntax.
 *
 * DSL syntax:
 *
 * ```
 * var MyClass = ng
 *   .Component({...})
 *   .Class({...});
 * ```
 *
 * ES7 syntax:
 *
 * ```
 * @ng.Component({...})
 * class MyClass {...}
 * ```
 * @stable
 */
export interface TypeDecorator {
    /**
     * Invoke as ES7 decorator.
     */
    <T extends Type<any>>(type: T): T;
    (target: Object, propertyKey?: string | symbol, parameterIndex?: number): void;
    /**
     * Storage for the accumulated annotations so far used by the DSL syntax.
     *
     * Used by {@link Class} to annotate the generated class.
     */
    annotations: any[];
    /**
     * Generate a class from the definition and annotate it with {@link TypeDecorator#annotations}.
     */
    Class(obj: ClassDefinition): Type<any>;
}
/**
 * Provides a way for expressing ES6 classes with parameter annotations in ES5.
 *
 * ## Basic Example
 *
 * ```
 * var Greeter = ng.Class({
 *   constructor: function(name) {
 *     this.name = name;
 *   },
 *
 *   greet: function() {
 *     alert('Hello ' + this.name + '!');
 *   }
 * });
 * ```
 *
 * is equivalent to ES6:
 *
 * ```
 * class Greeter {
 *   constructor(name) {
 *     this.name = name;
 *   }
 *
 *   greet() {
 *     alert('Hello ' + this.name + '!');
 *   }
 * }
 * ```
 *
 * or equivalent to ES5:
 *
 * ```
 * var Greeter = function (name) {
 *   this.name = name;
 * }
 *
 * Greeter.prototype.greet = function () {
 *   alert('Hello ' + this.name + '!');
 * }
 * ```
 *
 * ### Example with parameter annotations
 *
 * ```
 * var MyService = ng.Class({
 *   constructor: [String, [new Optional(), Service], function(name, myService) {
 *     ...
 *   }]
 * });
 * ```
 *
 * is equivalent to ES6:
 *
 * ```
 * class MyService {
 *   constructor(name: string, @Optional() myService: Service) {
 *     ...
 *   }
 * }
 * ```
 *
 * ### Example with inheritance
 *
 * ```
 * var Shape = ng.Class({
 *   constructor: (color) {
 *     this.color = color;
 *   }
 * });
 *
 * var Square = ng.Class({
 *   extends: Shape,
 *   constructor: function(color, size) {
 *     Shape.call(this, color);
 *     this.size = size;
 *   }
 * });
 * ```
 * @stable
 */
export declare function Class(clsDef: ClassDefinition): Type<any>;
export declare function makeDecorator(name: string, props: {
    [name: string]: any;
}, parentClass?: any, chainFn?: (fn: Function) => void): (...args: any[]) => (cls: any) => any;
export declare function makeParamDecorator(name: string, props: ([string, any] | {
    [name: string]: any;
})[], parentClass?: any): any;
export declare function makePropDecorator(name: string, props: ([string, any] | {
    [key: string]: any;
})[], parentClass?: any): any;
