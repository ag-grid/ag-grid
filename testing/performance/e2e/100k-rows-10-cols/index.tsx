'use client';

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import Example from '/documentation/ag-grid-docs/src/components/example-grid/Example.jsx';

// Render GridExample
const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <Example />
    </StrictMode>
);
