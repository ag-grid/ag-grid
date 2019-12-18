import React, {useState} from 'react';
import {AgChartsReact} from 'ag-charts-react';
import './App.css';

/*
const NumericInput = initialValue => {
    const [value, setValue] = useState(initialValue);
    const onChange = (
        event => setValue(isNaN(event.currentTarget.value) ? initialValue : parseInt(event.currentTarget.value))
    );

    return {value, onChange};
};
*/

const IncreaseDecreaseInput = (label, initialValue) => {
    const [value, setValue] = useState(initialValue);
    return {
        value,
        control: (
            <>
                <p>{label}: {value}</p>
                <button onClick={() => setValue(initialValue)}>Reset</button>
                <button
                    onClick={() => setValue(prevCount => prevCount + 1)}>
                    Increase {label}
                </button>
                <button
                    onClick={() => setValue(prevCount => prevCount - 1)}>
                    Decrease {label}
                </button>
            </>
        )
    };
};


function App() {
    const {value: markerSize, control: MarkerSizeControl} = IncreaseDecreaseInput("Marker Size", 25);

    return (
        <div>
            {MarkerSizeControl}
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
                        markerSize: markerSize
                    }
                }}
            />
        </div>
    );
}

export default App;
