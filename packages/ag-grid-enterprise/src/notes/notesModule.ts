import type { _ModuleWithApi, _NotesGridApi } from 'ag-grid-community';
import { _PopupModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import notesCSS from './notes.css';
import { getNote, refreshNotes, setNote } from './notesApi';
import { NotesDataService } from './notesDataService';
import { NotesService } from './notesService';

/**
 * @feature Notes
 * @gridOption notesDataSource
 * @gridOption noteTrigger
 * @gridOption noteShowDelay
 * @gridOption noteHideDelay
 */
export const NotesModule: _ModuleWithApi<_NotesGridApi> = {
    moduleName: 'Notes',
    version: VERSION,
    beans: [NotesDataService, NotesService],
    apiFunctions: {
        getNote,
        setNote,
        refreshNotes,
    },
    dependsOn: [EnterpriseCoreModule, _PopupModule],
    css: [notesCSS],
};
