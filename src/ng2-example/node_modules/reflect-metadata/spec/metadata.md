# Metadata Reflection API

> NOTE - This section is non-normative.

*A shim for this API can be found here: https://github.com/rbuckton/ReflectDecorators.*

## Syntax

> NOTE - This section is non-normative.

```JavaScript
// define metadata on an object or property
Reflect.defineMetadata(metadataKey, metadataValue, target);
Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);

// check for presence of a metadata key on the prototype chain of an object or property
let result = Reflect.hasMetadata(metadataKey, target);
let result = Reflect.hasMetadata(metadataKey, target, propertyKey);

// check for presence of an own metadata key of an object or property
let result = Reflect.hasOwnMetadata(metadataKey, target);
let result = Reflect.hasOwnMetadata(metadataKey, target, propertyKey);

// get metadata value of a metadata key on the prototype chain of an object or property
let result = Reflect.getMetadata(metadataKey, target);
let result = Reflect.getMetadata(metadataKey, target, propertyKey);

// get metadata value of an own metadata key of an object or property
let result = Reflect.getOwnMetadata(metadataKey, target);
let result = Reflect.getOwnMetadata(metadataKey, target, propertyKey);

// get all metadata keys on the prototype chain of an object or property
let result = Reflect.getMetadataKeys(target);
let result = Reflect.getMetadataKeys(target, propertyKey);

// get all own metadata keys of an object or property
let result = Reflect.getOwnMetadataKeys(target);
let result = Reflect.getOwnMetadataKeys(target, propertyKey);

// delete metadata from an object or property
let result = Reflect.deleteMetadata(metadataKey, target);
let result = Reflect.deleteMetadata(metadataKey, target, propertyKey);

// apply metadata via a decorator to a constructor
@Reflect.metadata(metadataKey, metadataValue)
class C {
  // apply metadata via a decorator to a method (property)
  @Reflect.metadata(metadataKey, metadataValue)
  method() {
  }
}
```

## Examples

> NOTE - This section is non-normative.

```JavaScript
// Design-time type annotations
function Type(type) { return Reflect.metadata("design:type", type); }
function ParamTypes(...types) { return Reflect.metadata("design:paramtypes", types); }
function ReturnType(type) { return Reflect.metadata("design:returntype", type); }

// Decorator application
@ParamTypes(String, Number)
class C {
  constructor(text, i) {
  }

  @Type(String)
  get name() { return "text"; }

  @Type(Function)
  @ParamTypes(Number, Number)
  @ReturnType(Number)
  add(x, y) {
    return x + y;
  }
}

// Metadata introspection
let obj = new C("a", 1);
let paramTypes = Reflect.getMetadata("design:paramtypes", inst, "add"); // [Number, Number]
```

# Abstract Operations

## Operations on Objects

### GetOrCreateMetadataMap ( O, P, Create )

When the abstract operation GetOrCreateMetadataMap is called with Object <var>O</var>, [property key][] <var>P</var>, and Boolean <var>Create</var> the following steps are taken:

  1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
  2. Let <var>metadataMap</var> be **undefined**.
  3. Let <var>succeeded</var> be **true**.
  4. Let <var>targetMetadata</var> be the value of <var>O</var>'s \[\[Metadata\]\] [internal slot][].
  5. If <var>targetMetadata</var> is **undefined**, then
    1. If <var>Create</var> is **false**, return **undefined**.
    2. Set <var>targetMetadata</var> to be a newly created **Map** object.
    3. Set the \[\[Metadata\]\] [internal slot][] of <var>O</var> to <var>targetMetadata</var>.
  6. Let <var>metadataMap</var> be [Invoke][](<var>targetMetadata</var>, `"get"`, <var>P</var>).
  7. [ReturnIfAbrupt][](<var>metadataMap</var>).
  8. If <var>metadataMap</var> is **undefined**, then
    1. If <var>Create</var> is **false**, return **undefined**.
    2. Set <var>metadataMap</var> to be a newly created **Map** object.
    3. Let <var>setStatus</var> be [Invoke][](<var>targetMetadata</var>, `"set"`, <var>P</var>, <var>metadataMap</var>).
    4. [ReturnIfAbrupt][](<var>setStatus</var>).
  9. Return <var>metadataMap</var>.

# Ordinary and Exotic Objects Behaviours

## Ordinary Object Internal Methods and Internal Slots

All ordinary objects have an [internal slot][] called \[\[Metadata\]\]. The value of this [internal slot][] is either **null** or a **Map** object and is used for storing metadata for an object.

### \[\[HasMetadata\]\] ( MetadataKey, P )

