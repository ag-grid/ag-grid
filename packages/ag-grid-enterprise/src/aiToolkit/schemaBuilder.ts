import type {
    AnyOfSchema,
    ArraySchema,
    BooleanSchema,
    EnumSchema,
    JSONSchema,
    JSONSchemaType,
    NumberSchema,
    ObjectSchema,
    ReferencedProperty,
    StringFormat,
    StringSchema,
} from './schemaTypes';

export interface SchemaBuilder {
    toJSON(): JSONSchema;
    nullable(): SchemaBuilder;
}

abstract class BaseSchemaBuilder<TType extends JSONSchemaType> {
    abstract type: TType;
    description?: string;

    _defs: Record<string, JSONSchema> = {};
    _nullable: boolean = false;

    constructor(description?: string) {
        this.description = description;
    }

    _collectNestedDefs(schemas: JSONSchema[]): Record<string, JSONSchema> {
        const allDefs: Record<string, JSONSchema> = { ...this._defs };

        for (const schema of schemas) {
            if (schema && typeof schema === 'object' && '$defs' in schema) {
                Object.assign(allDefs, schema.$defs);
                delete (schema as any).$defs;
            }
        }

        return allDefs;
    }

    _toJSON(additionalProperties: Record<string, any> = {}) {
        const result: any = {
            type: this._nullable ? [this.type, 'null'] : this.type,
            description: this.description,
            ...additionalProperties,
        };

        if (Object.keys(this._defs).length > 0) {
            result.$defs = this._defs;
        }

        return result;
    }

    nullable(): this {
        this._nullable = true;
        return this;
    }

    define(id: string, schema: JSONSchema): this {
        this._defs[id] = schema;
        return this;
    }
}

class StringSchemaBuilder extends BaseSchemaBuilder<'string'> {
    readonly type = 'string';
    _pattern?: string;
    _format?: StringFormat;

    constructor(descriptionOrOptions?: string | { pattern?: string; format?: StringFormat; description?: string }) {
        super(typeof descriptionOrOptions === 'string' ? descriptionOrOptions : descriptionOrOptions?.description);

        if (typeof descriptionOrOptions === 'object' && descriptionOrOptions) {
            this._pattern = descriptionOrOptions.pattern;
            this._format = descriptionOrOptions.format;
        }
    }

    pattern(input: string): this {
        this._pattern = input;
        return this;
    }

    format(input: StringFormat): this {
        this._format = input;
        return this;
    }

    toJSON(): StringSchema {
        return this._toJSON({
            pattern: this._pattern,
            format: this._format,
        });
    }
}

class NumberSchemaBuilder extends BaseSchemaBuilder<'number' | 'integer'> {
    readonly type = 'number';
    _minimum?: number;
    _exclusiveMinimum?: number;
    _maximum?: number;
    _exclusiveMaximum?: number;
    _multipleOf?: number;

    constructor(
        descriptionOrOptions?:
            | string
            | {
                  minimum?: number;
                  maximum?: number;
                  exclusiveMinimum?: number;
                  exclusiveMaximum?: number;
                  multipleOf?: number;
                  description?: string;
              }
    ) {
        super(typeof descriptionOrOptions === 'string' ? descriptionOrOptions : descriptionOrOptions?.description);

        if (typeof descriptionOrOptions === 'object' && descriptionOrOptions) {
            this._minimum = descriptionOrOptions.minimum;
            this._maximum = descriptionOrOptions.maximum;
            this._exclusiveMinimum = descriptionOrOptions.exclusiveMinimum;
            this._exclusiveMaximum = descriptionOrOptions.exclusiveMaximum;
            this._multipleOf = descriptionOrOptions.multipleOf;
        }
    }

    minimum(value: number): this {
        this._minimum = value;
        return this;
    }

    exclusiveMinimum(value: number): this {
        this._exclusiveMinimum = value;
        return this;
    }

    maximum(value: number): this {
        this._maximum = value;
        return this;
    }

    exclusiveMaximum(value: number): this {
        this._exclusiveMaximum = value;
        return this;
    }

    multipleOf(value: number): this {
        this._multipleOf = value;
        return this;
    }

    toJSON(): NumberSchema {
        return this._toJSON({
            minimum: this._minimum,
            exclusiveMinimum: this._exclusiveMinimum,
            maximum: this._maximum,
            exclusiveMaximum: this._exclusiveMaximum,
            multipleOf: this._multipleOf,
        });
    }
}

class EnumSchemaBuilder extends BaseSchemaBuilder<'string'> {
    readonly type = 'string';

    constructor(
        readonly _enum: string[],
        description?: string
    ) {
        super(description);
    }

    toJSON(): EnumSchema {
        return this._toJSON({
            enum: this._enum,
        });
    }
}

class LiteralSchemaBuilder extends EnumSchemaBuilder {
    constructor(value: string, description?: string) {
        super([value], description);
    }
}

