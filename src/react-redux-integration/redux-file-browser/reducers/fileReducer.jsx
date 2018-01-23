import {types} from '../types/fileTypes.jsx'

export default function fileReducer(state = {}, action) {
  const payload = action.payload;
  switch (action.type) {
    case types.NEW_FILE:
      return {
        files: [
          ...state.files,
          newFile(state.files, payload.filePath)
        ]
      };
    case types.MOVE_FILES:
      return {
        files: moveFiles(state.files, payload.pathToMove, payload.targetPath)
      };
    case types.DELETE_FILES:
      return {
        files: deleteFiles(state.files, payload.pathToRemove)
      };
    default:
      return state;
  }
}

const newFile = (files, filePath) => {
  const num = getNextUntitledFileNumber(files, filePath);
  const newFilePath = filePath.slice();
  newFilePath.push(`untitled${num > 0 ? num : ''}.txt`);

  return {
    id: Math.random() * 100000 | 0, //likely to be unique due to Math.random seed
    file: true,
    filePath: newFilePath,
    dateModified: getCurrentDateString(),
    size: 0
  }
};

const getNextUntitledFileNumber = (existingFiles, folderPath) => {
  const sameFilePath = f => same(f.filePath.slice(0, folderPath.length), folderPath);
  const fileInFolder = f => f.file && f.filePath.length === folderPath.length + 1;
  const untitledFile = f => f.filePath.slice().pop().startsWith("untitled");

  return existingFiles.slice()
    .filter(sameFilePath)
    .filter(fileInFolder)
    .filter(untitledFile)
    .map(f => {
      const num = f.filePath.slice().pop().match(/\d+/g);
      return num && num.length > 0 ? parseInt(num) : 0;
    })
    .reduce((n1, n2) => Math.max(n1, n2), -1) + 1;
};

const deleteFiles = (files, pathToRemove) =>
  files.slice().filter(f => !same(f.filePath.slice(0, pathToRemove.length), pathToRemove));

const moveFiles = (exitingFiles, pathToMove, targetPath) => {
  if (same(pathToMove, targetPath)) return exitingFiles;
  return exitingFiles.slice()
    .map(f => same(f.filePath.slice(0, pathToMove.length), pathToMove) ?
      ({
        id: f.id,
        file: f.file,
        filePath: targetPath.concat(f.filePath.slice(pathToMove.length - 1)),
        dateModified: getCurrentDateString(),
        size: f.size
      }) : f
    );
};

const getCurrentDateString = () => new Date().toLocaleString('en-gb',
  {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'});

const same = (arr1, arr2) => arr1.toString() === arr2.toString();