When the \[\[HasMetadata\]\] internal method of <var>O</var> is called with [ECMAScript language value][] <var>MetadataKey</var> and [property key][] <var>P</var>, the following steps are taken:

1. Return [OrdinaryHasMetadata][](<var>MetadataKey</var>, <var>O</var>, <var>P</var>).

### OrdinaryHasMetadata ( MetadataKey, O, P )

When the abstract operation OrdinaryHasMetadata is called with [ECMAScript language value][] <var>MetadataKey</var>, Object <var>O</var>, and [property key][] <var>P</var>, the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>hasOwn</var> be [OrdinaryHasOwnMetadata][](<var>MetadataKey</var>, <var>O</var>, <var>P</var>).
3. If <var>hasOwn</var> is **true**, return **true**.
4. Let <var>parent</var> be <var>O</var>.\[\[GetPrototypeOf\]\]().
5. [ReturnIfAbrupt][](<var>parent</var>).
6. If <var>parent</var> is not **null**, then
  1. return <var>parent</var>.\[\[HasMetadata\]\](<var>MetadataKey</var>, <var>P</var>).
7. Return **false**.

### \[\[HasOwnMetadata\]\] ( MetadataKey, P )

When the \[\[HasOwnMetadata\]\] internal method of <var>O</var> is called with [ECMAScript language value][] <var>MetadataKey</var> and [property key][] <var>P</var>, the following steps are taken:

1. Return [OrdinaryHasOwnMetadata][](<var>MetadataKey</var>, <var>O</var>, <var>P</var>).

### OrdinaryHasOwnMetadata ( MetadataKey, O, P )

When the abstract operation OrdinaryHasOwnMetadata is called with [ECMAScript language value][] <var>MetadataKey</var>, Object <var>O</var>, and [property key][] <var>P</var>, the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>metadataMap</var> be [GetOrCreateMetadataMap][](<var>O</var>, <var>P</var>, **false**).
3. [ReturnIfAbrupt][](<var>metadataMap</var>).
4. If <var>metadataMap</var> is **undefined**, return **false**.
5. Return [ToBoolean][]([Invoke][](<var>metadataMap</var>, `"has"`, <var>MetadataKey</var>)).

### \[\[GetMetadata\]\] ( MetadataKey, P )

When the \[\[GetMatadata\]\] internal method of <var>O</var> is called with [ECMAScript language value][] <var>MetadataKey</var> and [property key][] <var>P</var>, the following steps are taken:

1. Return [OrdinaryGetMetadata][](<var>MetadataKey</var>, <var>O</var>, <var>P</var>).

### OrdinaryGetMetadata ( MetadataKey, O, P )

When the abstract operation OrdinaryGetMetadata is called with [ECMAScript language value][] <var>MetadataKey</var>, Object <var>O</var>, and [property key][] <var>P</var>, the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>hasOwn</var> be [OrdinaryHasOwnMetadata][](<var>MetadataKey</var>, <var>O</var>, <var>P</var>).
3. If <var>hasOwn</var> is **true**, then
  1. return [OrdinaryGetOwnMetadata][](<var>MetadataKey</var>, <var>O</var>, <var>P</var>).
4. Let <var>parent</var> be <var>O</var>.\[\[GetPrototypeOf\]\]().
5. [ReturnIfAbrupt][](<var>parent</var>).
6. If <var>parent</var> is not **null**, then
  1. return <var>parent</var>.\[\[GetMetadata\]\](<var>MetadataKey</var>, <var>P</var>).
7. Return **undefined**.

### \[\[GetOwnMetadata\]\] ( MetadataKey, P, ParamIndex )

When the \[\[GetOwnMetadata\]\] internal method of <var>O</var> is called with [ECMAScript language value][] <var>MetadataKey</var> and [property key][] <var>P</var>, the following steps are taken:

1. Return [OrdinaryGetOwnMetadata][](<var>MetadataKey</var>, <var>O</var>, <var>P</var>).

### OrdinaryGetOwnMetadata ( MetadataKey, O, P )

When the abstract operation OrdinaryGetOwnMetadata is called with [ECMAScript language value][] <var>MetadataKey</var>, Object <var>O</var>, and [property key][] <var>P</var>, the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>metadataMap</var> be [GetOrCreateMetadataMap][](<var>O</var>, <var>P</var>, **false**).
3. [ReturnIfAbrupt][](<var>metadataMap</var>).
4. If <var>metadataMap</var> is **undefined**, return **undefined**.
5. Return [Invoke][](<var>metadataMap</var>, `"get"`, <var>MetadataKey</var>).

