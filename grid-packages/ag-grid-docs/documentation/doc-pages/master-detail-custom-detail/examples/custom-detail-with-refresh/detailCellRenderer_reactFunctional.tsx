import React, { useState } from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';

const DetailCellRenderer = (props: ICellRendererParams) => {
    const [callCount, setCallCount] = useState(props.data.calls);

    return <div>
        <form>
            <div>
                <p>
                    <label>
                        Calls:<br />
                        <input type="text" value={callCount} onChange={e => setCallCount(e.target.value)} />
                    </label>
                </p>
                <p>
                    <label>
                        Last Updated: {new Date().toLocaleTimeString()}
                    </label>
                </p>
            </div>
        </form>
    </div>;
};

export default DetailCellRenderer;
