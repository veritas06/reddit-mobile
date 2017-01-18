import * as commentsPageActions from 'app/actions/commentsPage';

const DEFAULT = {};

/**
 * Reducer for storing which posts have expanded comment trees.
 * @name expanded
 * @memberof module:reducers/postCommentsLists
 * @function
 * @param   {object} state - The value of previous state
 * @param   {object} action - The action to interpret. Contains 'type' and 'payload'
 * @returns {object} New version of state
 **/
export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case commentsPageActions.EXPAND_COMMENT_TREE: {
      const { pageId } = action.payload;
      return { ...state, [pageId]: true };
    }
    default: return state;
  }
};
