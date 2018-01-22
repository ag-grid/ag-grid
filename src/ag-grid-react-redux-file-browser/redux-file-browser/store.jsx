import {createStore} from 'redux';
import {reducer} from './ducks/files.jsx';

const initialState = {
  files: [
    {id: 1, file: false, filePath: ['Documents']},
    {id: 2, file: false, filePath: ['Documents', 'txt']},
    {id: 3, file: true, filePath: ['Documents', 'txt', 'notes.txt'], dateModified: '21 May 2017, 01:50:30', size: 14.7},
    {id: 4, file: false, filePath: ['Documents', 'pdf']},
    {id: 5, file: true, filePath: ['Documents', 'pdf', 'book.pdf'], dateModified: '20 May 2017, 01:50:36', size: 2.1},
    {id: 6, file: true, filePath: ['Documents', 'pdf', 'cv.pdf'], dateModified: '20 May 2016, 11:50:26', size: 2.4},
    // more files ...
  ]
};

export default createStore(reducer, initialState);
