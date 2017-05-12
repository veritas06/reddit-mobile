import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import cx from 'lib/classNames';
import getXpromoTheme from 'lib/xpromoTheme';
import { getXPromoLinkforCurrentPage } from 'lib/xpromoState';
import { XPROMO_DISPLAY_THEMES as THEME } from 'app/constants';
import { xpromoTheme } from 'app/selectors/xpromo';
import {
  logAppStoreNavigation,
  navigateToAppStore,
  promoClicked,
} from 'app/actions/xpromo';

export function AppButton(props) {
  const { 
    title,
    navigator,
    xpromoTheme,
    nativeInterstitialLink 
  } = props;

  const themeText = (xpromoTheme === THEME.PERSIST ? 'Open in app' : 'Continue')

  return (
      <div 
        className='DualPartInterstitialButton'
        onClick={ navigator(nativeInterstitialLink) }
      > {(title || themeText)}
      </div>
  );
}

export const selector = createSelector(
  (state) => getXPromoLinkforCurrentPage(state, 'interstitial'),
  xpromoTheme,
  (nativeInterstitialLink, xpromoTheme) => ({
    nativeInterstitialLink, xpromoTheme
  }),
);

const mapDispatchToProps = dispatch => {
  let preventExtraClick = false;

  return {
    navigator: (visitTrigger, url, xpromoPersistState) => (async () => {
      // Prevention of additional click events
      // while the Promise dispatch is awaiting
      if (!preventExtraClick) {
        preventExtraClick = true;
        // We should not call `await` until the app-store navigation is in progress,
        // see actions/xpromo.navigateToAppStore for more info.
        const trackingPromise = dispatch(logAppStoreNavigation(visitTrigger));
        dispatch(promoClicked(xpromoPersistState));
        navigateToAppStore(url);
        await trackingPromise;
        preventExtraClick = false;
      }
    }),
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { xpromoTheme, xpromoPersistState } = stateProps;
  const { navigator: dispatchNavigator } = dispatchProps;
  const visitTrigger = getXpromoTheme(xpromoTheme).visitTrigger;

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    navigator: url => dispatchNavigator(visitTrigger, url, xpromoPersistState),
  };
};

export default connect(selector, mapDispatchToProps, mergeProps)(AppButton);