### \[\[DefineOwnMetadata\]\] ( MetadataKey, MetadataValue, P )

When the \[\[DefineOwnMetadata\]\] internal method of <var>O</var> is called with [ECMAScript language value][] <var>MetadataKey</var>, [ECMAScript language value][] <var>MetadataValue</var>, and [property key][] <var>P</var>, the following steps are taken:

1. Return [OrdinaryDefineOwnMetadata][](<var>MetadataKey</var>, <var>MetadataValue</var>, <var>O</var>, <var>P</var>)

### OrdinaryDefineOwnMetadata ( MetadataKey, MetadataValue, O, P )

When the abstract operation OrdinaryDefineOwnMetadata is called with [ECMAScript language value][] <var>MetadataKey</var>, [ECMAScript language value][] <var>MetadataValue</var>, Object <var>O</var>, and [property key][] <var>P</var>, the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>metadataMap</var> be [GetOrCreateMetadataMap][](<var>O</var>, <var>P</var>, **true**).
3. [ReturnIfAbrupt][](<var>metadataMap</var>).
4. Return [Invoke][](<var>metadataMap</var>, `"set"`, <var>MetadataKey</var>, <var>MetadataValue</var>).

### \[\[MetadataKeys\]\] ( P )

When the \[\[MetadataKeys\]\] internal method of <var>O</var> is called with [property key][] <var>P</var> the following steps are taken:

1. Return [OrdinaryMetadataKeys][](<var>O</var>, <var>P</var>).

### OrdinaryMetadataKeys ( O, P )

When the abstract operation OrdinaryMetadataKeys is called with Object <var>O</var> and [property key][] <var>P</var>, the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>ownKeys</var> be [OrdinaryOwnMetadataKeys][](<var>O</var>, <var>P</var>).
3. Let <var>parent</var> = <var>O</var>.\[\[GetPrototypeOf\]\]().
4. [ReturnIfAbrupt][](<var>parent</var>).
5. If <var>parent</var> is **null**, then return <var>ownKeys</var>.
6. Let <var>parentKeys</var> be <var>O</var>.\[\[OrdinaryMetadataKeys\]\](<var>P</var>).
7. [ReturnIfAbrupt][](<var>parentKeys</var>).
8. If <var>parentKeys</var> is empty, return <var>ownKeys</var>.
9. If <var>ownKeys</var> is empty, return <var>parentKeys</var>.
10. Let <var>set</var> be a newly created **Set** object.
11. Let <var>keys</var> be an empty [List][].
12. For each element <var>key</var> of <var>ownKeys</var>
  1. Let <var>hasKey</var> be [Invoke][](<var>set</var>, `"has"`, <var>key</var>).
  2. [ReturnIfAbrupt][](<var>hasKey</var>).
  3. If <var>hasKey</var> is **false**, then
    1. Let <var>addStatus</var> be [Invoke][](<var>set</var>, `"add"`, <var>key</var>).
    2. [ReturnIfAbrupt][](<var>addStatus</var>).
    3. Append <var>key</var> as an element of <var>keys</var>.
13. For each element <var>key</var> of <var>parentKeys</var>
  1. Let <var>hasKey</var> be [Invoke][](<var>set</var>, `"has"`, <var>key</var>).
  2. [ReturnIfAbrupt][](<var>hasKey</var>).
  3. If <var>hasKey</var> is **false**, then
    1. Let <var>addStatus</var> be [Invoke][](<var>set</var>, `"add"`, <var>key</var>).
    2. [ReturnIfAbrupt][](<var>addStatus</var>).
    3. Append <var>key</var> as an element of <var>keys</var>.
14. Return <var>keys</var>.

### \[\[OwnMetadataKeys\]\] ( P )

When the \[\[OwnMetadataKeys\]\] internal method of <var>O</var> is called with [property key][] <var>P</var>, the following steps are taken:

1. Return [OrdinaryOwnMetadataKeys][](<var>O</var>, <var>P</var>).

### OrdinaryOwnMetadataKeys ( O, P )

