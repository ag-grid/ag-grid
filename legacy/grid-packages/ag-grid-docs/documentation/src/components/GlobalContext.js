import React, { useContext } from 'react';
import { LocalStorage } from 'utils/local-storage';

// bypasses local storage
const storageOverrides = {
    enableVue3: true, // enables Vue 3 functionality in docs
};

const defaultContextValue = {
    exampleImportType: 'packages',
    useVue3: false, // determines whether the user is going to see vue 2 or vue 3 examples (only applicable if enableVue3 is true)
    darkMode: typeof window === "object" ? getComputedStyle(document.documentElement).getPropertyValue('--color-scheme') === 'dark' : false,
    set: () => {},
    ...storageOverrides,
};

const GlobalContext = React.createContext(defaultContextValue);

const contextStorageKey = 'context';

const useGlobalContext = () => useContext(GlobalContext);

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
                    ...storageOverrides,
                };
            }
        }

        this.state = {
            ...contextValue,
            set: this.setData,
        };
    }

    setData = (newData) => {
        this.setState(newData, () => LocalStorage.set(contextStorageKey, JSON.stringify(this.state)));
    };

    render() {
        return <GlobalContext.Provider value={this.state}>{this.props.children}</GlobalContext.Provider>;
    }
}

export { GlobalContextProvider, useGlobalContext };
