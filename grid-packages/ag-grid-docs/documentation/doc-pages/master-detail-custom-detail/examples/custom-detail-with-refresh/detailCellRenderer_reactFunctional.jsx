import React, { forwardRef, useImperativeHandle, useState } from 'react';

const DetailCellRenderer = forwardRef(({ data }, ref) => {
    const [callCount, setCallCount] = useState(data.calls);

    useImperativeHandle(ref, () => {
        return {
            refresh(params) {
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