When the abstract operation OrdinaryOwnMetadataKeys is called with Object <var>O</var> and [property key][] <var>P</var> the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>metadataMap</var> be [GetOrCreateMetadataMap][](<var>O</var>, <var>P</var>, **false**).
3. [ReturnIfAbrupt][](<var>metadataMap</var>).
4. Let <var>keys</var> be an empty [List][].
5. If <var>metadataMap</var> is **undefined**, return <var>keys</var>.
6. Let <var>keysObj</var> be [Invoke][](<var>metadataMap</var>, `"keys"`).
7. [ReturnIfAbrupt][](<var>keysObj</var>).
8. Let <var>iterator</var> be [GetIterator][](<var>keysObj</var>).
9. [ReturnIfAbrupt][](<var>iterator</var>).
10. Repeat
  1. Let <var>next</var> be [IteratorStep][](<var>iterator</var>).
  2. [ReturnIfAbrupt][](<var>next</var>).
  3. If <var>next</var> is **false**, then
    1. Return <var>keys</var>.
  4. Let <var>nextValue</var> be [IteratorValue][](<var>next</var>).
  5. [ReturnIfAbrupt][](<var>nextValue</var>).
  6. Append <var>nextValue</var> as an element of <var>keys</var>.

### \[\[DeleteMetadata\]\]( MetadataKey, P )

When the \[\[DeleteMetadata\]\] internal method of <var>O</var> is called with [ECMAScript language value][] <var>MetadataKey</var> and [property key][] <var>P</var> the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>metadataMap</var> be [GetOrCreateMetadataMap][](<var>O</var>, <var>P</var>, **false**).
3. [ReturnIfAbrupt][](<var>metadataMap</var>).
4. If <var>metadataMap</var> is **undefined**, return **false**.
5. Return [ToBoolean][]([Invoke][](<var>metadataMap</var>, `"delete"`, <var>MetadataKey</var>)).

## Proxy Object Internal Methods and Internal Slots

