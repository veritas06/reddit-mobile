import createTest from 'platform/createTest';
import routes from 'app/router';
import serverSide, { DEFAULT } from './index';
import * as xpromoActions from 'app/actions/xpromo';

createTest({ reducers: { serverSide }, routes }, ({ getStore, expect }) => {
  describe('/xpromo/serverSide', () => {

    describe('XPROMO_ADD_BUCKET_EVENT', () => {
      it('should record the fired bucketing event into the `firstBuckets` state', () => {
        const mockBucketingEventName = 'mweb_xpromo_ad_loading_ios';
        const { store } = getStore({ firstBuckets: DEFAULT });
        store.dispatch(xpromoActions.xpromoAddBucketingEvent(mockBucketingEventName));
        const { serverSide } = store.getState();
        expect(serverSide.firstBuckets).to.eql([mockBucketingEventName]);
      });
    });

  });
});
