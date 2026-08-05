import { AG_GRID_LOCALE_EG, AG_GRID_LOCALE_IL } from '@ag-grid-community/locale';
import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    LocaleModule,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

const modules = [
    NumberEditorModule,
    TextEditorModule,
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    LocaleModule,
];

type Language = 'arabic' | 'hebrew' | 'english';

interface LanguageConfig {
    localeText: Record<string, string> | undefined;
    enableRtl: boolean;
    columnDefs: ColDef[];
    rowData: Record<string, any>[];
}

const LANGUAGES: Record<Language, LanguageConfig> = {
    arabic: {
        localeText: AG_GRID_LOCALE_EG,
        enableRtl: true,
        columnDefs: [
            { field: 'city', headerName: 'المدينة' },
            { field: 'country', headerName: 'البلد' },
            { field: 'population', headerName: 'عدد السكان' },
            { field: 'area', headerName: 'المساحة (كم²)' },
        ],
        rowData: [
            { city: 'القاهرة', country: 'مصر', population: 21_323_000, area: 3_085 },
            { city: 'الرياض', country: 'السعودية', population: 7_677_000, area: 1_798 },
            { city: 'دبي', country: 'الإمارات', population: 3_564_000, area: 1_588 },
            { city: 'الدار البيضاء', country: 'المغرب', population: 3_752_000, area: 384 },
            { city: 'بغداد', country: 'العراق', population: 8_126_000, area: 673 },
            { city: 'الجزائر', country: 'الجزائر', population: 3_915_000, area: 363 },
            { city: 'عمّان', country: 'الأردن', population: 4_008_000, area: 1_680 },
            { city: 'تونس', country: 'تونس', population: 2_365_000, area: 212 },
            { city: 'بيروت', country: 'لبنان', population: 2_434_000, area: 67 },
            { city: 'الكويت', country: 'الكويت', population: 2_989_000, area: 200 },
        ],
    },
    hebrew: {
        localeText: AG_GRID_LOCALE_IL,
        enableRtl: true,
        columnDefs: [
            { field: 'city', headerName: 'עיר' },
            { field: 'country', headerName: 'מדינה' },
            { field: 'population', headerName: 'אוכלוסייה' },
            { field: 'area', headerName: 'שטח (קמ״ר)' },
        ],
        rowData: [
            { city: 'ירושלים', country: 'ישראל', population: 982_000, area: 126 },
            { city: 'תל אביב', country: 'ישראל', population: 467_000, area: 52 },
            { city: 'חיפה', country: 'ישראל', population: 285_000, area: 64 },
            { city: 'ראשון לציון', country: 'ישראל', population: 254_000, area: 59 },
            { city: 'פתח תקווה', country: 'ישראל', population: 247_000, area: 36 },
            { city: 'אשדוד', country: 'ישראל', population: 226_000, area: 47 },
            { city: 'נתניה', country: 'ישראל', population: 221_000, area: 29 },
            { city: 'באר שבע', country: 'ישראל', population: 210_000, area: 117 },
            { city: 'חולון', country: 'ישראל', population: 196_000, area: 19 },
            { city: 'בני ברק', country: 'ישראל', population: 204_000, area: 7 },
        ],
    },
    english: {
        localeText: undefined,
        enableRtl: false,
        columnDefs: [
            { field: 'city', headerName: 'City' },
            { field: 'country', headerName: 'Country' },
            { field: 'population', headerName: 'Population' },
            { field: 'area', headerName: 'Area (km²)' },
        ],
        rowData: [
            { city: 'London', country: 'United Kingdom', population: 9_541_000, area: 1_572 },
            { city: 'New York', country: 'United States', population: 8_336_000, area: 783 },
            { city: 'Sydney', country: 'Australia', population: 5_312_000, area: 12_368 },
            { city: 'Toronto', country: 'Canada', population: 2_794_000, area: 630 },
            { city: 'Dublin', country: 'Ireland', population: 1_263_000, area: 115 },
            { city: 'Cape Town', country: 'South Africa', population: 4_618_000, area: 2_461 },
            { city: 'Singapore', country: 'Singapore', population: 5_917_000, area: 733 },
            { city: 'Auckland', country: 'New Zealand', population: 1_657_000, area: 1_086 },
            { city: 'Mumbai', country: 'India', population: 21_297_000, area: 603 },
            { city: 'Nairobi', country: 'Kenya', population: 4_922_000, area: 696 },
        ],
    },
};

const GridExample = () => {
    const [language, setLanguage] = useState<Language>('arabic');
    const [gridVisible, setGridVisible] = useState(true);
    const config = LANGUAGES[language];
    const defaultColDef = useMemo<ColDef>(
        () => ({
            editable: true,
            flex: 1,
            minWidth: 100,
            filter: true,
        }),
        []
    );

    // enableRtl is an initial-only option, so switching language recreates the grid.
    const onLanguageChange = (next: Language) => {
        setGridVisible(false);
        setLanguage(next);
        setTimeout(() => setGridVisible(true));
    };

    return (
        <AgGridProvider modules={modules}>
            <div className="example-wrapper">
                <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label htmlFor="language">Language:</label>
                    <select
                        id="language"
                        value={language}
                        onChange={(event) => onLanguageChange(event.target.value as Language)}
                    >
                        <option value="arabic">العربية (Arabic)</option>
                        <option value="hebrew">עברית (Hebrew)</option>
                        <option value="english">English</option>
                    </select>
                </div>
                <div style={{ height: '100%', width: '100%' }}>
                    {gridVisible && (
                        <AgGridReact
                            enableRtl={config.enableRtl}
                            columnDefs={config.columnDefs}
                            rowData={config.rowData}
                            localeText={config.localeText}
                            defaultColDef={defaultColDef}
                        />
                    )}
                </div>
            </div>
        </AgGridProvider>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
