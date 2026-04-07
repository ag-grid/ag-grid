import type { _ModuleWithApi, _NotesGridApi } from 'ag-grid-community';
import { _PopupModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import notesCSS from './notes.css';
import { getCellNote, refreshCellNotes, setCellNote } from './notesApi';
import { NotesDataService } from './notesDataService';
import { NotesService } from './notesService';

/**
 * @feature Notes
 * @gridOption notesDataSource
 */
export const NotesModule: _ModuleWithApi<_NotesGridApi> = {
    moduleName: 'Notes',
    version: VERSION,
    beans: [NotesDataService, NotesService],
    apiFunctions: {
        getCellNote,
        setCellNote,
        refreshCellNotes,
    },
    dependsOn: [EnterpriseCoreModule, _PopupModule],
    css: [notesCSS],
};
