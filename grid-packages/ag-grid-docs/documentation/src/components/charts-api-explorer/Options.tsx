import classnames from 'classnames';
import React, { ReactNode, useState } from 'react';
import Code from '../Code';
import { convertMarkdown, formatJsDocString, inferType } from '../documentation-helpers';
import {
    buildModel,
    JsonFunction,
    JsonModel,
    JsonModelProperty,
    JsonObjectProperty,
    JsonProperty,
    JsonUnionType,
    loadLookups,
} from '../expandable-snippet/model';
import { Icon } from '../Icon';
import { doOnEnter } from '../key-handlers';
import { getPrimitiveEditor, getPrimitivePropertyEditor, PresetEditor } from './Editors';
import styles from './Options.module.scss';
import { deepClone, formatJson, isXAxisNumeric } from './utils';

const FunctionDefinition = ({ definition }: { definition: JsonFunction }) => {
    const lines = [`function ${definition.tsType};`];

    let typesToDisplay: JsonObjectProperty[] = [];
    const addTypeToDisplay = (property: JsonProperty) => {
        if (property.type === 'nested-object') {
            typesToDisplay.push(property);
            Object.values(property.model.properties).forEach((prop) => addTypeToDisplay(prop.desc));
        } else if (property.type === 'array') {
            addTypeToDisplay(property.elements);
        }
    };

    Object.values(definition.parameters).forEach((prop) => addTypeToDisplay(prop.desc));
    addTypeToDisplay(definition.returnType);

    let typesDisplayed = [];
    while (typesToDisplay.length > 0) {
        const desc = typesToDisplay.pop();

        if (typesDisplayed.includes(desc.tsType)) {
            return null;
        }
        typesDisplayed.push(desc.tsType);

        lines.push(
            '',
            `interface ${desc.tsType} {`,
            ...Object.entries(desc.model.properties).map(([key, value]) => `  ${key}: ${value.desc.tsType};`),
            '}'
        );
    }

    return <Code code={lines} />;
};

const Heading = ({ prefix, name, hasChevron }: { prefix: string; name: string; hasChevron?: boolean }) => {
    return (
        <h3>
            <span className={styles.prefix}>{denormalizeArrayIndexName(prefix)}</span>
            {name}
            {hasChevron && <Icon name="chevronRight" />}
        </h3>
    );
};

const Option = ({ name, isVisible, isRequired, type, description, defaultValue, Editor, editorProps, prefix }) => {
    const derivedType = type || inferType(defaultValue);
    const isFunction = derivedType != null && typeof derivedType === 'object';
    const descriptionHTML = description && convertMarkdown(formatJsDocString(description));
    const configureLinksForParent = (value) =>
        value.replace(/<a (.*?)href="([^"]+)"(.*?)>/g, '<a $1href="#" onclick="window.parent.location=\'../$2\'"$3>');

    return (
        <div
            className={classnames(styles.option, {
                [styles.hidden]: !isVisible,
            })}
        >
            <Heading prefix={prefix} name={name} />

            <ul className={classnames('list-style-none', styles.metaList)}>
                {derivedType && (
                    <li className={styles.metaItem}>
                        <span className={styles.metaLabel}>Type</span>
                        <code className={styles.metaValue}>{isFunction ? 'Function' : derivedType}</code>
                    </li>
                )}
                {isRequired ? (
                    <li className={styles.metaItem}>
                        <span className={styles.metaLabel}>Required</span>
                        <code className={styles.metaValue}>true</code>
                    </li>
                ) : defaultValue != null ? (
                    <li className={styles.metaItem}>
                        <span className={styles.metaLabel}>Default</span>
                        <code>{formatJson(defaultValue)}</code>
                    </li>
                ) : null}
            </ul>
            {isFunction && <FunctionDefinition definition={derivedType} />}
            {descriptionHTML && (
                <span dangerouslySetInnerHTML={{ __html: configureLinksForParent(descriptionHTML) }}></span>
            )}
            {Editor && <Editor value={defaultValue} {...editorProps} />}
            {!Editor && editorProps.options && (
                <span>
                    Options: <code>{editorProps.options.map(formatJson).join(' | ')}</code>
                </span>
            )}
        </div>
    );
};

