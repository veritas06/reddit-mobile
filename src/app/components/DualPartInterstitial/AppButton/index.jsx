import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { getXPromoLinkforCurrentPage } from 'lib/xpromoState';
import {
  logAppStoreNavigation,
  navigateToAppStore,
  promoClicked,
} from 'app/actions/xpromo';

// :) Dirty-Dirty-Dirty-inline-script and wrap-component, that acually works 
// only after the server-side rendering and while the client-side is loading. 
// It is mostly used for the Ad Loading (with XPromo button in it). The purpouse 
// of it is to prevent opening <A data-href /> link in Tab or in New browser window.
class AppButtonWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.intersepterId = `inline_script_id_${Date.now()}`;
  }
  clickInterseptorScript() {
    const linkhref = 'let l=e.currentTarget.parentElement.getElementsByTagName("A")[0].getAttribute("data-href");';
    const redirect = 'window.location.href=l;';
    const parentEl = 'let b=document.getElementById("${this.intersepterId}");';
    const eventHdl = 'b.addEventListener("click", a, {once: true});';
    return {__html : 'let a=function(e){${linkhref} ${redirect}}; ${parentEl} ${eventHdl}'};
  }
  render() {
    return (<div className="AppButton" id={ this.intersepterId }>
      <script dangerouslySetInnerHTML={ this.clickInterseptorScript() }></script>
      { this.props.children }
    </div>);
  }
}

export function AppButton(props) {
  const { 
    title,
    appLink,
    children,
    navigator,
  } = props;

  const CLASSNAME = 'DualPartInterstitialButton';
  // Two cases here:
  // 1) We should use A tag to avoid React rendering inconsistency
  // 2) We render this button both on the client and on the server side
  // — For the server side, HREF works (onClick is not enabled yet)
  // — For the client side, onClick (HREF will be prevented)
  return (
    <AppButtonWrapper>
      <a className={ CLASSNAME } data-href={ appLink } onClick={ navigator(appLink) }>
        { (children || title || 'Continue') }
      </a>
    </AppButtonWrapper>
  );
}

export const selector = createSelector(
  (state, props) => getXPromoLinkforCurrentPage(state, props.interstitialType),
  (appLink) => ({ appLink }),
);

const mapDispatchToProps = dispatch => {
  let preventExtraClick = false;

  return {
    navigator: (async (url, interstitial_type, visit_trigger='app_button') => {
      // Prevention of additional click events
      // while the Promise dispatch is awaiting
      if (!preventExtraClick) {
        preventExtraClick = true;
        // Track "XPromoEvent" and "AppStoreVisit" events.
        // Get a promise that returns back after the redirection is completed.
        const extraData = interstitial_type ? { interstitial_type } : undefined;
        const logAppStoreAction = logAppStoreNavigation(visit_trigger, extraData);
        const trackingPromise = dispatch(logAppStoreAction);

        dispatch(promoClicked()); // Hide interstitial XPromo banner
        navigateToAppStore(url);  // window.loction redirect to AppStore link.
        // We should not call `await` until the app-store navigation
        // is in progress, see actions/xpromo.navigateToAppStore for more info.
        await trackingPromise;
        preventExtraClick = false;
      }
    }),
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { interstitialType, visitTrigger } = ownProps;
  const { navigator: dispatchNavigator } = dispatchProps;

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    navigator: (url) => (e) => {
      dispatchNavigator(url, interstitialType, visitTrigger);
      // On the client-side, function "onClick()" should work instead of
      // HREF attribute (which is in used after the server-side rendering).
      // So prevent the HREF attr. after the client-side will be loaded!
      e.preventDefault();
      e.stopPropagation();
      return false;
    },
  };
};

export default connect(selector, mapDispatchToProps, mergeProps)(AppButton);
