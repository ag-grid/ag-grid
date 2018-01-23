import {types} from '../types/fileTypes.jsx'

export const actions = {
  newFile(filePath) {
    return {
      type: types.NEW_FILE,
      payload: {filePath}
    };
  },
  moveFiles(pathToMove, targetPath) {
    return {
      type: types.MOVE_FILES,
      payload: {pathToMove, targetPath}
    };
  },
  deleteFiles(pathToRemove) {
    return {
      type: types.DELETE_FILES,
      payload: {pathToRemove}
    };
  }
};