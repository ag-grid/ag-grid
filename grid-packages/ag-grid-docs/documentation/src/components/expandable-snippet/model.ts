import { getJsonFromFile } from "../documentation-helpers";
import useJsonFileNodes from "../use-json-file-nodes";

type InterfaceLookupMetaType = string | { parameters: Record<string, string>, returnType: string };

type MetaRecord = {
    description?: string;
    doc?: string,
    type?: InterfaceLookupMetaType;
    typeParams?: string[],
    isTypeAlias?: boolean;
    isRequired?: boolean;
    default: any;
    min?: number;
    max?: number;
    unit?: string;
    options?: string[];
    suggestions?: string[];
    ordering?: {[prop: string]: OrderingPriority},
};

type OrderingPriority = 'high' | 'natural' | 'low';

export type InterfaceLookup = Record<
    string,
    {
        meta: MetaRecord & {
            [prop: string]: MetaRecord,
        };
        docs: Record<string, string>;
        type: Record<string, string> | string;
    }
>;

export type CodeLookup = Record<
    string,
    Record<
        string,
        {
            description: string;
            type: {
                arguments?: Record<string, string>;
                returnType: string;
                optional: boolean;
            };
        }
    >
>;

type Overrides = {
    _config_: {};
    [key: string]: { meta?: MetaRecord } & Record<string, MetaRecord>;
};

export type JsonPrimitiveProperty = {
    type: "primitive";
    tsType: string;
    aliasType?: string;
};

export type JsonObjectProperty = {
    type: "nested-object";
    tsType: string;
    model: JsonModel;
};

export type JsonArray = {
    type: "array";
    depth: number;
    elements: Exclude<JsonProperty, JsonArray>;
};

export type JsonUnionType = {
    type: "union";
    tsType: string;
    options: Exclude<JsonProperty, JsonUnionType>[];
};

export type JsonProperty = JsonPrimitiveProperty | JsonObjectProperty | JsonArray | JsonUnionType;

export type JsonModelProperty = {
    deprecated: boolean;
    required: boolean;
    documentation?: string;
    default?: any;
    desc: JsonProperty;
};

export interface JsonModel {
    type: "model";
    tsType: string;
    documentation?: string;
    properties: Record<string, JsonModelProperty>;
}

type Config = {
    includeDeprecated: boolean,
};

export function buildModel(
    type: string,
    interfaceLookup: InterfaceLookup,
    codeLookup: CodeLookup,
    config?: Partial<Config>,
    context?: { typeStack: string[], skipProperties: string[] }
): JsonModel {
    const includeDeprecated = config?.includeDeprecated ?? false;
    const iLookup = interfaceLookup[type] ?? interfaceLookup[plainType(type)];
    const cLookup = codeLookup[type] ?? codeLookup[plainType(type)];
    let { typeStack, skipProperties } = context || { typeStack: [], skipProperties: [] };
    const description = cLookup.description || iLookup?.meta?.doc;
    const { typeParams, ordering } = iLookup?.meta;

    const result: JsonModel = {
        type: "model",
        tsType: type,
        properties: {},
    };

    if (iLookup == null || cLookup == null) {
        return result;
    }
    if (typeStack.includes(type)) {
        return result;
    }
    typeStack = typeStack.concat([type]);

    const genericArgs: Record<string, string> = {};
    if (typeParams != null && typeParams.length > 0) {
        const genericParams = type.substring(type.indexOf('<') + 1, type.lastIndexOf('>'))
            .split(',')
            .map((p) => p.trim());
        typeParams.forEach((tp, idx) => {
            genericArgs[tp] = genericParams[idx];
        });
    }

    result.documentation = typeof description ==='string' ? description : undefined;
    Object.entries(cLookup).forEach(([prop, propCLookup]) => {
        if (prop === "meta") { return; }
        if (skipProperties.includes(prop)) { return; }

        const { meta, docs } = iLookup;
        const metaProp = meta?.[prop] || meta?.[prop + '?'];
        const docsProp = docs?.[prop] || docs?.[prop + '?'];
        const { description, type } = propCLookup;
        const { optional, returnType } = type || {
            optional: false,
            returnType: "unknown",
        };
        const documentation = description || docsProp;
        const { isRequired, default: def } = metaProp || { isRequired: !optional };

        const required = optional === false || isRequired === true;
        const deprecated = docsProp?.indexOf("@deprecated") >= 0;

        if (deprecated && !includeDeprecated) { return; }

        let declaredType: InterfaceLookupMetaType = meta[prop]?.type || returnType;
        if (typeof declaredType === 'object') {
            const params = Object.entries(declaredType.parameters)
                .map(([name, type]) => `${name}: ${type}`)
                .join(', ');
            declaredType = `(${params}) => ${declaredType.returnType}`;
        } else if (genericArgs[declaredType] != null) {
            declaredType = genericArgs[declaredType];
        }
        result.properties[prop] = {
            deprecated,
            required,
            documentation,
            default: def,
            desc: resolveType(declaredType, interfaceLookup, codeLookup, { typeStack }, config),
        };
    });

    if (ordering) {
        const newProperties = {};
        const naturalOrder = Object.keys(result.properties);
        Object.entries(result.properties)
            .sort((a,b) => compare(a, b, ordering, naturalOrder))
            .forEach(([k, v]) => {
                newProperties[k] = v;
            });

        result.properties = newProperties;
    }

    return result;
}

