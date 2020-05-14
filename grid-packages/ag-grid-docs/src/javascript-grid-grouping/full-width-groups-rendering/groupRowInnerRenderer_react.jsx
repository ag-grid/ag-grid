import React, {Component} from 'react';

export default class GroupRowInnerRenderer extends Component {
    constructor(props) {
        super(props);

        this.props = props;

        const node = this.props.node;
        const aggData = node.aggData;
        let flagCode = this.props.flagCodes[node.key];

        this.state = {
            flagCode,
            flagCodeImg: `https://flags.fmcdn.net/data/flags/mini/${flagCode}.png`,
            countryName: node.key,
            goldCount: aggData.gold,
            silverCount: aggData.silver,
            bronzeCount: aggData.bronze,
        };

        this.dataChangedListener = () => {
            this.refreshUi();
        };

        props.api.addEventListener('cellValueChanged', this.dataChangedListener);
        props.api.addEventListener('filterChanged', this.dataChangedListener);
    }

    refreshUi() {
        const node = this.props.node;
        const aggData = node.aggData;
        let flagCode = this.props.flagCodes[node.key];
        this.setState({
            flagCode,
            flagCodeImg: `https://flags.fmcdn.net/data/flags/mini/${flagCode}.png`,
            countryName: node.key,
            goldCount: aggData.gold,
            silverCount: aggData.silver,
            bronzeCount: aggData.bronze,
        });
    }

    render() {
        let img = '';
        const { countryName, goldCount, silverCount, bronzeCount, flagCode, flagCodeImg } = this.state;
        
        if (flagCode) {
            img = <img className="flag" border="0" width="20" height="15" src={flagCodeImg}/>
        }

        return (
            <div style={{display: "inline-block"}}>
                { img }
                <span className="groupTitle">{countryName}</span>
                <span className="medal gold" aria-label={`${countryName} - ${goldCount} gold medals`}><i class="fas fa-medal"></i>{goldCount}</span>
                <span className="medal silver" aria-label={`${countryName} - ${silverCount} silver medals`}><i class="fas fa-medal"></i>{silverCount}</span>
                <span className="medal bronze"aria-label={`${countryName} - ${bronzeCount} bronze medals`}><i class="fas fa-medal"></i>{bronzeCount}</span>
            </div>
        );
    }

    componentWillUnmount() {
        this.props.api.removeEventListener('cellValueChanged', this.dataChangedListener);
        this.props.api.removeEventListener('filterChanged', this.dataChangedListener);
    }
};
