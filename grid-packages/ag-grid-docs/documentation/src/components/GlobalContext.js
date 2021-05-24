import React from 'react';
import { LocalStorage } from 'utils/local-storage';

const defaultContextValue = {
    exampleImportType: 'packages',
    useFunctionalReact: true,
    enableVue3: false,
    useVue3: false,
    set: () => { },
};

const { Provider, Consumer } = React.createContext(defaultContextValue);

const contextStorageKey = 'context';

/**
 * This provides state which can be used across the website; for example, if the user chooses to use packages for
 * the example runner, this is stored and accessed here. The context is written to local storage so that the settings
 * are saved when a user returns to the website.
 */
class GlobalContextProvider extends React.PureComponent {
    constructor() {
        super();

        let contextValue = defaultContextValue;

        const storedContextString = LocalStorage.get(contextStorageKey);

        if (storedContextString) {
            const storedContext = JSON.parse(storedContextString);

            if (storedContext) {
                contextValue = {
                    ...contextValue,
                    ...storedContext,
                };
            }
        }

        this.state = {
            ...contextValue,
            set: this.setData,
        };
    }

    setData = newData => {
        this.setState(newData, () => LocalStorage.set(contextStorageKey, JSON.stringify(this.state)));
    };

    render() {
        return <Provider value={this.state}>{this.props.children}</Provider>;
    }
}

export { Consumer as default, GlobalContextProvider };
