import type { Framework } from '@ag-grid-types';
import styles from '@ag-website-shared/components/reference-documentation/ApiReference.module.scss';

import { AG_MODULE_TAG_NAME } from '../constants';
import type {
    ChildDocEntry,
    Config,
    GridModule,
    ICallSignature,
    InterfaceEntry,
    PropertyType,
    PropertyViewModel,
} from '../types';
import {
    convertMarkdown,
    extractJSDocTags,
    formatJsDocString,
    getTypeUrl,
    removeDefaultValue,
} from './documentation-helpers';
import { formatJson, getInterfaceName } from './interface-helpers';

function getDisplayNameSplit({ name, definition }: { name: string; definition: ChildDocEntry }) {
    let displayName = name;
    if (definition.isRequired) {
        displayName += `&nbsp;<span class="${styles.required}">required</span>`;
    }

    if (definition.strikeThrough) {
        displayName = `<span style='text-decoration: line-through'>${displayName}</span>`;
    }

    const { isRequired, strikeThrough } = definition;
    // displayName is hardCoded for isRequired and strikeThrough
    if (isRequired || strikeThrough) {
        return displayName;
    }

    // Split display name on capital letter, add <wbr> to improve text splitting across lines
    return displayName
        .split(/(?=[A-Z])/)
        .reverse()
        .reduce((acc, cv) => {
            return `${cv}<wbr />` + acc;
        });
}

function getDescription({
    definition,
    gridOpProp,
    framework,
}: {
    definition: ChildDocEntry;
    gridOpProp: InterfaceEntry;
    framework: Framework;
}) {
    let description: string | undefined = '';
    let isObject = false;
    let propDescription: string | undefined =
        definition.description || (gridOpProp && (gridOpProp.meta as ICallSignature['meta'])?.comment) || undefined;

    if (propDescription) {
        propDescription = formatJsDocString(propDescription);
        if (!definition.description && gridOpProp && (gridOpProp.meta as ICallSignature['meta'])?.all) {
            const { params, returns } = extractJSDocTags(
                definition.description || (gridOpProp && (gridOpProp.meta as ICallSignature['meta'])?.all)
            );
            const paramsStr = params?.map((p) => `<span class="param">\`${p.name}\`: ${p.value}</span>`).join('');
            const returnsStr = returns ? `<strong>Returns:</strong> ${returns}` : '';

            propDescription = [propDescription, paramsStr, returnsStr].filter(Boolean).join('\n');
        }

        description = convertMarkdown(propDescription, framework);
    } else {
        // this must be the parent of a child object
        if (definition.meta != null && definition.meta.description != null) {
            description = convertMarkdown(definition.meta.description, framework);
        }

        isObject = true;
    }

    return { isObject, description: removeDefaultValue(description) };
}

function getTagsData({
    definition,
    gridOpProp,
    config,
    allModules,
}: {
    definition: ChildDocEntry;
    gridOpProp: InterfaceEntry;
    config: Config;
    allModules?: GridModule[];
}) {
    // Default may or may not be on a new line in JsDoc but in both cases we want the default to be on the next line
    const tags = gridOpProp?.meta?.tags ?? definition?.tags ?? [];
    const jsdocDefault = tags.find((t) => t.name === 'default');
    const defaultValue = definition?.default ?? jsdocDefault?.comment;
    const formattedDefaultValue = Array.isArray(defaultValue)
        ? '[' +
          defaultValue.map((v, i) => {
              return i === 0 ? `"${v}"` : ` "${v}"`;
          }) +
          ']'
        : defaultValue;
    const isInitial = tags.some((t) => t.name === 'initial') ?? false;

    // Module badges are an apiDocumentation concern: interfaceDocumentation passes no module
    // data and has never shown them.
    const moduleTag = allModules && tags.find((t) => t.name === AG_MODULE_TAG_NAME);
    let modules = moduleTag
        ? moduleTag.comment
              .replace(/`/g, '')
              .split(/\s*\/\s*/)
              .map((m) => m.trim())
              .filter(Boolean)
              .map((name) => ({ name, isEnterprise: allModules?.find((mod) => mod.moduleName === name)?.isEnterprise }))
        : [];

    const restrictedModule: string | undefined = definition?.restrictModule ?? config.restrictModule;
    if (modules.length > 1 && restrictedModule) {
        // If the property contains the restricted module and others then only show the restricted module
        const restrictedModuleTag = modules.find((mod) => restrictedModule == mod.name);
        if (restrictedModuleTag) {
            modules = [restrictedModuleTag];
        }
    }

    return { formattedDefaultValue, isInitial, modules };
}

/**
 * Resolve everything a property row renders, so the island receives display strings rather than
 * the generated TypeScript metadata they are derived from (SE-115).
 */
export function getPropertyViewModel({
    name,
    framework,
    definition,
    gridOpProp,
    type,
    propertyType,
    config,
    allModules,
    detailsKey,
    detailsCode,
}: {
    name: string;
    framework: Framework;
    definition: ChildDocEntry;
    gridOpProp: InterfaceEntry;
    type: PropertyType | string;
    propertyType: string;
    config: Config;
    allModules?: GridModule[];
    detailsKey?: string;
    detailsCode?: string;
}): PropertyViewModel {
    const { isObject, description } = getDescription({ definition, gridOpProp, framework });
    const { formattedDefaultValue, isInitial, modules } = getTagsData({
        definition,
        gridOpProp,
        config,
        allModules,
    });

    return {
        displayNameSplit: getDisplayNameSplit({ name, definition }),
        description,
        isObject,
        // The object case links to its own section, which only the rendering <Section> knows the id of.
        typeUrl: isObject || propertyType === 'Function' ? undefined : (getTypeUrl(type, framework) ?? undefined),
        propertyType,
        interfaceName: isObject ? getInterfaceName(name) : undefined,
        defaultValue: formattedDefaultValue ?? undefined,
        isInitial,
        modules,
        more: definition.more,
        options: definition.options?.map((option) => formatJson(option)),
        detailsKey,
        detailsCode,
        // ObjectCodeSample still reads the raw entry, and nothing sets showSnippets today.
        definition: config.showSnippets ? definition : undefined,
    };
}
