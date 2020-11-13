import React, { useState } from 'react';
import { formatJson } from './utils.jsx';
import * as Config from './config.jsx';
import { CodeSnippet } from './CodeSnippet.jsx';
import styles from './Options.module.scss';

const getType = value => {
    if (value == null) {
        return null;
    }

    if (Array.isArray(value)) {
        return value.length ? `${getType(value[0])}[]` : 'object[]';
    }

    return typeof value;
};

const FunctionDefinition = ({ definition }) => {
    const { parameters, returnType } = definition;
    const returnTypeIsObject = typeof returnType === 'object';

    const lines = [`function (params: ParamsType): ${returnTypeIsObject ? 'ReturnType' : returnType};`,
        '',
        'interface ParamsType {',
    ...Object.keys(parameters).map(key => `  ${key}: ${parameters[key]};`),
        '}',
    ];

    if (returnTypeIsObject) {
        lines.push(
            '',
            'interface ReturnType {',
            ...Object.keys(returnType).map(key => `  ${key}: ${returnType[key]};`),
            '}'
        );
    }

    return <CodeSnippet language="ts" lines={lines} />;
};

const Option = ({ name, isVisible, isAlternate, isRequired, type, description, defaultValue, Editor, editorProps }) => {
    const derivedType = type || getType(defaultValue);
    const isFunction = derivedType != null && typeof derivedType === 'object';
    const configureLinksForParent = value =>
        value.replace(/<a (.*?)href="([^"]+)"(.*?)>/g, '<a $1href="#" onclick="window.parent.location=\'../$2\'"$3>');

    return <div className={`${styles.option} ${isVisible ? '' : styles.optionHidden} ${isAlternate ? styles.optionAlternate : ''}`}>
        <span className={styles.option__name}>{name}</span>
        {derivedType && <span className={styles.option__type}>{isFunction ? 'Function' : derivedType}</span>}
        {isRequired ? <div className={styles.option__required}>Required</div> : <div className={styles.option__default}>Default: {defaultValue != null ? <code className={styles.option__code}>{formatJson(defaultValue)}</code> : 'N/A'}</div>}<br />
        {isFunction && <FunctionDefinition definition={derivedType} />}
        <span className={styles.option__description} dangerouslySetInnerHTML={{ __html: configureLinksForParent(description) }}></span><br />
        {Editor && <Editor value={defaultValue} {...editorProps} />}
        {!Editor && editorProps.options && <span>Options: <code>{editorProps.options.map(formatJson).join(' | ')}</code></span>}
    </div>;
};

const ComplexOption = ({ name, description, isVisible, isAlternate, isSearching, children }) => {
    const [isExpanded, setExpanded] = useState(false);
    const contentIsExpanded = isExpanded || isSearching;

    return <div className={`${styles.option} ${isVisible ? '' : styles.optionHidden} ${isAlternate ? styles.optionAlternate : ''}`}>
        <div className={styles.optionExpandable} onClick={() => setExpanded(!isExpanded)}>
            <span className={styles.option__name}>{name}</span>
            <span className={styles.option__type}>Object</span>
            <span className={`${styles.option__expander} ${contentIsExpanded ? styles.option__expanderExpanded : ''}`}>❯</span><br />
            {description && <span className={styles.option__description} dangerouslySetInnerHTML={{ __html: description }}></span>}
        </div>
        <div className={`${styles.option__content} ${contentIsExpanded ? '' : styles.option__contentHidden}`}>
            {children}
        </div>
    </div>;
};

const Search = ({ text, onChange }) => {
    return <div className={styles.search}>
        <div className={styles.search__title}><h2>Options</h2></div>
        <div className={styles.search__box}>Search: <input className={styles.search__input} type="text" value={text} maxLength={20} onChange={event => onChange(event.target.value)} /></div>
    </div>;
};

export const Options = ({ chartType, updateOptionDefault, updateOption }) => {
    const [searchText, setSearchText] = useState('');
    const getTrimmedSearchText = () => searchText.trim();
    const matchesSearch = name => name.toLowerCase().indexOf(getTrimmedSearchText().toLowerCase()) >= 0;
    const childMatchesSearch = config => typeof config === 'object' && !config.description && Object.keys(config).some(key => matchesSearch(key) || childMatchesSearch(config[key]));

    let hasResults = false;
    const isSearching = getTrimmedSearchText() !== '';

    const generateOptions = (options, prefix = '', parentMatchesSearch = false, requiresWholeObject = false, isAlternate = false) => {
        let elements = [];

        Object.keys(options).filter(name => name !== 'meta').forEach(name => {
            const key = `${prefix}${name}`;
            const componentKey = `${chartType}_${key}`;
            const config = options[name];
            const {
                meta,
                type,
                isRequired,
                description,
                default: defaultValue,
                editor,
                ...editorProps
            } = config;

            const isComplexOption = !config.description;

            const isVisible = !isSearching ||
                parentMatchesSearch ||
                matchesSearch(name) ||
                (isComplexOption && childMatchesSearch(config));

            if (isVisible) {
                hasResults = true;
            }

            if (isComplexOption) {
                elements.push(<ComplexOption
                    key={componentKey}
                    name={name}
                    description={meta && meta.description}
                    isVisible={isVisible || childMatchesSearch(config)} isSearching={isSearching}
                    isAlternate={isAlternate}>
                    {generateOptions(
                        config,
                        `${key}.`,
                        parentMatchesSearch || (isSearching && matchesSearch(name)),
                        requiresWholeObject || (meta && meta.requiresWholeObject),
                        !isAlternate)}
                </ComplexOption>);
            } else {
                //updateOptionDefault(key, defaultValue);

                elements.push(<Option
                    key={componentKey}
                    name={name}
                    isVisible={isVisible}
                    isAlternate={isAlternate}
                    type={type}
                    isRequired={isRequired}
                    description={description}
                    defaultValue={defaultValue}
                    Editor={editor}
                    editorProps={{
                        ...editorProps,
                        onChange: newValue => updateOption(key, newValue, requiresWholeObject)
                    }}
                />);
            }

            if (isVisible) {
                isAlternate = !isAlternate;
            }
        });

        return elements;
    };

    const config = { ...Config.chart };

    if (chartType !== 'pie') {
        config.axes = Config.axis;
    }

    config.series = Config[chartType];

    const options = generateOptions(Object.freeze(config));

    return <div className={styles.options}>
        <Search value={searchText} onChange={value => setSearchText(value)} />
        {isSearching && !hasResults && <div className={styles.options__noContent}>No properties match your search: '{getTrimmedSearchText()}'</div>}
        <div className={styles.options__content}>{options}</div>
    </div>;
};
