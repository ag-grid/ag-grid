import React, {Component} from 'react';

export default class CustomStatsToolPanel extends Component {

  constructor(props) {
    super(props);

    this.state = {numMedals: 0, numGold: 0, numSilver: 0, numBronze: 0};

    // calculate stats when new rows loaded, i.e. onModelUpdated
    this.props.api.addEventListener('modelUpdated', this.updateTotals.bind(this));
  }

  render() {
    const totalStyle = {paddingBottom: '15px'};

    return (<div style={{textAlign: "center"}}>
              <span>
                <h2><i className="fa fa-calculator"></i> Custom Stats</h2>
                <dl style={{fontSize: 'large', padding: '30px 40px 10px 30px'}}>
                  <dt style={totalStyle}>Total Medals: <b>{this.state.numMedals}</b></dt>
                  <dt style={totalStyle}>Total Gold: <b>{this.state.numGold}</b></dt>
                  <dt style={totalStyle}>Total Silver: <b>{this.state.numSilver}</b></dt>
                  <dt style={totalStyle}>Total Bronze: <b>{this.state.numBronze}</b></dt>
                </dl>
              </span>
           </div>);
  }

  updateTotals() {
    var numGold = 0, numSilver = 0, numBronze = 0;

    this.props.api.forEachNode(function (rowNode) {
      let data = rowNode.data;
      if (data.gold) numGold += data.gold;
      if (data.silver) numSilver += data.silver;
      if (data.bronze) numBronze += data.bronze;
    });

    let numMedals = numGold + numSilver + numBronze;
    this.setState({numMedals: numMedals, numGold: numGold, numSilver: numSilver, numBronze: numBronze});
  }

};