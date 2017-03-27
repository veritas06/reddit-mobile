/**
 * @module {function} listingClick
 * @memberof app/reducers/xpromo
 *
 * This reducer manges all of the listingClick xpromo state.
 */

import merge from 'platform/merge';

import * as xpromoActions from 'app/actions/xpromo';

export const DEFAULT = {
  canListingClick: false, // are listing click's eligible to be x-promoted
  showingListingClickInterstitial: false, // is the listing click interstitial on screen
};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case xpromoActions.CAN_LISTING_CLICK: {
      return merge(state, {
        canListingClick: true,
      });
    }

    case xpromoActions.XPROMO_LISTING_CLICKED: {
      return merge(state, {
        showingListingClickInterstitial: true,
      });
    }

    case xpromoActions.XPROMO_HIDE_LISTING_CLICK_INTERSTITIAL: {
      return merge(state, {
        showingListingClickInterstitial: false,
      });
    }

    case xpromoActions.MARK_LISTING_CLICK_TIMESTAMP: {
      return merge(state, {
        canListingClick: false,
      });
    }

    default: return state;
  }
}
