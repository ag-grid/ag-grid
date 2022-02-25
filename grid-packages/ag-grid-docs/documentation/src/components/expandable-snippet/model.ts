import { getJsonFromFile } from "../documentation-helpers";
import useJsonFileNodes from "../use-json-file-nodes";

type MetaRecord = {
    description?: string;
    type?: string;
    isRequired?: boolean;
    default: any;
    min?: number;
    max?: number;
    unit?: string;
    options?: string[];
    suggestions?: string[];
};

type InterfaceLookupMetaType = string | { parameters: Record<string, string>, returnType: string };

export type InterfaceLookup = Record<
    string,
    {
        meta: {
            isTypeAlias?: boolean;
            type?: InterfaceLookupMetaType;
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
    [key: string]: Record<string, MetaRecord>;
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
    context?: { typeStack: string[] }
): JsonModel {
    const includeDeprecated = config?.includeDeprecated ?? false;
    const iLookup = interfaceLookup[type] ?? interfaceLookup[plainType(type)];
    const cLookup = codeLookup[type] ?? codeLookup[plainType(type)];
    let typeStack = context?.typeStack ?? [];

    const result: JsonModel = { type: "model", tsType: type, properties: {} };

    if (iLookup == null || cLookup == null) {
        return result;
    }
    if (typeStack.includes(type)) {
        console.warn('Type recursion terminated due to infinite loop at: ' + type);
        return result;
    }
    typeStack = typeStack.concat([type]);

    Object.entries(cLookup).forEach(([prop, propCLookup]) => {
        if (prop === "meta") {
            return;
        }

        const { meta, docs } = iLookup;
        const metaProp = meta?.[prop] || meta?.[prop + '?'] || {};
        const docsProp = docs?.[prop] || docs?.[prop + '?'];
        const { description, type } = propCLookup;
        const { optional, returnType } = type || {
            optional: false,
            returnType: "unknown",
        };
        const documentation = description || docsProp;
        const { isRequired, default: def } = metaProp;

        const required = optional === false || isRequired === true;
        const deprecated = docsProp?.indexOf("@deprecated") >= 0;

        if (deprecated && !includeDeprecated) { return; }

        let declaredType: InterfaceLookupMetaType = meta[prop]?.type || returnType;
        if (typeof declaredType === 'object') {
            const params = Object.entries(declaredType.parameters)
                .map(([name, type]) => `${name}: ${type}`)
                .join(', ');
            declaredType = `(${params}) => ${declaredType.returnType}`;
        }
        result.properties[prop] = {
            deprecated,
            required,
            documentation,
            default: def,
            desc: resolveType(declaredType, interfaceLookup, codeLookup, { typeStack }, config),
        };
    });

    return result;
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
    const pType = plainType(declaredType);
    const wrapping = typeWrapping(declaredType);
    const { typeStack } = context;

    if (wrapping === "array") {
        return {
            type: "array",
            depth: declaredType.match(/\[/).length,
            elements: resolveType(pType, interfaceLookup, codeLookup, context, config) as Exclude<
                JsonProperty,
                JsonArray
            >,
        };
    }

    const { resolvedClass, resolvedType } = typeClass(declaredType, interfaceLookup, codeLookup);
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
                tsType: resolvedType,
                options: resolvedType.split("|")
                    .map(unionType => resolveType(unionType.trim(), interfaceLookup, codeLookup, context))
                    .filter((unionDesc): unionDesc is JsonUnionType['options'][number] => unionDesc.type !== 'union'),
            };
        case "nested-object":
            return {
                type: "nested-object",
                model: buildModel(resolvedType, interfaceLookup, codeLookup, config, { typeStack }),
                tsType: resolvedType.trim(),
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

            Object.entries(override).forEach(([prop, propOverride]) => {
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
