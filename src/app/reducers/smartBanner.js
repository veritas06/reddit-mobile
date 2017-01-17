import merge from '@r/platform/merge';
import * as platformActions from '@r/platform/actions';

import * as xpromoActions from 'app/actions/xpromo';
import * as loginActions from 'app/actions/login';
import { markBannerClosed } from 'lib/smartBannerState';

export const DEFAULT = {
  showBanner: false,
  haveShownXPromo: false,
  xPromoShownUrl: null,
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

    case xpromoActions.RECORD_SHOWN: {
      return merge(state, {
        haveShownXPromo: true,
        xPromoShownUrl: action.url,
      });
    }

    case loginActions.LOGGED_IN: {
      if (state.haveShownXPromo) {
        // NOTE: we should really only be doing this
        // in the case that we are running a "login required"
        // variant. Since we don't have access to the full state
        // here, that's difficult to find out.
        markBannerClosed();
        return merge(state, {
          showBanner: false,
        });
      }
      return state;
    }

    case platformActions.NAVIGATE_TO_URL: {
      if (state.haveShownXPromo) {
        return merge(state, {
          showBanner: false,
        });
      }

      return state;
    }

    default:
      return state;
  }
}
