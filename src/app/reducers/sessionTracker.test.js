import routes from 'app/router';
import createTest from 'platform/createTest';
import sessionTracker from './sessionTracker';
import * as accountActions from 'app/actions/accounts';
import * as sessionTrackerActions from 'app/actions/sessionTracker';

createTest({ reducers: { sessionTracker }, routes }, ({ getStore, expect }) => {

  const id = 'FkKR4iIEsVZsGKuRT0';
  const value = `${id}.0.1498252888697.Z0FBQUFBQlpUWVpZS3F1MlNYTi1CZG8wU2twOXJjUmh3c0FxT2YyNkY2SGpWZDMtVmR5aEVXdEtwTThUdnpjZllOZFhZcFItMUNnVTNqMFR0NzlGMHU5RFBlWVowTGhrcXVFcDR0Y3RBYUQtNVZLUUNEUGVvTzU2WVRIODBFa3VkTVMyc3owcWd4clI`;
  const cookie = `session_tracker=${value}; Domain=reddit.com; Max-Age=7199; Path=/; expires=Mon, 17-Jul-2017 19:59:02 GMT; secure`;
  const apiResponse = {meta: { 'set-cookie': [cookie] }};

  describe('sessionTracker', () => {
    it('should set sessionTracker', () => {
      const { store } = getStore();
      store.dispatch(sessionTrackerActions.setSessionTracker(value));
      const { sessionTracker } = store.getState();
      expect(sessionTracker.id).to.equal(id);
      expect(sessionTracker.value).to.equal(value);
    });
  });

  describe('received account', () => {
    it('should change sessionTracker', () => {
      const { store } = getStore();
      store.dispatch(accountActions.received({}, apiResponse));
      const { sessionTracker } = store.getState();
      expect(sessionTracker.id).to.equal(id);
      expect(sessionTracker.value).to.equal(value);
    });
  });
});
