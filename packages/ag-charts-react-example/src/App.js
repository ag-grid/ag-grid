import React, {useState} from 'react';
import {AgChartsReact} from 'ag-charts-react';
import './App.css';

const NumericInput = initialValue => {
    const [value, setValue] = useState(initialValue);
    const onChange = (
        event => setValue(isNaN(event.currentTarget.value) ? initialValue : parseInt(event.currentTarget.value))
    );

    return {value, onChange};
};


function App() {
    const markerSize = NumericInput(25);

    return (
        <div>
            <div>Marker Size: <input {...markerSize} /></div>
            <AgChartsReact
                options={{
                    data: [{
                        month: 'Jan',
                        revenue: 155000,
                        profit: 33000
                    }, {
                        month: 'Feb',
                        revenue: 123000,
                        profit: 35500
                    }, {
                        month: 'Mar',
                        revenue: 172500,
                        profit: 41000
                    }, {
                        month: 'Apr',
                        revenue: 185000,
                        profit: 50000
                    }],
                    series: [{
                        xKey: 'month',
                        yKey: 'revenue'
                    }],
                    legend: {
                        markerSize: markerSize.value
                    }
                }}
            />
        </div>
    );
}

export default App;
