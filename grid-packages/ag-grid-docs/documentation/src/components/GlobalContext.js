import React from 'react';
import { LocalStorage } from 'utils/local-storage';

const defaultContextValue = {
    exampleImportType: 'modules',
    useFunctionalReact: false,
    set: () => { },
};

const { Provider, Consumer } = React.createContext(defaultContextValue);

const contextStorageKey = 'context';

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