const ORDERING_PRIORITY: OrderingPriority[] = ['high', 'natural', 'low'];

function compare(
    propA: [string, JsonModelProperty],
    propB: [string, JsonModelProperty],
    ordering: MetaRecord['ordering'],
    naturalOrder: string[],
): number {
    const priorities = [
        ORDERING_PRIORITY.indexOf(ordering[propA[0]] || 'natural'),
        ORDERING_PRIORITY.indexOf(ordering[propB[0]] || 'natural'),
    ];

    if (priorities[0] != priorities[1]) {
        return priorities[0] - priorities[1];
    }

    const naturalPriority = ORDERING_PRIORITY.indexOf('natural');
    if (priorities[0] === naturalPriority) {
        return naturalOrder.indexOf(propA[0]) - naturalOrder.indexOf(propB[0]);
    }

    const orderingKeys = Object.keys(ordering);
    return orderingKeys.indexOf(propA[0]) - orderingKeys.indexOf(propB[0]);
}

const primitiveTypes = ["number", "string", "Date", "boolean", "any"];
type PropertyClass = "primitive" | "nested-object" | "union-nested-object" | "union-mixed" | "alias" | "unknown";

function resolveType(
    declaredType: string,
    interfaceLookup: InterfaceLookup,
    codeLookup: CodeLookup,
    context: { typeStack: string[] },
    config?: Partial<Config>,
): JsonProperty {
    let cleanedType = declaredType;
    let skipProperties: string[] = [];
    if (declaredType.startsWith('Omit<')) {
        const startTypeIndex = declaredType.indexOf('<') + 1;
        const endTypeIndex = declaredType.lastIndexOf(',');

        declaredType.substring(endTypeIndex + 1, declaredType.lastIndexOf('>'))
            .trim()
            .split('|')
            .forEach((omitted) => {
                const cleaned = omitted.trim()
                    .replace(/^'/, '')
                    .replace(/'$/, '');
                if (typeof cleaned === 'string') {
                    skipProperties.push(cleaned);
                }
            });

        cleanedType = declaredType.substring(startTypeIndex, endTypeIndex).trim();
    }

    const pType = plainType(cleanedType);
    const wrapping = typeWrapping(cleanedType);
    const { typeStack } = context;

    if (wrapping === "array") {
        return {
            type: "array",
            depth: cleanedType.match(/\[/).length,
            elements: resolveType(pType, interfaceLookup, codeLookup, context, config) as Exclude<
                JsonProperty,
                JsonArray
            >,
        };
    }

    const { resolvedClass, resolvedType } = typeClass(cleanedType, interfaceLookup, codeLookup);
    switch (resolvedClass) {
        case "primitive":
        case "unknown":
            return { type: "primitive", tsType: resolvedType };
        case "alias":
            return resolveType(resolvedType, interfaceLookup, codeLookup, context, config);
        case "union-nested-object":
        case "union-mixed":
            return {
                type: "union",
                tsType: declaredType,
                options: resolvedType.split("|")
                    .map(unionType => resolveType(unionType.trim(), interfaceLookup, codeLookup, context))
                    .filter((unionDesc): unionDesc is JsonUnionType['options'][number] => unionDesc.type !== 'union'),
            };
        case "nested-object":
            return {
                type: "nested-object",
                model: buildModel(resolvedType, interfaceLookup, codeLookup, config, { typeStack, skipProperties }),
                tsType: declaredType.trim(),
            };
    }
}

function plainType(type: string): string {
    const genericIndex = type.indexOf('<');
    if (genericIndex >= 0) {
        type = type.substring(0, genericIndex);
    }
    return type.replace(/[\[\]\?\!]/g, "");
} 


function typeClass(
    type: string,
    interfaceLookup: InterfaceLookup,
    codeLookup: CodeLookup
): { resolvedClass: PropertyClass; resolvedType: string } {
    const pType = plainType(type);

    if (primitiveTypes.includes(pType)) {
        return { resolvedClass: "primitive", resolvedType: type };
    }

    if (pType.indexOf("|") >= 0) {
        const unionItemResolvedClasses = pType.split("|")
            .map(t => typeClass(
                t.trim(),
                interfaceLookup,
                codeLookup
            ))
            .reduce((a, n) => a.add(n.resolvedClass), new Set<string>());
        if (unionItemResolvedClasses.size === 1) {
            switch (unionItemResolvedClasses.values().next().value) {
                case "alias":
                    return { resolvedClass: "unknown", resolvedType: type };
                case "primitive":
                    return { resolvedClass: "primitive", resolvedType: type };
                case "nested-object":
                    return { resolvedClass: "union-nested-object", resolvedType: type };
            }
        } else {
            return { resolvedClass: "union-mixed", resolvedType: type };
        }
    }

    if (pType.startsWith("'")) {
        return { resolvedClass: "primitive", resolvedType: type };
    }

    const iLookup = interfaceLookup[pType];
    if (iLookup == null) {
        return { resolvedClass: "unknown", resolvedType: type };
    }

    if (iLookup.meta.isTypeAlias) {
        if (typeof iLookup.type === "string") {
            return typeClass(iLookup.type, interfaceLookup, codeLookup);
        }

        return { resolvedClass: "alias", resolvedType: type };
    }

    return { resolvedClass: "nested-object", resolvedType: type };
}

type Wrapping = "none" | "array";
function typeWrapping(type: string): Wrapping {
    if (type.endsWith("]")) {
        return "array";
    }

    return "none";
}

export function loadLookups(overridesrc?: string): { interfaceLookup; codeLookup } {
    const interfaceLookup: InterfaceLookup = getJsonFromFile(
        useJsonFileNodes(),
        undefined,
        "grid-api/interfaces.AUTO.json"
    );
    const codeLookup: CodeLookup = getJsonFromFile(
        useJsonFileNodes(),
        undefined,
        "grid-api/doc-interfaces.AUTO.json"
    );

    if (overridesrc) {
        const overrides: Overrides = getJsonFromFile(useJsonFileNodes(), undefined, overridesrc);

        Object.entries(overrides).forEach(([type, override]) => {
            const def = interfaceLookup[type];

            if (override.meta) {
                Object.assign(def.meta, override.meta);
            }

            Object.entries(override)
                .filter(([prop]) => prop !== 'meta')
                .forEach(([prop, propOverride]) => {
                    def.meta[prop] = {
                        ...def.meta[prop],
                        ...propOverride,
                    };
                    def.docs[prop] = propOverride.description || def.docs[prop];
                    def.type[prop] = propOverride.type || def.type[prop];
                });
        });
    }

    return { interfaceLookup, codeLookup };
}
