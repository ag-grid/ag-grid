import React from 'react';

const defaultContextValue = {
    exampleImportType: 'modules',
    useFunctionalReact: false,
    set: () => { },
};

const { Provider, Consumer } = React.createContext(defaultContextValue);

const contextKey = 'documentationContext';

class GlobalContextProvider extends React.PureComponent {
    constructor() {
        super();

        let contextValue = defaultContextValue;

        if (window.localStorage) {
            const storedContextString = window.localStorage.getItem(contextKey);

            if (storedContextString) {
                const storedContext = JSON.parse(storedContextString);

                if (storedContext) {
                    contextValue = {
                        ...contextValue,
                        ...storedContext,
                    };
                }
            }
        }

        this.state = {
            ...contextValue,
            set: this.setData,
        };
    }

    setData = newData => {
        this.setState(newData, () => {
            if (window.localStorage) {
                window.localStorage.setItem(contextKey, JSON.stringify(this.state));
            }
        });
    };

    render() {
        return <Provider value={this.state}>{this.props.children}</Provider>;
    }
}

export { Consumer as default, GlobalContextProvider };