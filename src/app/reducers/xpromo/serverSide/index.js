/**
 * @module {function} serverSide
 * @memberof app/reducers/xpromo
 *
 * This reducer manages all of the XPromo server-side state:
 * 1) firstBuckets - collects fired (on the server-side) bucketing 
 * event, prevents of triggering event on the client-side also (this 
 * type of event should be triggered once per session). 
 */

import merge from 'platform/merge';
import * as xpromoActions from 'app/actions/xpromo';

export const DEFAULT = {
  firstBuckets: [],
};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case xpromoActions.XPROMO_ADD_BUCKET_EVENT: {
      const firstBuckets = state.firstBuckets;
      return merge(state, {
        firstBuckets: [
          ...firstBuckets,
          action.payload.bucketEventName,
        ]});
    }
    default: return state;
  }
}
