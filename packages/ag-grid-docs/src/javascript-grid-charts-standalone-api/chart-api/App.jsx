import React from 'react';
import './App.css';
import { getTemplates } from "./templates.jsx";
import { Chart } from "./Chart.jsx";
import { Options } from "./Options.jsx";
import { Code } from "./Code.jsx";
import { deepClone } from "./utils.jsx";

const appName = 'chart-api';

const createOptionsJson = options => {
    const json = {
        ...options,
        axes: options.axes && Object.keys(options.axes).length > 0 ? [{
            type: 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
            ...options.axes,
        }] : undefined,
        series: [{
            type: 'column',
            xKey: 'month',
            yKeys: ['revenue', 'profit'],
            ...options.series,
        }]
    };

    const gridStyle = json.axes && json.axes[1].gridStyle;

    if (gridStyle) {
        // special handling for gridStyle which requires an array
        json.axes[1].gridStyle = [gridStyle];
    }

    return json;
};

export class App extends React.Component {
    state = {
        framework: this.getCurrentFramework(),
        options: {},
        defaults: {},
    };

    getKeys = expression => expression.split('.');

    getDefaultValue = expression => {
        let { defaults } = this.state;
        const keys = this.getKeys(expression);

        while (keys.length > 0 && defaults != null) {
            defaults = defaults[keys.shift()];
        }

        return defaults;
    };

    updateOptionDefault = (expression, defaultValue) => {
        const keys = this.getKeys(expression);

        this.setState(prevState => {
            const newDefaults = { ...prevState.defaults };
            let objectToUpdate = newDefaults;

            while (keys.length > 1) {
                const key = keys.shift();
                const parent = objectToUpdate;

                objectToUpdate = { ...parent[key] };
                parent[key] = objectToUpdate;
            }

            objectToUpdate[keys.shift()] = defaultValue;

            return { defaults: newDefaults };
        });
    };

    // to ensure the chart always displays using the latest values, we first have to update the state
    // with the latest values to trigger the chart update, and then remove any no-longer needed keys
    // (ones where the value is the just the same as the default) so they aren't used in generated code
    updateOption = (expression, value, requiresWholeObject = false) => {
        const keys = this.getKeys(expression);
        const parentKeys = [...keys];
        parentKeys.pop();
        const defaultParent = { ...this.getDefaultValue(parentKeys.join('.')) };
        const defaultValue = defaultParent[keys[keys.length - 1]];
        const removeUnneededKeys = true;

        const removeUnneededKey = () => {
            if (!removeUnneededKeys || (value !== defaultValue && JSON.stringify(value) !== JSON.stringify(defaultValue))) {
                // key has a different value to the default, so don't remove it
                return;
            }

            const objects = [];
            const newOptions = deepClone(this.state.options);
            let objectToUpdate = newOptions;
            let keyIndex = keys.length - 1;

            for (let i = 0; i < keyIndex; i++) {
                objects.push(objectToUpdate);
                objectToUpdate = objectToUpdate[keys[i]];
            }

            let key = keys[keyIndex];

            if (requiresWholeObject) {
                if (JSON.stringify(objectToUpdate) === JSON.stringify(defaultParent)) {
                    // if all the defaults match, we can remove the whole object
                    objectToUpdate = {};
                }
            } else {
                delete objectToUpdate[key];
            }

            while (keyIndex > 0 && Object.keys(objectToUpdate).length < 1) {
                keyIndex--;
                objectToUpdate = objects[keyIndex];
                key = keys[keyIndex];

                delete objectToUpdate[key];
            }

            this.setState({ options: newOptions });
        };

        this.setState(prevState => {
            const newOptions = { ...prevState.options };
            let objectToUpdate = newOptions;
            const lastKeyIndex = keys.length - 1;

            for (let i = 0; i < lastKeyIndex; i++) {
                const key = keys[i];
                const parent = objectToUpdate;

                if (parent[key] == null) {
                    objectToUpdate = requiresWholeObject && i === lastKeyIndex - 1 ? defaultParent : {};
                } else {
                    objectToUpdate = { ...parent[key] };
                }

                parent[key] = objectToUpdate;
            }

            objectToUpdate[keys[lastKeyIndex]] = value;

            return { options: newOptions };
        }, removeUnneededKey);
    };

    getCurrentFramework() {
        const frameworkDropdownElement = window.parent.document.querySelector(`[data-framework-dropdown=${appName}]`);
        const currentFramework = frameworkDropdownElement && frameworkDropdownElement.getAttribute('data-current-framework');
        return currentFramework || 'vanilla';
    }

    componentDidMount() {
        this.componentDidUpdate();

        window.parent.document.querySelectorAll(`[data-framework-item=${appName}]`).forEach(element => {
            element.addEventListener('click', () => this.setState({ framework: this.getCurrentFramework() }));
        });
    }

    componentDidUpdate() {
        window.parent.document.getElementById(appName).setAttribute('data-context',
            JSON.stringify({
                files: getTemplates(this.state.framework, createOptionsJson(this.state.options))
            })
        );
    }

    render() {
        const options = createOptionsJson(this.state.options);

        return <div className="app">
            <Chart options={options} />
            <Options updateOptionDefault={this.updateOptionDefault} updateOption={this.updateOption} />
            <Code options={options} />
        </div>;
    }
}

export default App;
