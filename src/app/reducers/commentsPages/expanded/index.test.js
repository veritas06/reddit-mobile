import createTest from '@r/platform/createTest';

import expanded from './index';
import * as commentsPageActions from 'app/actions/commentsPage';

createTest({ reducers: { expanded } }, ({ getStore, expect }) => {
  describe('REDUCER - postCommentsLists.expanded', () => {
    it('should indicated when a post\'s comment tree is expanded', () => {
      const { store } = getStore();
      store.dispatch(commentsPageActions.expandCommentTree('foo'));
      expect(store.getState().expanded).to.eql({ foo: true });
    });
  });
});
