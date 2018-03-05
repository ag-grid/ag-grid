import {types} from '../types/fileTypes.jsx'

export default function fileReducer(state = {}, action) {
  const payload = action.payload;
  switch (action.type) {
    case types.NEW_FILE:
      return {
        files: [
          ...state.files,
          newFile(state.files, payload.folder)
        ]
      };
    case types.DELETE_FILE:
      return {
        files: deleteFile(state.files, payload.id)
      };
    default:
      return state;
  }
}

const newFile = (existingFiles, folder) => {
  const num = getNextUntitledFileNumber(existingFiles, folder);
  return {
    id: Math.random() * 100000 | 0, //likely to be unique due to Math.random seed
    file: `untitled${num > 0 ? num : ''}.${folder}`,
    folder: folder,
    dateModified: getCurrentDateString(),
    size: 0
  }
};

const getNextUntitledFileNumber = (existingFiles, folder) => {
  const untitledNumberMapper = f => {
    const num = f.file.split('.')[0].match(/\d+/g);
    return num && num.length > 0 ? parseInt(num) : 0;
  };

  return existingFiles
    .filter(f => f.folder === folder && f.file.startsWith('untitled'))
    .map(untitledNumberMapper)
    .reduce((n1, n2) => Math.max(n1, n2), -1) + 1;
};

const deleteFile = (existingFiles, id) => existingFiles.filter(f => f.id !== id);

const getCurrentDateString = () => new Date().toLocaleString('en-gb',
  {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'});