This proposal adds the following additional proxy handler methods, as an addendum to [Table 30](https://tc39.github.io/ecma262/2016/#table-30):

| Internal Method           | Handler Method    |
|---------------------------|-------------------|
| \[\[HasMetadata\]\]       | `hasMetadata`     |
| \[\[HasOwnMetadata\]\]    | `hasOwnMetadata`  |
| \[\[GetMetadata\]\]       | `getMetadata`     |
| \[\[GetOwnMetadata\]\]    | `getOwnMetadata`  |
| \[\[MetadataKeys\]\]      | `metadataKeys`    |
| \[\[OwnMetadataKeys\]\]   | `ownMetadataKeys` |
| \[\[DefineOwnMetadata\]\] | `defineMetadata`  |
| \[\[DeleteMetadata\]\]    | `deleteMetadata`  |

### \[\[HasMetadata\]\] ( MetadataKey, P )

When the \[\[HasMetadata\]\] internal method of a Proxy exotic object <var>O</var> is called with [ECMAScript language value][] <var>MetadataKey</var> and [property key][] <var>P</var>, the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>handler</var> be the value of the \[\[ProxyHandler\]\] [internal slot][] of <var>O</var>.
3. If <var>handler</var> is **null**, throw a **TypeError** exception.
4. [Assert][]: [Type][](<var>handler</var>) is Object.
5. Let <var>target</var> be the value of the \[\[ProxyTarget\]\] [internal slot][] of <var>O</var>.
6. Let <var>trap</var> be [GetMethod][](<var>handler</var>, `"hasMetadata"`).
7. [ReturnIfAbrupt][](<var>trap</var>).
8. If <var>trap</var> is **undefined**, then
  1. Return <var>target</var>.\[\[HasMetadata\]\](<var>metadataKey</var>, <var>P</var>).
9. Return [ToBoolean][]([Call][](<var>trap</var>, <var>handler</var>, «<var>metadataKey</var>, <var>target</var>, <var>P</var>»)).

### \[\[HasOwnMetadata\]\] ( MetadataKey, P )

When the \[\[HasOwnMetadata\]\] internal method of a Proxy exotic object <var>O</var> is called with [ECMAScript language value][] <var>MetadataKey</var> and [property key][] <var>P</var>, the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>handler</var> be the value of the \[\[ProxyHandler\]\] [internal slot][] of <var>O</var>.
3. If <var>handler</var> is **null**, throw a **TypeError** exception.
4. [Assert][]: [Type][](<var>handler</var>) is Object.
5. Let <var>target</var> be the value of the \[\[ProxyTarget\]\] [internal slot][] of <var>O</var>.
6. Let <var>trap</var> be [GetMethod][](<var>handler</var>, `"hasOwnMetadata"`).
7. [ReturnIfAbrupt][](<var>trap</var>).
8. If <var>trap</var> is **undefined**, then
  1. Return <var>target</var>.\[\[HasOwnMetadata\]\](<var>metadataKey</var>, <var>P</var>).
9. Return [ToBoolean][]([Call][](<var>trap</var>, <var>handler</var>, «<var>metadataKey</var>, <var>target</var>, <var>P</var>»)).

### \[\[GetMetadata\]\] ( MetadataKey, P )

When the \[\[GetMatadata\]\] internal method of a Proxy exotic object <var>O</var> is called with [ECMAScript language value][] <var>MetadataKey</var> and [property key][] <var>P</var>, the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>handler</var> be the value of the \[\[ProxyHandler\]\] [internal slot][] of <var>O</var>.
3. If <var>handler</var> is **null**, throw a **TypeError** exception.
4. [Assert][]: [Type][](<var>handler</var>) is Object.
5. Let <var>target</var> be the value of the \[\[ProxyTarget\]\] [internal slot][] of <var>O</var>.
6. Let <var>trap</var> be [GetMethod][](<var>handler</var>, `"getMetadata"`).
7. [ReturnIfAbrupt][](<var>trap</var>).
8. If <var>trap</var> is **undefined**, then
  1. Return <var>target</var>.\[\[GetMetadata\]\](<var>metadataKey</var>, <var>P</var>).
9. Return [Call][](<var>trap</var>, <var>handler</var>, «<var>metadataKey</var>, <var>target</var>, <var>P</var>»).

### \[\[GetOwnMetadata\]\] ( MetadataKey, P, ParamIndex )

When the \[\[GetOwnMetadata\]\] internal method of a Proxy exotic object <var>O</var> is called with [ECMAScript language value][] <var>MetadataKey</var> and [property key][] <var>P</var>, the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>handler</var> be the value of the \[\[ProxyHandler\]\] [internal slot][] of <var>O</var>.
3. If <var>handler</var> is **null**, throw a **TypeError** exception.
4. [Assert][]: [Type][](<var>handler</var>) is Object.
5. Let <var>target</var> be the value of the \[\[ProxyTarget\]\] [internal slot][] of <var>O</var>.
6. Let <var>trap</var> be [GetMethod][](<var>handler</var>, `"getOwnMetadata"`).
7. [ReturnIfAbrupt][](<var>trap</var>).
8. If <var>trap</var> is **undefined**, then
  1. Return <var>target</var>.\[\[GetOwnMetadata\]\](<var>metadataKey</var>, <var>P</var>).
9. Return [Call][](<var>trap</var>, <var>handler</var>, «<var>metadataKey</var>, <var>target</var>, <var>P</var>»).

### \[\[DefineOwnMetadata\]\] ( MetadataKey, MetadataValue, P )

When the \[\[DefineOwnMetadata\]\] internal method of a Proxy exotic object <var>O</var> is called with [ECMAScript language value][] <var>MetadataKey</var>, [ECMAScript language value][] <var>MetadataValue</var>, and [property key][] <var>P</var>, the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>handler</var> be the value of the \[\[ProxyHandler\]\] [internal slot][] of <var>O</var>.
3. If <var>handler</var> is **null**, throw a **TypeError** exception.
4. [Assert][]: [Type][](<var>handler</var>) is Object.
5. Let <var>target</var> be the value of the \[\[ProxyTarget\]\] [internal slot][] of <var>O</var>.
6. Let <var>trap</var> be [GetMethod][](<var>handler</var>, `"defineMetadata"`).
7. [ReturnIfAbrupt][](<var>trap</var>).
8. If <var>trap</var> is **undefined**, then
  1. Return <var>target</var>.\[\[DefineOwnMetadata\]\](<var>metadataKey</var>, <var>metadataValue</var>, <var>P</var>).
9. Return [Call][](<var>trap</var>, <var>handler</var>, «<var>metadataKey</var>, <var>metadataValue</var>, <var>target</var>, <var>P</var>»).

### \[\[MetadataKeys\]\] ( P )

When the \[\[MetadataKeys\]\] internal method of a Proxy exotic object <var>O</var> is called with [property key][] <var>P</var> the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>handler</var> be the value of the \[\[ProxyHandler\]\] [internal slot][] of <var>O</var>.
3. If <var>handler</var> is **null**, throw a **TypeError** exception.
4. [Assert][]: [Type][](<var>handler</var>) is Object.
5. Let <var>target</var> be the value of the \[\[ProxyTarget\]\] [internal slot][] of <var>O</var>.
6. Let <var>trap</var> be [GetMethod][](<var>handler</var>, `"metadataKeys"`).
7. [ReturnIfAbrupt][](<var>trap</var>).
8. If <var>trap</var> is **undefined**, then
  1. Return <var>target</var>.\[\[MetadataKeys\]\](<var>P</var>).
9. Let <var>trapResultArray</var> be [Call][](<var>trap</var>, <var>handler</var>, «<var>target</var>, <var>P</var>»).
10. Return [CreateListFromArrayLike][](<var>trapResultArray</var>).

### \[\[OwnMetadataKeys\]\] ( P )

When the \[\[OwnMetadataKeys\]\] internal method of a Proxy exotic object <var>O</var> is called with [property key][] <var>P</var> the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>handler</var> be the value of the \[\[ProxyHandler\]\] [internal slot][] of <var>O</var>.
3. If <var>handler</var> is **null**, throw a **TypeError** exception.
4. [Assert][]: [Type][](<var>handler</var>) is Object.
5. Let <var>target</var> be the value of the \[\[ProxyTarget\]\] [internal slot][] of <var>O</var>.
6. Let <var>trap</var> be [GetMethod][](<var>handler</var>, `"ownMetadataKeys"`).
7. [ReturnIfAbrupt][](<var>trap</var>).
8. If <var>trap</var> is **undefined**, then
  1. Return <var>target</var>.\[\[OwnMetadataKeys\]\](<var>P</var>).
9. Let <var>trapResultArray</var> be [Call][](<var>trap</var>, <var>handler</var>, «<var>target</var>, <var>P</var>»).
10. Return [CreateListFromArrayLike][](<var>trapResultArray</var>).

### \[\[DeleteMetadata\]\]( MetadataKey, P )

When the \[\[DeleteMetadata\]\] internal method of a Proxy exotic object <var>O</var> is called with [ECMAScript language value][] <var>MetadataKey</var> and [property key][] <var>P</var> the following steps are taken:

1. [Assert][]: <var>P</var> is **undefined** or [IsPropertyKey][](<var>P</var>) is **true**.
2. Let <var>handler</var> be the value of the \[\[ProxyHandler\]\] [internal slot][] of <var>O</var>.
3. If <var>handler</var> is **null**, throw a **TypeError** exception.
4. [Assert][]: [Type][](<var>handler</var>) is Object.
5. Let <var>target</var> be the value of the \[\[ProxyTarget\]\] [internal slot][] of <var>O</var>.
6. Let <var>trap</var> be [GetMethod][](<var>handler</var>, `"deleteMetadata"`).
7. [ReturnIfAbrupt][](<var>trap</var>).
8. If <var>trap</var> is **undefined**, then
  1. Return <var>target</var>.\[\[DeleteMetadata\]\](<var>metadataKey</var>, <var>P</var>).
9. Return [ToBoolean][]([Call][](<var>trap</var>, <var>handler</var>, «<var>metadataKey</var>, <var>target</var>, <var>P</var>»)).

# Reflection

## The Reflect Object

This section contains amendments to the Reflect object.

### Metadata Decorator Functions

A [metadata decorator function][mdf] is an anonymous built-in function that has \[\[MetadataKey\]\] and \[\[MetadataValue\]\] [internal slots][internal slot].

When a metadata decorator function <var>F</var> is called with arguments <var>target</var> and <var>propertyKey</var>, the following steps are taken:

1. [Assert][]: <var>F</var> has a \[\[MetadataKey\]\] [internal slot][] whose value is an ECMAScript language value, or **undefined**.
2. [Assert][]: <var>F</var> has a \[\[MetadataValue\]\] [internal slot][] whose value is an ECMAScript language value, or **undefined**.
3. If [Type][](<var>target</var>) is not Object, throw a **TypeError** exception.
4. Let <var>key</var> be **undefined**.
5. If <var>propertyKey</var> is not **undefined**, then
  1. Set <var>key</var> to be [ToPropertyKey][](<var>propertyKey</var>).
6. [ReturnIfAbrupt][](<var>key</var>).
7. Let <var>metadataKey</var> be the value of <var>F</var>'s \[\[MetadataKey\]\] [internal slot][].
8. Let <var>metadataValue</var> be the value of <var>F</var>'s \[\[MetadataValue\]\] [internal slot][].
9. Return <var>target</var>.\[\[DefineMetadata\]\](<var>metadataKey</var>, <var>metadataValue</var>, <var>target</var>, <var>key</var>).

### Reflect.metadata ( metadataKey, metadataValue )

When the `metadata` function is called with arguments <var>metadataKey</var> and <var>metadataValue</var>, the following steps are taken:

1. Let <var>decorator</var> be a new built-in function object as defined in [Metadata Decorator Functions][mdf].
2. Set the \[\[MetadataKey\]\] [internal slot][] of <var>decorator</var> to <var>metadataKey</var>.
3. Set the \[\[MetadataValue\]\] [internal slot][] of <var>decorator</var> to <var>metadataValue</var>.
4. return <var>decorator</var>.

### Reflect.defineMetadata ( metadataKey, metadataValue, target, propertyKey )
When the `defineMetadata` function is called with arguments <var>metadataKey</var>, <var>metadataValue</var>, <var>target</var>, and <var>propertyKey</var>, the following steps are taken:

1. If [Type][](<var>target</var>) is not Object, throw a **TypeError** exception.
2. Let <var>key</var> be **undefined**.
3. If <var>propertyKey</var> is not **undefined**, then
  1. Set <var>key</var> to be [ToPropertyKey][](<var>propertyKey</var>).
  2. [ReturnIfAbrupt][](<var>key</var>).
4. return <var>target</var>.\[\[DefineMetadata\]\](<var>metadataKey</var>, <var>metadataValue</var>, <var>key</var>).

### Reflect.hasMetadata ( metadataKey, target \[, propertyKey\] )

When the `hasMetadata` function is called with arguments <var>metadataKey</var>, <var>target</var>, and <var>propertyKey</var>, the following steps are taken:

1. If [Type][](<var>target</var>) is not Object, throw a **TypeError** exception.
2. Let <var>key</var> be **undefined**.
3. If <var>propertyKey</var> is not **undefined**, then
  1. Set <var>key</var> to be [ToPropertyKey][](<var>propertyKey</var>).
  2. [ReturnIfAbrupt][](<var>key</var>).
4. return <var>target</var>.\[\[HasMetadata\]\](<var>metadataKey</var>, <var>key</var>).

### Reflect.hasOwnMetadata ( metadataKey, target \[, propertyKey\] )

When the `hasOwnMetadata` function is called with arguments <var>metadataKey</var>, <var>target</var>, and <var>propertyKey</var>, the following steps are taken:

1. If [Type][](<var>target</var>) is not Object, throw a **TypeError** exception.
2. Let <var>key</var> be **undefined**.
3. If <var>propertyKey</var> is not **undefined**, then
  1. Set <var>key</var> to be [ToPropertyKey][](<var>propertyKey</var>).
  2. [ReturnIfAbrupt][](<var>key</var>).
4. return <var>target</var>.\[\[HasOwn\]\](<var>metadataKey</var>, <var>key</var>).

### Reflect.getMetadata ( metadataKey, target \[, propertyKey\] )

When the `getMetadata` function is called with arguments <var>metadataKey</var>, <var>target</var>, and <var>propertyKey</var>, the following steps are taken:

1. If [Type][](<var>target</var>) is not Object, throw a **TypeError** exception.
2. Let <var>key</var> be **undefined**.
3. If <var>propertyKey</var> is not **undefined**, then
  1. Set <var>key</var> to be [ToPropertyKey][](<var>propertyKey</var>).
  2. [ReturnIfAbrupt][](<var>key</var>).
4. return <var>target</var>.\[\[GetMetadata\]\](<var>metadataKey</var>, <var>key</var>).

### Reflect.getOwnMetadata ( metadataKey, target \[, propertyKey\] )

When the `getOwnMetadata` function is called with arguments <var>metadataKey</var>, <var>target</var>, and <var>propertyKey</var>, the following steps are taken:

1. If [Type][](<var>target</var>) is not Object, throw a **TypeError** exception.
2. Let <var>key</var> be **undefined**.
3. If <var>propertyKey</var> is not **undefined**, then
  1. Set <var>key</var> to be [ToPropertyKey][](<var>propertyKey</var>).
  2. [ReturnIfAbrupt][](<var>key</var>).
4. return <var>target</var>.\[\[GetOwnMetadata\]\](<var>metadataKey</var>, <var>key</var>).

### Reflect.getMetadataKeys ( target \[, propertyKey\] )

When the `getMetadataKeys` function is called with arguments <var>target</var> and <var>propertyKey</var>, the following steps are taken:

1. If [Type][](<var>target</var>) is not Object, throw a **TypeError** exception.
2. Let <var>key</var> be **undefined**.
3. If <var>propertyKey</var> is not **undefined**, then
  1. Set <var>key</var> to be [ToPropertyKey][](<var>propertyKey</var>).
  2. [ReturnIfAbrupt][](<var>key</var>).
4. Let <var>keys</var> be <var>target</var>.\[\[GetMetadataKeys\]\](<var>key</var>).
5. Return [CreateArrayFromList][](<var>keys</var>).

### Reflect.getOwnMetadataKeys ( target \[, propertyKey\] )

When the `getOwnMetadataKeys` function is called with arguments <var>target</var> and <var>propertyKey</var>, the following steps are taken:

1. If [Type][](<var>target</var>) is not Object, throw a **TypeError** exception.
2. Let <var>key</var> be **undefined**.
3. If <var>propertyKey</var> is not **undefined**, then
  1. Set <var>key</var> to be [ToPropertyKey][](<var>propertyKey</var>).
  2. [ReturnIfAbrupt][](<var>key</var>).
4. Let <var>keys</var> be <var>target</var>.\[\[GetOwnMetadataKeys\]\](<var>key</var>).
5. Return [CreateArrayFromList][](<var>keys</var>).

### Reflect.deleteMetadata ( metadataKey, target \[, propertyKey\] )

When the `deleteMetadata` function is called with arguments <var>metadataKey</var>, <var>target</var>, and <var>propertyKey</var>, the following steps are taken:

1. If [Type][](<var>target</var>) is not Object, throw a **TypeError** exception.
2. Let <var>key</var> be **undefined**.
3. If <var>propertyKey</var> is not **undefined**, then
  1. Set <var>key</var> to be [ToPropertyKey][](<var>propertyKey</var>).
  2. [ReturnIfAbrupt][](<var>key</var>).
4. return <var>target</var>.\[\[DeleteMetadata\]\](<var>metadataKey</var>, <var>key</var>).

[ECMAScript language value]:      https://tc39.github.io/ecma262/2016/#sec-ecmascript-language-types
[property key]:                   https://tc39.github.io/ecma262/2016/#sec-object-type
[Completion Record]:              https://tc39.github.io/ecma262/2016/#sec-completion-record-specification-type
[internal slot]:                  https://tc39.github.io/ecma262/2016/#sec-object-internal-methods-and-internal-slots
[List]:                           https://tc39.github.io/ecma262/2016/#sec-list-and-record-specification-type
[ArrayCreate]:                    https://tc39.github.io/ecma262/2016/#sec-arraycreate
[Assert]:                         https://tc39.github.io/ecma262/2016/#sec-algorithm-conventions
[Call]:                           https://tc39.github.io/ecma262/2016/#sec-call
[CreateArrayFromList]:            https://tc39.github.io/ecma262/2016/#sec-createarrayfromlist
[CreateDataPropertyOrThrow]:      https://tc39.github.io/ecma262/2016/#sec-createdatapropertyorthrow
[CreateListFromArrayLike]:        https://tc39.github.io/ecma262/2016/#sec-createlistfromarraylike
[GetMethod]:                      https://tc39.github.io/ecma262/2016/#sec-getmethod
[Get]:                            https://tc39.github.io/ecma262/2016/#sec-get-o-p
[Set]:                            https://tc39.github.io/ecma262/2016/#sec-set-o-p-v-throw
[GetIterator]:                    https://tc39.github.io/ecma262/2016/#sec-getiterator
[Invoke]:                         https://tc39.github.io/ecma262/2016/#sec-invoke
[IsPropertyKey]:                  https://tc39.github.io/ecma262/2016/#sec-ispropertykey
[IteratorStep]:                   https://tc39.github.io/ecma262/2016/#sec-iteratorstep
[IteratorClose]:                  https://tc39.github.io/ecma262/2016/#sec-iteratorclose
[IteratorValue]:                  https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
[ReturnIfAbrupt]:                 https://tc39.github.io/ecma262/2016/#sec-returnifabrupt
[ToPrimitive]:                    https://tc39.github.io/ecma262/2016/#sec-toprimitive
[ToBoolean]:                      https://tc39.github.io/ecma262/2016/#sec-toboolean
[ToString]:                       https://tc39.github.io/ecma262/2016/#sec-tostring
[ToPropertyKey]:                  https://tc39.github.io/ecma262/2016/#sec-topropertykey
[Type]:                           https://tc39.github.io/ecma262/2016/#sec-ecmascript-data-types-and-values
[GetOrCreateMetadataMap]:         #getorcreatemetadatamap--o-p-create-
[OrdinaryDefineOwnMetadata]:      #ordinarydefineownmetadata--metadatakey-metadatavalue-o-p-
[OrdinaryGetMetadata]:            #ordinarygetmetadata--metadatakey-o-p-
[OrdinaryGetOwnMetadata]:         #ordinarygetownmetadata--metadatakey-o-p-
[OrdinaryHasMetadata]:            #ordinaryhasmetadata--metadatakey-o-p-
[OrdinaryHasOwnMetadata]:         #ordinaryhasownmetadata--metadatakey-o-p-
[OrdinaryMetadataKeys]:           #ordinarymetadatakeys--o-p-
[OrdinaryOwnMetadataKeys]:        #ordinaryownmetadatakeys--o-p-
[mdf]:                            #metadata-decorator-functions
