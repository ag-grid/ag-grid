import React, { useState } from 'react';
import './Options.css';
import { formatJson } from "./utils.jsx";
import { generalConfig, axisConfig, barSeriesConfig } from "./config.jsx";

const Section = ({ title, children }) => {
    const [expanded, setExpanded] = useState(true);

    return <div className={`section ${expanded ? 'section--expanded' : ''}`}>
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

const Option = ({ name, isRequired, type, description, defaultValue, Editor, editorProps }) => {
    const derivedType = type || getType(defaultValue);

    return <div className='option'>
        <span className='option__name'>{name}</span>
        {derivedType && <span className='option__type'>{derivedType}</span>}
        {isRequired ? <div className='option__required'>Required</div> : <div className='option__default'>Default: {defaultValue != null ? <code className='option__code'>{formatJson(defaultValue)}</code> : 'N/A'}</div>}<br />
        <span className='option__description' dangerouslySetInnerHTML={{ __html: description }}></span><br />
        {Editor && <React.Fragment>Value: <Editor value={defaultValue} {...editorProps} /></React.Fragment>}
    </div>;
};

export class Options extends React.PureComponent {
    config = {
        chart: generalConfig,
        axis: axisConfig,
        series: barSeriesConfig
    };

    configNameMappings = {
        'chart': 'General chart options',
        'axis': 'Axis options',
        'series': 'Series options'
    };

    getName = name => this.configNameMappings[name] || name;

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
                elements.push(<Section key={key} title={this.getName(name)}>
                    {this.generateOptions(config, `${key}.`)}
                </Section>);
            }
        });

        return elements;
    };

    render() {
        return <div className="options">{this.generateOptions(this.config)}</div>;
    }
};