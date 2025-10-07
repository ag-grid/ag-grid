export type JSONSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null' | 'anyOf';

export interface SchemaProperty {
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
    type: 'string';
    pattern?: string;
    format?: StringFormat;
}

export const createStringSchema = (schema: Omit<StringSchema, 'type'>): StringSchema => ({
    type: 'string',
    ...schema,
});

export interface EnumSchema extends SchemaProperty {
    type: 'string';
    enum: (string | number | boolean)[];
}

export const createEnumSchema = (schema: Omit<EnumSchema, 'type'>): EnumSchema => ({
    type: 'string',
    ...schema,
});

export interface NumberSchema extends SchemaProperty {
    type: 'number' | 'integer';
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number;
    exclusiveMaximum?: number;
    multipleOf?: number;
}

export const createNumberSchema = (schema: Omit<NumberSchema, 'type'>): NumberSchema => ({
    type: 'number',
    ...schema,
});

export interface BooleanSchema extends SchemaProperty {
    type: 'boolean';
}

export const createBooleanSchema = (schema: Omit<BooleanSchema, 'type'>): BooleanSchema => ({
    type: 'boolean',
    ...schema,
});

export interface ArraySchema extends SchemaProperty {
    type: 'array';
    items: JSONSchema;
    minItems?: number;
    maxItems?: number;
}

export const createArraySchema = (schema: Omit<ArraySchema, 'type'>): ArraySchema => ({
    type: 'array',
    ...schema,
});

export interface ObjectSchema extends SchemaProperty {
    type: 'object';
    properties: Record<string, JSONSchema>;
    required: string[];
    additionalProperties: false;
    minProperties?: number;
    maxProperties?: number;
}

export const createObjectSchema = (
    schema: Omit<ObjectSchema, 'type' | 'additionalProperties' | 'required'>
): ObjectSchema => ({
    type: 'object',
    required: Object.keys(schema.properties),
    additionalProperties: false,
    ...schema,
});

export interface NullSchema extends SchemaProperty {
    type: 'null';
}

export const createNullSchema = (schema: Omit<NullSchema, 'type'>): NullSchema => ({
    type: 'null',
    ...schema,
});

export type JSONSchema =
    | StringSchema
    | EnumSchema
    | NumberSchema
    | BooleanSchema
    | ObjectSchema
    | ArraySchema
    | NullSchema
    | ReferencedProperty
    | AnyOfSchema;

export interface ChatGPTJSONSchema {
    name: string;
    description?: string;
    strict: true;
    schema: JSONSchema;
}
