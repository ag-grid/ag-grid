import {createStore, applyMiddleware} from 'redux';

import fileReducer from './reducers/fileReducer.jsx';
import logger from "./middleware/logger.jsx";

const initialState = {
  files: [
    {id: 1, file: 'notes.txt', folder: 'txt', dateModified: '21 May 2017, 01:50:30', size: 14.7},
    {id: 2, file: 'book.pdf', folder: 'pdf', dateModified: '20 May 2017, 01:50:36', size: 2.1},
    {id: 3, file: 'cv.pdf', folder: 'pdf', dateModified: '20 May 2016, 11:50:26', size: 2.4},
    {id: 4, file: 'xyz.txt', folder: 'txt', dateModified: '17 Jan 2016, 08:03:12', size: 1.1},
    {id: 5, file: 'theme.mp3', folder: 'mp3', dateModified: '11 Sep 2016 08:03:07', size: 14.3},
    {id: 6, file: 'rock.mp3', folder: 'mp3', dateModified: '16 Sep 2016 03:05:37', size: 80.3},
    {id: 7, file: 'jazz.mp3', folder: 'mp3', dateModified: '18 Sep 2016 06:03:53', size: 90.5},
    {id: 8, file: 'abc.txt', folder: 'txt', dateModified: '17 Nov 2017, 10:04:02', size: 4.3},
  ]
};

export default createStore(fileReducer, initialState, applyMiddleware(logger));