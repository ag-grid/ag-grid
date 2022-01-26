import React, {Component} from "react";

export default class CountryCellRenderer extends Component {
    constructor(props) {
        super(props);

        let value;
        if (!props.value || props.value === '(Select All)') {
            value = props.value;
        } else {
            const url = `https://flags.fmcdn.net/data/flags/mini/${props.context.COUNTRY_CODES[props.value]}.png`;
            const flagImage = `<img class="flag" border="0" width="15" height="10" src="${url}">`;

            value = `${flagImage} ${props.value}`;
        }
        this.state = {
            value
        }
    }

    render() {
        return <div dangerouslySetInnerHTML={{__html: this.state.value}}></div>;
    }
};
