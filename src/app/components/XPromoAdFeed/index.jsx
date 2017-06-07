import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import AppButton from 'app/components/DualPartInterstitial/AppButton';
import getXpromoTheme from 'lib/xpromoTheme';
import {
  XPROMO_AD_FEED_TYPES as TYPE,
  XPROMO_DISPLAY_THEMES as THEME,
} from 'app/constants';

export default function XPromoAdFeed() {

  const buttonProps = {
    title: 'Open in app',
    visitTrigger: getXpromoTheme(THEME.ADFEED).visitTrigger,
    interstitialType: TYPE.LISTING_SMALL,
  }

  return (
    <div className="XPromoAdFeed">
        <AppButton { ...buttonProps } />
    </div>
  );
}
