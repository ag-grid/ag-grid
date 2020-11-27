import React from 'react';

const defaultContextValue = {
    exampleImportType: 'modules',
    useFunctionalReact: false,
    set: () => { },
};

const { Provider, Consumer } = React.createContext(defaultContextValue);

class GlobalContextProvider extends React.PureComponent {
    constructor() {
        super();

        this.state = {
            ...defaultContextValue,
            set: this.setData,
        };
    }

    setData = newData => this.setState(newData);

    render() {
        return <Provider value={this.state}>{this.props.children}</Provider>;
    }
}

export { Consumer as default, GlobalContextProvider };