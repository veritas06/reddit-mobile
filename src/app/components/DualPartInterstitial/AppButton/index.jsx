import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
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
    serverAppLink,
    clientAppLink,
  } = props;

  const CLASSNAME = 'DualPartInterstitialButton';
  const themeText = (xpromoTheme === THEME.PERSIST ? 'Open in app' : 'Continue');
  // Two cases here:
  // 1) We should use A tag to avoid React rendering inconsistency
  // 2) We render this button both on the client and on the server side
  // — For the server side, HREF works (onClick is not enabled yet)
  // — For the client side, onClick (HREF will be prevented)
  return (
    <a className={ CLASSNAME } href={ serverAppLink } onClick={ navigator(clientAppLink) }>
      { (title || themeText) }
    </a>
  );
}

export const selector = createSelector(
  (state) => state.xpromo.server.appLink,
  (state) => getXPromoLinkforCurrentPage(state, 'interstitial'),
  xpromoTheme,
  (serverAppLink, clientAppLink, xpromoTheme) => ({
    serverAppLink, clientAppLink, xpromoTheme,
  }),
);

const mapDispatchToProps = dispatch => {
  let preventExtraClick = false;

  return {
    navigator: (async (visitTrigger, url) => {
      // Prevention of additional click events
      // while the Promise dispatch is awaiting
      if (!preventExtraClick) {
        preventExtraClick = true;
        // We should not call `await` until the app-store navigation is in progress,
        // see actions/xpromo.navigateToAppStore for more info.
        const trackingPromise = dispatch(logAppStoreNavigation(visitTrigger));
        dispatch(promoClicked());
        navigateToAppStore(url);
        await trackingPromise;
        preventExtraClick = false;
      }
    }),
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { xpromoTheme } = stateProps;
  const { navigator: dispatchNavigator } = dispatchProps;
  const visitTrigger = getXpromoTheme(xpromoTheme).visitTrigger;

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    navigator: (url) => (e) => {
      dispatchNavigator(visitTrigger, url);

      // Prevents HREF redirection
      // for the client side.
      e.preventDefault();
      e.stopPropagation();
      return false;
    },
  };
};

export default connect(selector, mapDispatchToProps, mergeProps)(AppButton);
