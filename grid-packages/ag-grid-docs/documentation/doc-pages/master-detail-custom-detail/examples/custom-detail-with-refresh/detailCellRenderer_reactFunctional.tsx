import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { CustomCellRendererProps } from '@ag-grid-community/react';

const DetailCellRenderer = forwardRef((props: CustomCellRendererProps, ref) => {
    const [callCount, setCallCount] = useState(props.data.calls);

    useImperativeHandle(ref, () => {
        return {
            refresh(params: CustomCellRendererProps) {
                setCallCount(params.data.calls);
                 // tell the grid not to destroy and recreate
                return true;
            }
        }
    });

    return (
        <div>
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
        </div>
    );
});

export default DetailCellRenderer;
