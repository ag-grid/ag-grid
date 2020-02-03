import React, { useState } from 'react';
import './Options.css';
import { formatJson } from './utils.jsx';
import * as Config from './config.jsx';
import { CodeSnippet } from './CodeSnippet.jsx';
import { ChartTypeSelector } from './ChartTypeSelector.jsx';

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

    const lines = [`function(params: ParamsType): ${returnTypeIsObject ? 'ReturnType' : returnType};`,
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

    return <div className={`option ${isVisible ? '' : 'option--hidden'} ${isAlternate ? 'option--alternate' : ''}`}>
        <span className="option__name">{name}</span>
        {derivedType && <span className="option__type">{isFunction ? 'Function' : derivedType}</span>}
        {isRequired ? <div className="option__required">Required</div> : <div className="option__default">Default: {defaultValue != null ? <code className="option__code">{formatJson(defaultValue)}</code> : 'N/A'}</div>}<br />
        {isFunction && <FunctionDefinition definition={derivedType} />}
        <span className="option__description" dangerouslySetInnerHTML={{ __html: description }}></span><br />
        {Editor && <Editor value={defaultValue} {...editorProps} />}
        {!Editor && editorProps.options && <span>Options: <code>{editorProps.options.map(formatJson).join(' | ')}</code></span>}
    </div>;
};

const ComplexOption = ({ name, isVisible, isAlternate, isSearching, children }) => {
    const [isExpanded, setExpanded] = useState(false);
    const contentIsExpanded = isExpanded || isSearching;

    return <div className={`option ${isVisible ? '' : 'option--hidden'} ${isAlternate ? 'option--alternate' : ''}`}>
        <div className="option--expandable" onClick={() => setExpanded(!isExpanded)}>
            <span className="option__name">{name}</span>
            <span className="option__type">Object</span>
            <span className={`option__expander ${contentIsExpanded ? 'option__expander--expanded' : ''}`}>❯</span><br />
            <span className="option__description">This section is about the {name} object.</span>
        </div>
        <div className={`option__content ${contentIsExpanded ? '' : 'option__content--hidden'}`}>
            {children}
        </div>
    </div>;
};


const Search = ({ text, onChange }) => {
    return <div className="search">
        <div className="search__title"><h2>Options</h2></div>
        <div className="search__box">Search: <input className="search__input" type="text" value={text} maxLength={20} onChange={event => onChange(event.target.value)} /></div>
    </div>;
};

export class Options extends React.PureComponent {
    state = {
        searchText: '',
        hasResults: false,
    };

    getTrimmedSearchText = () => this.state.searchText.trim();
    matchesSearch = name => name.toLowerCase().indexOf(this.getTrimmedSearchText().toLowerCase()) >= 0;
    childMatchesSearch = config => typeof config === 'object' && !config.description && Object.keys(config).some(key => this.matchesSearch(key) || this.childMatchesSearch(config[key]));

    generateOptions = (options, prefix = '', parentMatchesSearch = false, requiresWholeObject = false, isAlternate = false) => {
        let elements = [];
        const isSearching = this.getTrimmedSearchText() !== '';

        Object.keys(options).filter(name => name !== 'meta').forEach(name => {
            const key = `${prefix}${name}`;
            const componentKey = `${this.props.chartType}_${key}`;
            const config = options[name];
            const {
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
                this.matchesSearch(name) ||
                (isComplexOption && this.childMatchesSearch(config));

            if (isVisible) {
                this.setState({ hasResults: true });
            }

            if (isComplexOption) {
                elements.push(<ComplexOption
                    key={componentKey}
                    name={name}
                    isVisible={isVisible || this.childMatchesSearch(config)} isSearching={isSearching}
                    isAlternate={isAlternate}>
                    {this.generateOptions(
                        config,
                        `${key}.`,
                        parentMatchesSearch || (isSearching && this.matchesSearch(name)),
                        requiresWholeObject || config.meta && config.meta.requiresWholeObject,
                        !isAlternate)}
                </ComplexOption>);
            } else {
                this.props.updateOptionDefault(key, defaultValue);

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
                        onChange: newValue => this.props.updateOption(key, newValue, requiresWholeObject)
                    }}
                />);
            }

            if (isVisible) {
                isAlternate = !isAlternate;
            }
        });

        return elements;
    };

    render() {
        const { chartType, updateChartType } = this.props;
        const { searchText, hasResults } = this.state;
        const config = { ...Config.generalConfig };

        if (chartType !== 'pie') {
            config.axes = Config.axisConfig;
        }

        config.series = Config[`${chartType}SeriesConfig`];

        return <div className="options">
            <ChartTypeSelector type={chartType} onChange={updateChartType} />
            <Search value={searchText} onChange={value => this.setState({ searchText: value, hasResults: false })} />
            {!hasResults && <div className="options__no-content">No properties match your search: '{this.getTrimmedSearchText()}'</div>}
            <div className="options__content">{this.generateOptions(Object.freeze(config))}</div>
        </div>;
    }
};