class BooleanSchemaBuilder extends BaseSchemaBuilder<'boolean'> {
    readonly type = 'boolean';

    constructor(description?: string) {
        super(description);
    }

    toJSON(): BooleanSchema {
        return this._toJSON();
    }
}

class ArraySchemaBuilder extends BaseSchemaBuilder<'array'> {
    readonly type = 'array';

    _minItems?: number;
    _maxItems?: number;

    constructor(
        readonly items: SchemaBuilder,
        descriptionOrOptions?: string | { minItems?: number; maxItems?: number; description?: string }
    ) {
        super(typeof descriptionOrOptions === 'string' ? descriptionOrOptions : descriptionOrOptions?.description);

        if (typeof descriptionOrOptions === 'object' && descriptionOrOptions) {
            this._minItems = descriptionOrOptions.minItems;
            this._maxItems = descriptionOrOptions.maxItems;
        }
    }

    minItems(value: number): this {
        this._minItems = value;
        return this;
    }

    maxItems(value: number): this {
        this._maxItems = value;
        return this;
    }

    toJSON(): ArraySchema {
        const itemsSchema = this.items.toJSON();

        const allDefs = this._collectNestedDefs([itemsSchema]);

        this._defs = allDefs;

        return this._toJSON({
            items: itemsSchema,
            minItems: this._minItems,
            maxItems: this._maxItems,
        });
    }
}

class ObjectSchemaBuilder extends BaseSchemaBuilder<'object'> {
    readonly type = 'object';

    constructor(
        readonly properties: Record<string, SchemaBuilder>,
        description?: string
    ) {
        super(description);
    }

    toJSON(): ObjectSchema {
        const propertySchemas = Object.fromEntries(
            Object.keys(this.properties).map((key) => [key, this.properties[key].toJSON()])
        );

        const allDefs = this._collectNestedDefs(Object.values(propertySchemas));

        this._defs = allDefs;

        return this._toJSON({
            required: Object.keys(this.properties),
            additionalProperties: false,
            properties: propertySchemas,
        });
    }
}

class UnionSchemaBuilder {
    private _nullable: boolean = false;
    private _defs: Record<string, JSONSchema> = {};

    constructor(
        private readonly schemas: SchemaBuilder[],
        description?: string
    ) {
        this.description = description;
    }

    description?: string;

    nullable(): this {
        this._nullable = true;
        return this;
    }

    define(id: string, schema: JSONSchema): this {
        this._defs[id] = schema;
        return this;
    }

    protected _collectNestedDefs(schemas: JSONSchema[]): Record<string, JSONSchema> {
        const allDefs: Record<string, JSONSchema> = this._defs;

        for (const schema of schemas) {
            if (schema && typeof schema === 'object' && '$defs' in schema) {
                Object.assign(allDefs, schema.$defs);
                delete (schema as any).$defs;
            }
        }

        return allDefs;
    }

    toJSON(): AnyOfSchema {
        const schemaJsons = this.schemas.map((x) => x.toJSON());

        const allDefs = this._collectNestedDefs(schemaJsons);

        const result: any = {
            anyOf: this._nullable ? [...schemaJsons, { type: 'null' }] : schemaJsons,
        };

        if (this.description) {
            result.description = this.description;
        }

        if (Object.keys(allDefs).length > 0) {
            result.$defs = allDefs;
        }

        return result;
    }
}

class ReferenceSchemaBuilder {
    constructor(private readonly id: string) {}

    nullable(): this {
        return this;
    }

    toJSON(): ReferencedProperty {
        return {
            $ref: `#/$defs/${this.id}`,
        };
    }
}

export const s = {
    string: (descriptionOrOptions?: string | { pattern?: string; format?: StringFormat; description?: string }) =>
        new StringSchemaBuilder(descriptionOrOptions),
    number: (
        descriptionOrOptions?:
            | string
            | {
                  minimum?: number;
                  maximum?: number;
                  exclusiveMinimum?: number;
                  exclusiveMaximum?: number;
                  multipleOf?: number;
                  description?: string;
              }
    ) => new NumberSchemaBuilder(descriptionOrOptions),
    enum: (values: string[], description?: string) => new EnumSchemaBuilder(values, description),
    boolean: (description?: string) => new BooleanSchemaBuilder(description),
    array: (
        items: SchemaBuilder,
        descriptionOrOptions?: string | { minItems?: number; maxItems?: number; description?: string }
    ) => new ArraySchemaBuilder(items, descriptionOrOptions),
    object: (properties: Record<string, SchemaBuilder>, description?: string) =>
        new ObjectSchemaBuilder(properties, description),
    union: (schemas: SchemaBuilder[], description?: string) => new UnionSchemaBuilder(schemas, description),
    literal: (value: string, description?: string) => new LiteralSchemaBuilder(value, description),
    ref: (id: string) => new ReferenceSchemaBuilder(id),
} as const;
