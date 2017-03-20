import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import cx from 'lib/classNames';
import { getDevice } from 'lib/getDeviceFromState';
import DualPartInterstitialHeader from 'app/components/DualPartInterstitial/Header';
import DualPartInterstitialFooter from 'app/components/DualPartInterstitial/Footer';
import XPromoWrapper from 'app/components/XPromoWrapper';
import {
  logAppStoreNavigation,
  navigateToAppStore,
  promoClicked,
} from 'app/actions/xpromo';
import { xpromoThemeIsUsual, scrollPastState } from 'app/selectors/xpromo';

export function DualPartInterstitial(props) {
  const { scrollPast, xpromoThemeIsUsualState} = props;
  const componentClass = 'DualPartInterstitial';
  const displayClasses = cx(componentClass, {
    'xpromoMinimal': !xpromoThemeIsUsualState,
    'fadeOut' : !xpromoThemeIsUsualState && scrollPast,
  });

  return (
    <XPromoWrapper>
      <div className={ displayClasses }>
        <div className={ `${componentClass}__content` }>
          <div className={ `${componentClass}__common` }>
            <DualPartInterstitialHeader { ...props } />
            <DualPartInterstitialFooter { ...props } />
          </div>
        </div>
      </div>
    </XPromoWrapper>
  );
}

export const selector = createSelector(
  getDevice,
  scrollPastState,
  (state => xpromoThemeIsUsual(state)),
  (device, scrollPast, xpromoThemeIsUsualState) => ({
    device, 
    scrollPast, 
    xpromoThemeIsUsualState,
  }),
);

const mapDispatchToProps = dispatch => {
  let preventExtraClick = false;
  return {
    navigator: (visitTrigger, url) => (async () => {
      // Prevention of additional click events
      // while the Promise dispatch is awaiting
      if (!preventExtraClick) {
        preventExtraClick = true;
        // iOS has different deep-linking behavior that depends on a combination of
        // 1) did you start nagivgating to a universal link in call-stack of the click event,
        // 2) are you on a local dev url (localhost, ip address, <machine-name>) or prod
        // In prod, deep-linking of universal-links only works reliably if you
        // navigate in the click-handlers originating call-stack. In local dev,
        // it appears to work fine if you don't, but in prod with the app installed
        // you'll instead be navigated to the app-store.
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
  const { xpromoThemeIsUsualState } = stateProps;
  const { navigator: dispatchNavigator } = dispatchProps;
  const visitTrigger = xpromoThemeIsUsualState ? 'interstitial_button' : 'banner_button';

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    navigator: url => dispatchNavigator(visitTrigger, url),
  };
};

export default connect(selector, mapDispatchToProps, mergeProps)(DualPartInterstitial);
