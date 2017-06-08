import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import DualPartInterstitial from 'app/components/DualPartInterstitial';
import EUCookieNotice from 'app/components/EUCookieNotice';
import TopNav from 'app/components/TopNav';
import { 
  XPromoIsActive,
  isXPromoFixedBottom,
  loginRequiredEnabled as loginRequiredXPromoVariant,
} from 'app/selectors/xpromo';

const renderXPromoBanner = (children, isDisplay=false, mixin=false) => {
  return isDisplay ? <DualPartInterstitial mixin={ mixin }>{ children }</DualPartInterstitial> : null;
};

const NavFrame = props => {
  const {
    children,
    showXPromo,
    requireLogin,
    isXPromoFixed,
  } = props;

  // xPromoPadding is an additional hidden DOM element that helps
  // to avoid the situation when a bottom-fixed (CSS rules) banner
  // is overlapping the content at the end of the page.
  const showXPromoPadding = (showXPromo && isXPromoFixed);
  const xPromoPadding = renderXPromoBanner(children, showXPromoPadding, 'm-invisible');
  const xPromoBanner = renderXPromoBanner(children, showXPromo);

  const otherContent = requireLogin ? null : (
    <div>
      <TopNav />
      <div className='NavFrame__below-top-nav'>
        <EUCookieNotice />
        { children }
      </div>
      { xPromoPadding }
    </div>
  );

  return (
    <div className='NavFrame'>
      { xPromoBanner }
      { otherContent }
    </div>
  );
};

const xPromoSelector = createSelector(
  XPromoIsActive,
  isXPromoFixedBottom,
  loginRequiredXPromoVariant,
  (showXPromo, isXPromoFixed, requireLogin) => {
    return { showXPromo, isXPromoFixed, requireLogin};
  },
);

export default connect(xPromoSelector)(NavFrame);
