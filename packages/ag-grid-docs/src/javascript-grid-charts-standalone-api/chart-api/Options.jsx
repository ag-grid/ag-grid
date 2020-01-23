import React, { useState } from 'react';
import './Options.css';
import { formatJson } from './utils.jsx';
import * as Config from './config.jsx';
import { CodeSnippet } from './CodeSnippet.jsx';

const Section = ({ title, isVisible, children }) => {
    const [expanded, setExpanded] = useState(false);

    return <div className={`section ${isVisible ? '' : 'section--hidden'} ${expanded ? 'section--expanded' : ''}`}>
        <h2 className={`section__heading ${expanded ? 'section__heading--expanded' : ''}`}
            onClick={() => setExpanded(!expanded)}>
            {title}
        </h2>
        <div className={`section__content ${expanded ? '' : 'section__content--hidden'}`}>
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
    };

    isVisible = name => {
        const { searchText } = this.state;
        const trimmedSearchText = searchText && searchText.trim();

        return !trimmedSearchText || name.indexOf(trimmedSearchText) >= 0;
    };

    isSectionVisible = options => {
        return Object.keys(options).some(name => {
            const config = options[name];

            return config.description ? this.isVisible(name) : this.isSectionVisible(config);
        });
    };

    generateOptions = (options, prefix = '', requiresWholeObject = false) => {
        let elements = [];

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

            if (config.description) {
                this.props.updateOptionDefault(key, defaultValue);

                elements.push(<Option
                    key={componentKey}
                    name={name}
                    isVisible={this.isVisible(name)}
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
                elements.push(<Section key={componentKey} title={name} isVisible={this.isSectionVisible(config)}>
                    {this.generateOptions(config, `${key}.`, requiresWholeObject || config.meta && config.meta.requiresWholeObject)}
                </Section>);
            }
        });

        return elements;
    };

    render() {
        const config = {
            ...Config.generalConfig,
        };

        if (this.props.chartType !== 'pie') {
            config.axes = Config.axisConfig;
        }

        config.series = Config[`${this.props.chartType}SeriesConfig`];

        return <div className='options'>
            <Search value={this.state.searchText} onChange={value => this.setState({ searchText: value })} />
            <div className='options__content'>{this.generateOptions(Object.freeze(config))}</div>
        </div>;
    }
};