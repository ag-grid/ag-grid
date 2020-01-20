import React, { useState } from 'react';
import './Options.css';
import { formatJson } from './utils.jsx';
import { generalConfig, axisConfig, barSeriesConfig } from './config.jsx';

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

const Option = ({ name, isVisible, isRequired, type, description, defaultValue, Editor, editorProps }) => {
    const derivedType = type || getType(defaultValue);
    const isFunction = derivedType != null && typeof derivedType === 'object';

    return <div className={`option ${isVisible ? '' : 'option--hidden'}`}>
        <span className='option__name'>{name}</span>
        {derivedType && <span className='option__type'>{isFunction ? `(${Object.keys(derivedType.parameters).join(', ')}) => ${derivedType.returnType}` : derivedType}</span>}
        {isRequired ? <div className='option__required'>Required</div> : <div className='option__default'>Default: {defaultValue != null ? <code className='option__code'>{formatJson(defaultValue)}</code> : 'N/A'}</div>}<br />
        {isFunction && <div className='option__functionDefinition'>
            <div className='option__params'>Parameters:<br />
                {Object.keys(derivedType.parameters).map(p => <code>{p}: {derivedType.parameters[p]}<br /></code>)}
            </div>
        </div>}
        <span className='option__description' dangerouslySetInnerHTML={{ __html: description }}></span><br />
        {Editor && <React.Fragment>Value: <Editor value={defaultValue} {...editorProps} /></React.Fragment>}
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

    config = {
        ...generalConfig,
        axes: axisConfig,
        series: barSeriesConfig,
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

    generateOptions = (options, prefix = '') => {
        let elements = [];

        Object.keys(options).forEach(name => {
            const key = `${prefix}${name}`;
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
                elements.push(<Option
                    key={key}
                    name={name}
                    isVisible={this.isVisible(name)}
                    type={type}
                    isRequired={isRequired}
                    description={description}
                    defaultValue={defaultValue}
                    Editor={editor}
                    editorProps={{
                        ...editorProps,
                        onChange: newValue => this.props.updateOptions(key, newValue, defaultValue)
                    }}
                />);
            } else {
                elements.push(<Section key={key} title={name} isVisible={this.isSectionVisible(config)}>
                    {this.generateOptions(config, `${key}.`)}
                </Section>);
            }
        });

        return elements;
    };

    render() {
        return <div className='options'>
            <Search value={this.state.searchText} onChange={value => this.setState({ searchText: value })} />
            <div className='options__content'>{this.generateOptions(this.config)}</div>
        </div>;
    }
};