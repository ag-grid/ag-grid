import classnames from 'classnames';
import React, { useState } from 'react';
import Code from '../Code';
import { convertMarkdown, formatJsDocString, inferType } from '../documentation-helpers';
import {
    buildModel,
    JsonFunction,
    JsonModel,
    JsonObjectProperty,
    JsonProperty,
    JsonUnionType,
    loadLookups,
} from '../expandable-snippet/model';
import { doOnEnter } from '../key-handlers';
import { PresetEditor, getPrimitivePropertyEditor, getPrimitiveEditor } from './Editors';
import styles from './Options.module.scss';
import { formatJson } from './utils';

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
            return;
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

const Option = ({ name, isVisible, isAlternate, isRequired, type, description, defaultValue, Editor, editorProps }) => {
    const derivedType = type || inferType(defaultValue);
    const isFunction = derivedType != null && typeof derivedType === 'object';
    const descriptionHTML = description && convertMarkdown(formatJsDocString(description));
    const configureLinksForParent = (value) =>
        value.replace(/<a (.*?)href="([^"]+)"(.*?)>/g, '<a $1href="#" onclick="window.parent.location=\'../$2\'"$3>');

    return (
        <div
            className={classnames(styles['option'], {
                [styles['option--hidden']]: !isVisible,
                [styles['option--alternate']]: isAlternate,
            })}>
            <span className={styles['option__name']}>{name}</span>
            {derivedType && <span className={styles['option__type']}>{isFunction ? 'Function' : derivedType}</span>}
            {isRequired ? (
                <div className={styles['option__required']}>Required</div>
            ) : (
                <div className={styles['option__default']}>
                    Default:{' '}
                    {defaultValue != null ? (
                        <code className={styles['option__code']}>{formatJson(defaultValue)}</code>
                    ) : (
                        'N/A'
                    )}
                </div>
            )}
            <br />
            {isFunction && <FunctionDefinition definition={derivedType} />}
            {descriptionHTML ? (
                <>
                    <span
                        className={styles['option__description']}
                        dangerouslySetInnerHTML={{ __html: configureLinksForParent(descriptionHTML) }}></span>
                    <br />
                </>
            ) : (
                <></>
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

const ComplexOption = ({ name, description, isVisible, isAlternate, isSearching, children }) => {
    const [isExpanded, setExpanded] = useState(false);
    const contentIsExpanded = isExpanded || isSearching;
    const descriptionHTML = description && convertMarkdown(formatJsDocString(description));

    return (
        <div
            className={classnames(styles['option'], {
                [styles['option--hidden']]: !isVisible,
                [styles['option--alternate']]: isAlternate,
            })}>
            <div
                className={styles['option--expandable']}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onClick={() => setExpanded(!isExpanded)}
                onKeyDown={(e) => doOnEnter(e, () => setExpanded(!isExpanded))}>
                <span className={styles['option__name']}>{name}</span>
                <span className={styles['option__type']}>Object</span>
                <span
                    className={classnames(styles['option__expander'], {
                        [styles['option__expander--expanded']]: contentIsExpanded,
                    })}>
                    ❯
                </span>
                <br />
                {descriptionHTML && (
                    <span
                        className={styles['option__description']}
                        dangerouslySetInnerHTML={{ __html: descriptionHTML }}></span>
                )}
            </div>
            <div
                className={classnames(styles['option__content'], {
                    [styles['option__content--hidden']]: !contentIsExpanded,
                })}>
                {children}
            </div>
        </div>
    );
};

interface UnionOptionParameters {
    name: string;
    desc: JsonUnionType;
    componentKey: string;
    parentMatchesSearch: boolean;
    requiresWholeObject: boolean;
    isAlternate: boolean;
    isVisible: boolean;
    documentation: string | undefined;
    context: GenerateOptionParameters['context'];
}

const UnionOption = ({
    componentKey,
    name,
    documentation,
    isAlternate,
    isVisible,
    desc,
    context,
    parentMatchesSearch,
    requiresWholeObject,
}: UnionOptionParameters) => {
    const commonProps = {
        key: componentKey,
        name: name,
        description: documentation || '',
        isAlternate: isAlternate,
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
                    isAlternate: !isAlternate,
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
        <div className={styles['search']}>
            <div className={styles['search__title']}>
                <h2>Options</h2>
            </div>
            <div className={styles['search__box']}>
                Search:{' '}
                <input
                    className={styles['search__input']}
                    type="text"
                    value={value}
                    maxLength={20}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>
        </div>
    );
};

const CACHED_MODELS: Record<string, JsonModel> = {};

/**
 * This displays the list of options in the Standalone Charts API Explorer.
 */
export const Options = ({ chartType, axisType, updateOption }) => {
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
    const isArraySkipped = (prop: string) => ['series', 'axes', 'gridStyle', 'crossLines', 'innerLabels'].includes(prop);
    const isEditable = (prop: string) => !['data'].includes(prop);

    const isSearching = getTrimmedSearchText() !== '';

    const optionsType = chartType === 'pie' ? 'AgPolarChartOptions' : 'AgCartesianChartOptions';
    if (CACHED_MODELS[chartType] == null) {
        const { interfaceLookup, codeLookup } = loadLookups('charts-api', 'charts-api/api.json');
        const model = CACHED_MODELS[chartType] = buildModel(optionsType, interfaceLookup, codeLookup);
        const seriesModelDesc = model.properties['series']?.desc;
        if (seriesModelDesc.type === 'array' && seriesModelDesc.elements.type === 'union') {
            seriesModelDesc.elements.options = seriesModelDesc.elements.options.filter(
                (o) => o.type === 'nested-object' && o.model.properties['type'].desc.tsType.indexOf(chartType) >= 0
            );
        }
    
        const axesModelDesc = model.properties['axes']?.desc;
        if (axesModelDesc?.type === 'array' && axesModelDesc.elements.type === 'union') {
            axesModelDesc.elements.options = axesModelDesc.elements.options.filter(
                (o) => o.type === 'nested-object' && o.model.properties['type'].desc.tsType.indexOf(axisType) >= 0
            );
        }
    }

    const model = CACHED_MODELS[chartType];
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
        isAlternate: false,
        context,
    });

    return (
        <div className={styles['options']}>
            <Search value={searchText} onChange={(value) => setSearchText(value)} />
            {isSearching && !context.hasResults && (
                <div className={styles['options__no-content']}>
                    No properties match your search: '{getTrimmedSearchText()}'
                </div>
            )}
            <div className={styles['options__content']}>{options}</div>
        </div>
    );
};

interface GenerateOptionParameters {
    model: JsonModel;
    prefix: string;
    parentMatchesSearch: boolean;
    requiresWholeObject: boolean;
    isAlternate: boolean;
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

const generateOptions = ({
    model,
    prefix = '',
    parentMatchesSearch = false,
    requiresWholeObject = false,
    isAlternate = false,
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
    let elements: React.ReactFragment[] = [];

    Object.entries(model.properties).forEach(([name, prop]) => {
        const key = `${prefix}${name}`;
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
            key: componentKey,
            name: name,
            description: documentation || '',
            isAlternate: isAlternate,
            isVisible: isVisible,
        };

        if (desc.type === 'primitive' || (desc.type === 'array' && desc.elements.type === 'primitive')) {
            const { editor, editorProps } = isEditable(name) && getPrimitiveEditor(prop, key);

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
                    isSearching={isSearching}>
                    {generateOptions({
                        model: desc.model,
                        prefix: `${key}.`,
                        parentMatchesSearch: parentMatchesSearch || (isSearching && matchesSearch(name)),
                        requiresWholeObject: requiresWholeObject || isRequiresWholeObject(name),
                        isAlternate: !isAlternate,
                        context,
                    })}
                </ComplexOption>
            );
        } else if (desc.type === 'array' && desc.elements.type === 'union' && isArraySkipped(name)) {
            elements.push(
                <ComplexOption
                    {...commonProps}
                    isVisible={isVisible || childMatchesSearch(desc)}
                    isSearching={isSearching}>
                    <UnionOption
                        componentKey={key}
                        desc={desc.elements}
                        documentation={documentation}
                        isAlternate={isAlternate}
                        isVisible={isVisible}
                        name={name}
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
                    isSearching={isSearching}>
                    {generateOptions({
                        model: desc.elements.model,
                        prefix: `${key}.`,
                        parentMatchesSearch: parentMatchesSearch || (isSearching && matchesSearch(name)),
                        requiresWholeObject: requiresWholeObject || isRequiresWholeObject(name),
                        isAlternate: !isAlternate,
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

        if (isVisible) {
            isAlternate = !isAlternate;
        }
    });

    return elements;
};
