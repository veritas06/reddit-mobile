/**
 * @module {function} interstitials
 * @memberof app/reducers/xpromo
 *
 * This reducer manages all of the xpromo interstitials state.
 */

import merge from 'platform/merge';

import * as xpromoActions from 'app/actions/xpromo';
import * as loginActions from 'app/actions/login';
import { markBannerClosed } from 'lib/xpromoState';


export const DEFAULT = {
  showBanner: false, // is this browsing session currently eligible to be x-promoted
  loginRequired: false, // is this the login-required variant
  scrolledPast: false, // have we scrolled past the interstitial / banner
  scrolledStart: false, // have we started to scroll past the interstitial / banner
};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case xpromoActions.SHOW: {
      return merge(state, {
        showBanner: true,
        ...action.data,
      });
    }

    case xpromoActions.HIDE: {
      return DEFAULT;
    }

    case xpromoActions.PROMO_SCROLLSTART: {
      return merge(state, {
        scrolledStart: true,
      });
    }

    case xpromoActions.PROMO_SCROLLPAST: {
      return merge(state, {
        scrolledPast: true,
      });
    }

    case xpromoActions.PROMO_SCROLLUP: {
      return merge(state, {
        scrolledPast: false,
      });
    }

    case xpromoActions.LOGIN_REQUIRED: {
      return merge(state, {
        loginRequired: true,
      });
    }

    case xpromoActions.PROMO_CLICKED: {
      markBannerClosed();
      return merge(state, {
        showBanner: false,
      });
    }

    case loginActions.LOGGED_IN: {
      if (state.loginRequired) {
        markBannerClosed();
        return merge(state, {
          showBanner: false,
          loginRequired: false,
        });
      }
      return state;
    }

    default: return state;
  }
}
