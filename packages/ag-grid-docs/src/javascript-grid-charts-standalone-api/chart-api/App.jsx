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
            ...options.axis,
        },
        {
            type: 'number',
            position: 'left',
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

    updateOptions = (expression, value, defaultValue) => {
        const newOptions = deepClone(this.state.options);
        const keys = expression.split(".");
        const objects = [];
        let objectToUpdate = newOptions;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const parent = objectToUpdate;

            objects.push(parent);
            objectToUpdate = parent[key];

            if (objectToUpdate == null) {
                objectToUpdate = {};
                parent[key] = objectToUpdate;
            }
        }

        let keyIndex = keys.length - 1;
        let key = keys[keyIndex];

        if (value == null || value === '' || JSON.stringify(value) === JSON.stringify(defaultValue)) {
            delete objectToUpdate[key];

            while (keyIndex > 0 && Object.keys(objectToUpdate).length < 1) {
                keyIndex--;
                objectToUpdate = objects[keyIndex];
                key = keys[keyIndex];

                delete objectToUpdate[key];
            }
        } else {
            objectToUpdate[key] = value;
        }

        this.setState({ options: newOptions });
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
