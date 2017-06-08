import './styles.less';
import React from 'react';
import getXpromoTheme from 'lib/xpromoTheme';
import AppButton from 'app/components/DualPartInterstitial/AppButton';

import {
  XPROMO_AD_FEED_TYPES as TYPE,
  XPROMO_DISPLAY_THEMES as THEME,
} from 'app/constants';

const XPromoAppButton = (props) => {
  const buttonProps = {
    title : 'Open in app',
    visitTrigger : getXpromoTheme(THEME.ADFEED),
    interstitialType : props.varian,
  };
  return <AppButton { ...buttonProps } />;
};

const AdTopBig = () => (
  <div className="XPromoAdFeed">
    <h1>TOP_BIG</h1>
    <XPromoAppButton varian={ TYPE.TOP_BIG } />
  </div>
);
const AdListingBig = () => (
  <div className="XPromoAdFeed">
    <h1>TOP_BIG</h1>
    <XPromoAppButton varian={ TYPE.LISTING_BIG } />
  </div>
);
const AdListingSmall = () => (
  <div className="XPromoAdFeed">
    <h1>TOP_BIG</h1>
    <XPromoAppButton varian={ TYPE.LISTING_SMALL } />
  </div>
);

export default {
  [TYPE.TOP_BIG]: (<AdTopBig />),
  [TYPE.LISTING_BIG]: (<AdListingBig />),
  [TYPE.LISTING_SMALL]: (<AdListingSmall />),
};
