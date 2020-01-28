import React, { useState } from 'react';
import './Options.css';
import { formatJson } from './utils.jsx';
import * as Config from './config.jsx';
import { CodeSnippet } from './CodeSnippet.jsx';
import { ChartTypeSelector } from './ChartTypeSelector.jsx';

const Section = ({ title, isVisible, children, isSearching }) => {
    const [isExpanded, setExpanded] = useState(false);
    const sectionIsExpanded = isExpanded || isSearching;

    return <div className={`section ${isVisible ? '' : 'section--hidden'} ${sectionIsExpanded ? 'section--expanded' : ''}`}>
        <h2 className={`section__heading ${sectionIsExpanded ? 'section__heading--expanded' : ''}`}
            onClick={() => setExpanded(!isExpanded)}>
            {title}
        </h2>
        <div className={`section__content ${sectionIsExpanded ? '' : 'section__content--hidden'}`}>
            {children}
        </div>
    </div>;
};

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

    return <div className='option__functionDefinition'>
        <CodeSnippet language='ts' lines={lines} />
    </div>;
};

const Option = ({ name, isVisible, isRequired, type, description, defaultValue, Editor, editorProps }) => {
    const derivedType = type || getType(defaultValue);
    const isFunction = derivedType != null && typeof derivedType === 'object';

    return <div className={`option ${isVisible ? '' : 'option--hidden'}`}>
        <span className='option__name'>{name}</span>
        {derivedType && <span className='option__type'>{isFunction ? 'Function' : derivedType}</span>}
        {isRequired ? <div className='option__required'>Required</div> : <div className='option__default'>Default: {defaultValue != null ? <code className='option__code'>{formatJson(defaultValue)}</code> : 'N/A'}</div>}<br />
        {isFunction && <FunctionDefinition definition={derivedType} />}
        <span className='option__description' dangerouslySetInnerHTML={{ __html: description }}></span><br />
        {Editor && <Editor value={defaultValue} {...editorProps} />}
        {!Editor && editorProps.options && <span>Options: <code>{editorProps.options.map(o => JSON.stringify(o)).join(' | ')}</code></span>}
    </div>;
};

const Search = ({ text, onChange }) => {
    return <div className='search'>
        Search: <input className='search__input' type='text' value={text} onChange={event => onChange(event.target.value)} />
    </div>;
};

export class Options extends React.PureComponent {
    state = {
        searchText: '',
        hasResults: false,
    };

    getTrimmedSearchText = () => this.state.searchText.trim();
    matchesSearch = name => name.indexOf(this.getTrimmedSearchText()) >= 0;
    childMatchesSearch = config => !config.description && Object.keys(config).some(key => this.matchesSearch(key) || this.childMatchesSearch(config[key]));

    generateOptions = (options, prefix = '', parentMatchesSearch = false, requiresWholeObject = false) => {
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

            const isVisible = !isSearching || parentMatchesSearch || this.matchesSearch(name);

            if (isVisible) {
                this.setState({ hasResults: true });
            }

            if (config.description) {
                this.props.updateOptionDefault(key, defaultValue);

                elements.push(<Option
                    key={componentKey}
                    name={name}
                    isVisible={isVisible}
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
            } else {
                elements.push(<Section key={componentKey} title={name} isVisible={isVisible || this.childMatchesSearch(config)} isSearching={isSearching}>
                    {this.generateOptions(config, `${key}.`, parentMatchesSearch || (isSearching && this.matchesSearch(name)), requiresWholeObject || config.meta && config.meta.requiresWholeObject)}
                </Section>);
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