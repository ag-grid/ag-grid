<framework-specific-section frameworks="react">
|
|Below is an example of a tool panel component:
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|const totalStyle = {paddingBottom: '15px'};
|
|export default props => {
|    const [numMedals, setNumMedals] = useState(0);
|    const [numGold, setNumGold] = useState(0);
|    const [numSilver, setNumSilver] = useState(0);
|    const [numBronze, setNumBronze] = useState(0);
|
|    const updateTotals = () => {
|        let numGold = 0, numSilver = 0, numBronze = 0;
|
|        props.api.forEachNode(function (rowNode) {
|            const data = rowNode.data;
|
|            if (data.gold) numGold += data.gold;
|            if (data.silver) numSilver += data.silver;
|            if (data.bronze) numBronze += data.bronze;
|        });
|
|        const numMedals = numGold + numSilver + numBronze;
|
|        setNumMedals(numMedals);
|        setNumGold(numGold);
|        setNumSilver(numSilver);
|        setNumBronze(numBronze);
|    };
|
|    useEffect(() => {
|        props.api.addEventListener('modelUpdated', updateTotals);
|
|        return () => props.api.removeEventListener('modelUpdated', updateTotals);
|    }, []);
|
|    return (
|        &lt;div style={{textAlign: "center"}}>
|                &lt;span>
|                    &lt;h2>&lt;i className="fa fa-calculator">&lt;/i> Custom Stats&lt;/h2>
|                    &lt;dl style={{fontSize: 'large', padding: '30px 40px 10px 30px'}}>
|                        &lt;dt style={totalStyle}>Total Medals: &lt;b>{numMedals}&lt;/b>&lt;/dt>
|                        &lt;dt style={totalStyle}>Total Gold: &lt;b>{numGold}&lt;/b>&lt;/dt>
|                        &lt;dt style={totalStyle}>Total Silver: &lt;b>{numSilver}&lt;/b>&lt;/dt>
|                        &lt;dt style={totalStyle}>Total Bronze: &lt;b>{numBronze}&lt;/b>&lt;/dt>
|                    &lt;/dl>
|                &lt;/span>
|        &lt;/div>
|    );
|};
</snippet>
</framework-specific-section>
