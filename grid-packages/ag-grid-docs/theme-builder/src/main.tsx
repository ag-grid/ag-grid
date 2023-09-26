import { variableDescriptionsFixture } from 'fixtures/variableDescriptionsFixture';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeBuilder } from './ThemeBuilder';
import './main.scss';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeBuilder variableDescriptions={variableDescriptionsFixture} />
  </React.StrictMode>,
);

if (process.env.NODE_ENV === 'development') {
  const licenseWarningLines = [
    '***************************************** AG Grid Enterprise License *******************************************',
    '****************************************** License Key Not Found ***********************************************',
    '* All AG Grid Enterprise features are unlocked.                                                                *',
    '* This is an evaluation only version, it is not licensed for development projects intended for production.     *',
    '* If you want to hide the watermark, please email info@ag-grid.com for a trial license.                        *',
    '****************************************************************************************************************',
    '****************************************************************************************************************',
  ];
  // eslint-disable-next-line no-console
  const oldConsoleError = console.error;
  // eslint-disable-next-line no-console
  console.error = (...args) => {
    if (!licenseWarningLines.includes(String(args[0]))) {
      oldConsoleError.apply(console, args);
    }
  };
}
