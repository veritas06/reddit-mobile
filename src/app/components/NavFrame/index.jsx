import React from 'react';
import { connect } from 'react-redux';

import DualPartInterstitial from 'app/components/DualPartInterstitial';
import EUCookieNotice from 'app/components/EUCookieNotice';
import TopNav from 'app/components/TopNav';
import { flags as flagConstants } from 'app/constants';
import features from 'app/featureFlags';

const {
  VARIANT_XPROMO_FP_LOGIN_REQUIRED,
  VARIANT_XPROMO_SUBREDDIT_LOGIN_REQUIRED,
} = flagConstants;

export function xPromoSelector(state) {
  const featureContext = features.withContext({ state });
  const showDualPartInterstitial = state.smartBanner.showBanner;
  const requireLogin = (
    showDualPartInterstitial &&
    (featureContext.enabled(VARIANT_XPROMO_FP_LOGIN_REQUIRED) ||
     featureContext.enabled(VARIANT_XPROMO_SUBREDDIT_LOGIN_REQUIRED))
  );
  return {
    showDualPartInterstitial,
    requireLogin,
  };
}

const NavFrame = props => {
  const {
    children,
    requireLogin,
    showDualPartInterstitial,
  } = props;

  let belowXPromo = null;
  if (!requireLogin) {
    belowXPromo = (
      <div>
        <TopNav />
        <div className='NavFrame__below-top-nav'>
          <EUCookieNotice />
          { children }
        </div>
      </div>
    );
  }

  return (
    <div className='NavFrame'>
      { showDualPartInterstitial ?
        <DualPartInterstitial>{ children }</DualPartInterstitial> : null }
      { belowXPromo }
    </div>
  );
};

export default connect(xPromoSelector)(NavFrame);
