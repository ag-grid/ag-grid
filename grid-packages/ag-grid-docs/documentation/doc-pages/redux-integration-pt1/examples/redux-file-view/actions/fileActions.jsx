import {types} from '../types/fileTypes.jsx'

export const actions = {
  newFile(folder) {
    return {
      type: types.NEW_FILE,
      payload: {folder}
    };
  },
  deleteFile(id) {
    return {
      type: types.DELETE_FILE,
      payload: {id}
    };
  }
};