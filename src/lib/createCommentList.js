import { models } from '@r/api-client';
const { COMMENT, COMMENT_LOAD_MORE, COMMENT_CONTINUE_THREAD } = models.ModelTypes;

const INITIAL_RESULT = {
  list: [],
  currentCollapsedDepth: Infinity,
};

/**
 * Given data from the store, create a flat list of comments to display in the
 * comment tree
 * @module helpers/createCommentList
 * @param   {object} data - A dictionary of named inputs
 * @param   {array} data.commentsList - A `postCommentsList` from the data store
 * @param   {object} data.collapsedComments - A set-like dictionary of comment
 *                   ids that are collapsed.
 * @param   {object} data.allComments - A dictionary of all the comment objects
 *                   in the store.
 * @param   {object} data.allLoadMoreComments - A dictionary of all the
 *                   "load more comments" objects in the data store.
 * @param   {object} data.allContinueThreads - A dictionary of all the
 *                   "continue threads" objects in the data store.
 * @param   {object} data.pendingLoadMore - A dictionary of which "load more"
 *                   objects are pending an api call to replace them with
 *                   comments.
 * @param   {boolean} [data.isExpanded=false] - Whether the comment tree is
 *                    expanded
 * @param   {number} [data.maxCollapsedDepth=0] - The max depth the tree should
 *                   include when in a collapsed state. If
 *                   `data.isExpanded === true`, this field is a no-op.
 * @param   {number} [data.maxCollapsedHeight=5] - The max number of comments to
 *                   show in the tree when in a collapsed state. If
 *                   `data.isExpanded === true`, this field is a no-op.
 * @returns {array} A flat list comments
 */
export default function createCommentList(data={}) {
  const {
    commentsList,
    collapsedComments,
    allComments,
    allLoadMoreComments,
    allContinueThreads,
    pendingLoadMore,
    isExpanded=false,
    maxCollapsedDepth=0,
    maxCollapsedHeight=5,
  } = data;

  return commentsList
    // first, filter out anything that is too deep, unless the list is expanded
    .filter(({ depth }) => isExpanded ? true : depth <= maxCollapsedDepth)
    // then, we're going to organize our data into something a view can easily
    // consume
    .reduce((result, { depth, uuid, type }) => {
      // check if the comment should be hidden because an ancestor was collapsed
      const isHidden = depth > result.currentCollapsedDepth;

      // check if this comment itself is collapsed
      const isCollapsed = !!collapsedComments[uuid];

      // do we need to reset the currentCollapsedDepth?
      let currentCollapsedDepth = result.currentCollapsedDepth;
      if (!isHidden) {
        if (isCollapsed) {
          currentCollapsedDepth = depth;
        } else {
          currentCollapsedDepth = Infinity;
        }
      }

      // grab the right model
      let model;
      if (type === COMMENT) {
        model = allComments[uuid];
      } else if (type === COMMENT_LOAD_MORE) {
        model = {
          ...allLoadMoreComments[uuid],
          isPending: !!pendingLoadMore[uuid],
        };
      } else if (type === COMMENT_CONTINUE_THREAD) {
        model = allContinueThreads[uuid];
      }

      // build the structure out
      const obj = {
        depth,
        isHidden,
        type,
        data: {
          ...model,
          isCollapsed,
        },
      };

      return {
        currentCollapsedDepth,
        list: result.list.concat([obj]),
      };
    }, INITIAL_RESULT)
    // pull just the list out
    .list
    // set the max height
    .slice(0, isExpanded ? undefined : maxCollapsedHeight);
}