const ComplexOption = ({ name, description, isVisible, isSearching, prefix, children }) => {
    const [isExpanded, setExpanded] = useState(false);
    const contentIsExpanded = isExpanded || isSearching;
    const descriptionHTML = description && convertMarkdown(formatJsDocString(description));

    return (
        <div
            className={classnames(styles.option, {
                [styles.hidden]: !isVisible,
            })}
        >
            <div
                className={classnames(styles.expandable, {
                    [styles.expanded]: contentIsExpanded,
                })}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onClick={() => setExpanded(!isExpanded)}
                onKeyDown={(e) => doOnEnter(e, () => setExpanded(!isExpanded))}
            >
                <Heading prefix={prefix} name={name} hasChevron />
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Type</span>
                    <code>Object</code>
                </div>
            </div>
            {descriptionHTML && <span dangerouslySetInnerHTML={{ __html: descriptionHTML }}></span>}
            <div
                className={classnames(styles.children, {
                    [styles.hidden]: !contentIsExpanded,
                })}
            >
                {children}
            </div>
        </div>
    );
};

interface UnionOptionParameters {
    name: string;
    prefix: string;
    desc: JsonUnionType;
    componentKey: string;
    parentMatchesSearch: boolean;
    requiresWholeObject: boolean;
    isVisible: boolean;
    documentation: string | undefined;
    context: GenerateOptionParameters['context'];
}

const UnionOption = ({
    componentKey,
    name,
    prefix,
    documentation,
    isVisible,
    desc,
    context,
    parentMatchesSearch,
    requiresWholeObject,
}: UnionOptionParameters) => {
    const commonProps = {
        key: componentKey,
        name,
        prefix,
        description: documentation || '',
        isVisible: isVisible,
    };
    const { isSearching, matchesSearch, isRequiresWholeObject, updateOption } = context;

    const [unionIndex, setUnionIndex] = useState(0);
    const { options } = desc;
    const optionTypes = options.map((d) =>
        d.type === 'nested-object' ? d.model.properties['type']?.desc?.tsType : d.tsType
    );
    const currentOption = options[unionIndex];

    return (
        <>
            {optionTypes.length > 1 && (
                <PresetEditor
                    value={optionTypes[unionIndex]}
                    onChange={(v) => setUnionIndex(optionTypes.indexOf(v))}
                    options={optionTypes}
                />
            )}
            {currentOption.type === 'nested-object' &&
                generateOptions({
                    model: currentOption.model,
                    prefix: `${componentKey}.`,
                    parentMatchesSearch: parentMatchesSearch || (isSearching && matchesSearch(name)),
                    requiresWholeObject: requiresWholeObject || isRequiresWholeObject(name),
                    context,
                })}
            {currentOption.type === 'primitive' && (
                <Option
                    {...commonProps}
                    type={desc.tsType}
                    isRequired={false}
                    defaultValue={undefined}
                    Editor={getPrimitivePropertyEditor(currentOption)}
                    editorProps={{
                        onChange: (newValue) => updateOption(componentKey, newValue, requiresWholeObject),
                    }}
                />
            )}
        </>
    );
};

const Search = ({ value, onChange }) => {
    return (
        <div className={styles.search}>
            <h2>Options</h2>
            <div className="input-field inline">
                <label htmlFor="search-options" className="input-label-inline">
                    Search:
                </label>{' '}
                <input
                    type="text"
                    id="search-options"
                    name="search-options"
                    value={value}
                    maxLength={20}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>
        </div>
    );
};

/**
 * This displays the list of options in the Standalone Charts API Explorer.
 */
