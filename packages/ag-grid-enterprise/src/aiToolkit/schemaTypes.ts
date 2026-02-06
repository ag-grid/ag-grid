export type JSONSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null' | 'anyOf';

type NullableProperty<TType extends JSONSchemaType> = TType | [TType, 'null'];

interface SchemaProperty {
    type: JSONSchemaType | JSONSchemaType[];
    description?: string;
    $defs?: Record<string, JSONSchema>;
}

export interface ReferencedProperty {
    $ref: string;
    description?: never;
}

export interface AnyOfSchema {
    anyOf: JSONSchema[];
}

export type StringFormat = 'date-time' | 'date' | 'time' | 'duration' | 'email' | 'hostname' | 'ipv4' | 'ipv6' | 'uuid';

export interface StringSchema extends SchemaProperty {
    type: NullableProperty<'string'>;
    pattern?: string;
    format?: StringFormat;
}

export interface EnumSchema extends SchemaProperty {
    type: NullableProperty<'string'>;
    enum: (string | number | boolean)[];
}

export interface NumberSchema extends SchemaProperty {
    type: NullableProperty<'number' | 'integer'>;
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number;
    exclusiveMaximum?: number;
    multipleOf?: number;
}

export interface BooleanSchema extends SchemaProperty {
    type: NullableProperty<'boolean'>;
}

export interface ArraySchema extends SchemaProperty {
    type: NullableProperty<'array'>;
    items: JSONSchema;
    minItems?: number;
    maxItems?: number;
}

export interface ObjectSchema extends SchemaProperty {
    type: NullableProperty<'object'>;
    properties: Record<string, JSONSchema>;
    required: string[];
    additionalProperties: false;
    minProperties?: number;
    maxProperties?: number;
}
interface NullSchema extends SchemaProperty {
    type: 'null';
}

export type JSONSchema =
    | StringSchema
    | EnumSchema
    | NumberSchema
    | BooleanSchema
    | ObjectSchema
    | ArraySchema
    | NullSchema
    | ReferencedProperty
    | SchemaProperty
    | AnyOfSchema;
