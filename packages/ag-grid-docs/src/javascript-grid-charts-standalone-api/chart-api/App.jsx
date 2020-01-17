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
        ...options.chart,
        axes: options.axis && Object.keys(options.axis).length > 0 ? [{
            type: 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
            ...options.axis,
        }] : undefined,
        series: [{
            type: 'column',
            xKey: 'month',
            yKeys: ['revenue', 'profit'],
            ...options.series,
        }]
    };

    const gridStyle = json.axes && json.axes[0].gridStyle;

    if (gridStyle) {
        // special handling for gridStyle which requires an array
        json.axes[0].gridStyle = [gridStyle];
    }

    return json;
};

export class App extends React.Component {
    state = {
        framework: this.getCurrentFramework(),
        options: {}
    };

    // to ensure the chart always displays using the latest values, we first have to update the state
    // with the latest values to trigger the chart update, and then remove any no-longer needed keys
    // (ones where the value is the just the same as the default) so they aren't used in generated code
    updateOptions = (expression, value, defaultValue) => {
        const keys = expression.split(".");
        const removeUnneededKeys = false;

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
            delete objectToUpdate[key];

            while (keyIndex > 0 && Object.keys(objectToUpdate).length < 1) {
                keyIndex--;
                objectToUpdate = objects[keyIndex];
                key = keys[keyIndex];

                delete objectToUpdate[key];
            }

            this.setState({ options: newOptions });
        };

        this.setState(prevState => {
            const newOptions = deepClone(prevState.options);
            let objectToUpdate = newOptions;
            const lastKeyIndex = keys.length - 1;

            for (let i = 0; i < lastKeyIndex; i++) {
                const key = keys[i];
                const parent = objectToUpdate;

                objectToUpdate = parent[key];

                if (objectToUpdate == null) {
                    objectToUpdate = {};
                    parent[key] = objectToUpdate;
                }
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
            <Options updateOptions={this.updateOptions} />
            <Code options={options} />
        </div>;
    }
}

export default App;