export const Options = ({ chartType, updateOption }) => {
    const [searchText, setSearchText] = useState('');
    const getTrimmedSearchText = () => searchText.trim();
    const matchesSearch = (name: string) => name.toLowerCase().indexOf(getTrimmedSearchText().toLowerCase()) >= 0;
    const childMatchesSearch = (config: JsonProperty) => {
        if (config.type === 'array') {
            return childMatchesSearch(config.elements);
        }
        if (config.type === 'union') {
            return config.options.some((o) => childMatchesSearch(o));
        }
        if (config.type === 'primitive' || config.type === 'function') {
            return false;
        }
        return (
            Object.keys(config.model.properties).some((key) => matchesSearch(key)) ||
            Object.entries(config.model.properties).some(([_, value]) => childMatchesSearch(value.desc))
        );
    };
    const isRequiresWholeObject = (prop: string) => ['highlightStyle', 'item', 'series'].includes(prop);
    const isArraySkipped = (prop: string) =>
        ['series', 'axes', 'gridStyle', 'crossLines', 'innerLabels'].includes(prop);
    const isEditable = (key: string) => !['data', 'type', 'series.data'].includes(key);

    const isSearching = getTrimmedSearchText() !== '';

    const optionsType = chartType === 'pie' ? 'AgPolarChartOptions' : 'AgCartesianChartOptions';
    const { interfaceLookup, codeLookup } = loadLookups('charts-api', 'charts-api/api.json');
    const model = buildModel(optionsType, interfaceLookup, codeLookup);
    const seriesModelDesc = model.properties['series']?.desc;
    if (seriesModelDesc.type === 'array' && seriesModelDesc.elements.type === 'union') {
        seriesModelDesc.elements.options = seriesModelDesc.elements.options.filter(
            (o) => o.type === 'nested-object' && o.model.properties['type'].desc.tsType.indexOf(chartType) >= 0
        );
    }

    const axesModelDesc = model.properties['axes']?.desc;
    if (axesModelDesc?.type === 'array' && axesModelDesc.elements.type === 'union') {
        const isAxisOfType = (axis: any, type: string) => axis.model.properties['type'].desc.tsType.includes(type);
        const getAxisModel = (axisType: string, direction: 'x' | 'y') => {
            const axis = deepClone(
                (axesModelDesc.elements as any).options.find(
                    (o) => o.type === 'nested-object' && isAxisOfType(o, axisType)
                )
            );
            axis.model.properties.position.desc.tsType = direction === 'x' ? `'top' | 'bottom'` : `'left' | 'right'`;
            return axis;
        };
        const isXNumeric = isXAxisNumeric(chartType);

        // Replace "axes" array model with "axes[0]" and "axes[1]"
        // object models preserving the properties order
        const oldProps = model.properties;
        const keys = Object.keys(model.properties);
        const axesKeyIndex = keys.indexOf('axes');
        const newProps: Record<string, JsonModelProperty> = {};
        keys.slice(0, axesKeyIndex).forEach((key) => (newProps[key] = oldProps[key]));
        newProps['axes[0]'] = {
            deprecated: false,
            desc: getAxisModel(isXNumeric ? 'number' : 'category', 'x'),
            documentation: `/** X-axis (${isXNumeric ? 'numeric' : 'category'}). */`,
            required: false,
        };
        newProps['axes[1]'] = {
            deprecated: false,
            desc: getAxisModel('number', 'y'),
            documentation: '/** Y-axis (numeric). */',
            required: false,
        };
        keys.slice(axesKeyIndex + 1).forEach((key) => (newProps[key] = oldProps[key]));
        model.properties = newProps;
    }

    const context = {
        chartType,
        childMatchesSearch,
        hasResults: false,
        isArraySkipped,
        isEditable,
        isRequiresWholeObject,
        isSearching,
        matchesSearch,
        updateOption,
    };
    const options = generateOptions({
        model,
        prefix: '',
        parentMatchesSearch: false,
        requiresWholeObject: false,
        context,
    });

    return (
        <div className={styles.options}>
            <Search value={searchText} onChange={(value) => setSearchText(value)} />
            {isSearching && !context.hasResults && (
                <div className={styles.noContent}>No properties match your search: '{getTrimmedSearchText()}'</div>
            )}
            <div className={classnames(styles.content, { [styles.isSearching]: isSearching })}>{options}</div>
        </div>
    );
};

interface GenerateOptionParameters {
    model: JsonModel;
    prefix: string;
    parentMatchesSearch: boolean;
    requiresWholeObject: boolean;
    context: {
        chartType: string;
        isSearching: boolean;
        hasResults: boolean;
        matchesSearch(name: string): boolean;
        childMatchesSearch(prop: JsonProperty): boolean;
        updateOption(key: string, newValue: any, requiresWholeObject: boolean): void;
        isRequiresWholeObject(name: string): boolean;
        isArraySkipped(name: string): boolean;
        isEditable(name: string): boolean;
    };
}

/**
 * Turn array index like "axes[0]" into "axes.0"
 */
const normalizeArrayIndexName = (name) => name.replace(/\[(\d+)\]/g, '.$1');
const denormalizeArrayIndexName = (name) => name.replace(/\.(\d+)/g, '[$1]');

