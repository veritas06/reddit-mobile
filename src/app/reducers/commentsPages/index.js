import { combineReducers } from 'redux';

import api from './api';
import data from './data';
import expanded from './expanded';

/**
* Reducer for comment lists as they relate to posts. Combines
* postCommentsLists/api and postCommentsListsdata redcuers.
* @module reducers/postCommentsLists
**/
export default combineReducers({
  api,
  data,
  expanded,
});