const generateOptions = ({
    model,
    prefix = '',
    parentMatchesSearch = false,
    requiresWholeObject = false,
    context,
}: GenerateOptionParameters): any[] => {
    const {
        chartType,
        isSearching,
        matchesSearch,
        childMatchesSearch,
        updateOption,
        isRequiresWholeObject,
        isArraySkipped,
        isEditable,
    } = context;
    let elements: ReactNode[] = [];

    Object.entries(model.properties).forEach(([name, prop]) => {
        const key = `${prefix}${normalizeArrayIndexName(name)}`;
        const componentKey = `${chartType}_${key}`;
        const {
            required,
            meta,
            meta: { options = null, suggestions = null } = {},
            default: defaultValue,
            documentation,
            desc,
            desc: { type },
        } = prop;

        const isVisible =
            !isSearching ||
            parentMatchesSearch ||
            matchesSearch(name) ||
            (type !== 'primitive' && childMatchesSearch(desc));

        if (isVisible) {
            context.hasResults = true;
        }

        let commonProps = {
            prefix,
            key: componentKey,
            name: name,
            description: documentation || '',
            isVisible: isVisible,
        };

        if (desc.type === 'primitive' || (desc.type === 'array' && desc.elements.type === 'primitive')) {
            const { editor, editorProps } = isEditable(key) && getPrimitiveEditor(prop, key);

            elements.push(
                <Option
                    {...commonProps}
                    type={desc.tsType}
                    isRequired={required}
                    defaultValue={defaultValue}
                    Editor={editor}
                    editorProps={{
                        ...editorProps,
                        onChange: (newValue) => updateOption(key, newValue, requiresWholeObject),
                    }}
                />
            );
        } else if (desc.type === 'nested-object') {
            elements.push(
                <ComplexOption
                    {...commonProps}
                    isVisible={isVisible || childMatchesSearch(desc)}
                    isSearching={isSearching}
                >
                    {generateOptions({
                        model: desc.model,
                        prefix: `${key}.`,
                        parentMatchesSearch: parentMatchesSearch || (isSearching && matchesSearch(name)),
                        requiresWholeObject: requiresWholeObject || isRequiresWholeObject(name),
                        context,
                    })}
                </ComplexOption>
            );
        } else if (desc.type === 'array' && desc.elements.type === 'union' && isArraySkipped(name)) {
            elements.push(
                <ComplexOption
                    {...commonProps}
                    isVisible={isVisible || childMatchesSearch(desc)}
                    isSearching={isSearching}
                >
                    <UnionOption
                        componentKey={key}
                        desc={desc.elements}
                        documentation={documentation}
                        isVisible={isVisible}
                        name={name}
                        prefix={prefix}
                        parentMatchesSearch={parentMatchesSearch}
                        requiresWholeObject={requiresWholeObject}
                        context={context}
                    />
                </ComplexOption>
            );
        } else if (desc.type === 'array' && desc.elements.type === 'nested-object' && isArraySkipped(name)) {
            elements.push(
                <ComplexOption
                    {...commonProps}
                    isVisible={isVisible || childMatchesSearch(desc)}
                    isSearching={isSearching}
                >
                    {generateOptions({
                        model: desc.elements.model,
                        prefix: `${key}.`,
                        parentMatchesSearch: parentMatchesSearch || (isSearching && matchesSearch(name)),
                        requiresWholeObject: requiresWholeObject || isRequiresWholeObject(name),
                        context,
                    })}
                </ComplexOption>
            );
        } else if (desc.type === 'function') {
            elements.push(
                <Option
                    {...commonProps}
                    type={desc}
                    isRequired={required}
                    defaultValue={defaultValue}
                    Editor={null}
                    editorProps={{}}
                />
            );
        } else if (options || suggestions) {
            elements.push(
                <Option
                    {...commonProps}
                    type={desc.tsType}
                    isRequired={required}
                    defaultValue={defaultValue}
                    Editor={PresetEditor}
                    editorProps={{
                        ...meta,
                        options: options || suggestions,
                        onChange: (newValue) => updateOption(key, newValue, requiresWholeObject),
                    }}
                />
            );
        } else {
            elements.push(
                <Option
                    {...commonProps}
                    type={desc.tsType}
                    isRequired={required}
                    defaultValue={defaultValue}
                    Editor={null}
                    editorProps={{}}
                />
            );
        }
    });

    return elements;
};
