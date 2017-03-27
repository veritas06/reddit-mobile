import {
  getXPromoListingClickLink,
  markBannerClosed,
  markListingClickTimestampLocalStorage,
  shouldNotShowBanner,
  shouldNotListingClick,
} from 'lib/xpromoState';
import {
  trackPreferenceEvent,
  XPROMO_APP_STORE_VISIT,
  XPROMO_DISMISS,
  XPROMO_VIEW,
} from 'lib/eventUtils';

import {
  XPROMO_LISTING_CLICK_EVENTS_NAME,
} from 'app/constants';

import features from 'app/featureFlags';
import { flags } from 'app/constants';
const { XPROMO_LISTING_CLICK_EVERY_TIME_COHORT } = flags;


export const SHOW = 'XPROMO__SHOW';
export const show = () => ({ type: SHOW });

export const HIDE = 'XPROMO__HIDE';
export const hide = () => ({ type: HIDE });

export const PROMO_CLICKED = 'XPROMO__PROMO_CLICKED';
export const promoClicked = () => ({ type: PROMO_CLICKED });

export const PROMO_SCROLLSTART = 'XPROMO__SCROLLSTART';
export const promoScrollStart = () => ({ type: PROMO_SCROLLSTART });
export const PROMO_SCROLLPAST = 'XPROMO__SCROLLPAST';
export const promoScrollPast = () => ({ type: PROMO_SCROLLPAST });
export const PROMO_SCROLLUP = 'XPROMO__SCROLLUP';
export const promoScrollUp = () => ({ type: PROMO_SCROLLUP });

export const CAN_LISTING_CLICK = 'XPROMO__CAN_LISTING_CLICK';
export const canListingClick = () => ({ type: CAN_LISTING_CLICK });

export const MARK_LISTING_CLICK_TIMESTAMP = 'XPROMO__MARK_LISTING_CLICK_TIMESTAMP';
export const markListingClickTimeStamp = () => async (dispatch) => {
  dispatch({ type: MARK_LISTING_CLICK_TIMESTAMP });
  markListingClickTimestampLocalStorage();
};

export const XPROMO_LISTING_CLICKED = 'XPROMO__LISTING_CLICKED';
export const promoListingClicked = () => ({ type: XPROMO_LISTING_CLICKED });

export const XPROMO_LISTING_CLICK_ANIMATION_COMPLETED = 'XPROMO__LISTING_CLICK_ANIMATION_COMPLETED';
export const promoListingAnimated = () => ({ type: XPROMO_LISTING_CLICK_ANIMATION_COMPLETED });

// max delay for the listing click interstitial to be on screen after trying
// to navigate to the app store / installed app. If the user doesn't give
// permission to navigate out of the browser, the promo will still be on screen.
// Normally this is handled by a 'on:focus' listener in the `Client.js`,
// but in this scenario we won't always have a focus event. You may be wondering,
// why should there be a listener in the Client at all? Having it close on
// visibility change protects us from Javascript not executing if the page
// goes into the background, and ensures we hide the interstitial immediately
// when the user comes back to the browser.
const MAX_LISTING_CLICK_INTERSTITIAL_ON_SCREEN = 4000;

// amount of delay from the animation completing before redirecting.
const LISTING_ANIMATION_COMPLETE_PAUSE = 200;

export const showListingClickInterstitial = () => async (dispatch, _, { waitForAction }) => {
  dispatch(promoListingClicked());

  return new Promise(resolve => {
    // wait for the animation to finish, then pause before resolving.
    // we use a spring-based animation, so we can't specify the exact duration
    waitForAction(action => action.type === XPROMO_LISTING_CLICK_ANIMATION_COMPLETED, () => {
      setTimeout(resolve, LISTING_ANIMATION_COMPLETE_PAUSE);
    });
  });
};

export const XPROMO_HIDE_LISTING_CLICK_INTERSTITIAL = 'XPROMO__HIDE_LISTING_CLICK_INTERSTITIAL';
export const hideListingClickInterstitialIfNeeded = () => async (dispatch, getState) => {
  const state = getState();

  if (!state.xpromo.listingClick.showingListingClickInterstitial) {
    return;
  }

  dispatch({ type: XPROMO_HIDE_LISTING_CLICK_INTERSTITIAL });
};

export const TRACK_XPROMO_EVENT = 'XPROMO__TRACK_EVENT';
export const trackXPromoEvent = (eventType, data) => ({
  type: TRACK_XPROMO_EVENT,
  eventType,
  data,
});

export const LOGIN_REQUIRED = 'XPROMO__LOGIN_REQUIRED';
export const loginRequired = () => ({ type: LOGIN_REQUIRED });

const EXTERNAL_PREF_NAME = 'hide_mweb_xpromo_banner';

// element is the interface element through which the user dismissed the
// crosspromo experience.
export const close = () => async (dispatch, getState) => {
  markBannerClosed();
  dispatch(hide());

  // We use a separate externally-visible name/value for the preference for
  // clarity when analyzing these events in our data pipeline.
  trackPreferenceEvent(getState(), {
    modified_preferences: [EXTERNAL_PREF_NAME],
    user_preferences: {
      [EXTERNAL_PREF_NAME]: true,
    },
  });

};

export const checkAndSet = () => async (dispatch, getState) => {
  if (!shouldNotShowBanner(getState())) {
    dispatch(show());
  }

  if (!shouldNotListingClick(getState())) {
    dispatch(canListingClick());
  }
};

let _listingIntersitialHideTimer = null;

export const performListingClick = (postId, listingClickType) => async (dispatch, getState) => {
  if (getState().xpromo.listingClick.showingListingClickInterstitial) {
    return;
  }

  // _listingIntersitialHideTimer tracks the timeout used to ensure we don't
  // indefinetly show the listing interstitial. If the user is in everytime and:
  // clicks -> comes back -> clicks again, we need to reset that timer.
  if (_listingIntersitialHideTimer) {
    clearTimeout(_listingIntersitialHideTimer);
  }

  const extraEventData = {
    interstitial_type: XPROMO_LISTING_CLICK_EVENTS_NAME,
    listing_click_type: listingClickType,
  };

  const trackingPromise = Promise.all([
    // resolves when the interstitial animation is complete
    dispatch(showListingClickInterstitial()),
    dispatch(trackXPromoEvent(XPROMO_VIEW, extraEventData)),
    dispatch(trackXPromoEvent(XPROMO_APP_STORE_VISIT, {
      ...extraEventData,
      visit_trigger: XPROMO_LISTING_CLICK_EVENTS_NAME,
    })),
  ]);

  // For the every two week cohort, record the click
  const state = getState();
  const featureContext = features.withContext({ state });
  if (!featureContext.enabled(XPROMO_LISTING_CLICK_EVERY_TIME_COHORT)) {
    dispatch(markListingClickTimeStamp());
  }

  // Navigate right-away without waiting for tracking, this way deep-linking
  // on iOS and Android works as expected in productio.
  const listingClickURL = getXPromoListingClickLink(getState(), postId, listingClickType);
  navigateToAppStore(listingClickURL);

  await trackingPromise;

  // The user might not approve opening the link externally, in which case
  // we'll still be on this page. So we should close the interstitial.
  _listingIntersitialHideTimer = setTimeout(
    () => dispatch(hideListingClickInterstitialIfNeeded()),
    MAX_LISTING_CLICK_INTERSTITIAL_ON_SCREEN
  );
};

export const logAppStoreNavigation = visitType => async (dispatch) => {
  return Promise.all([
    dispatch(trackXPromoEvent(XPROMO_DISMISS, { dismiss_type: 'app_store_visit' })),
    dispatch(trackXPromoEvent(XPROMO_APP_STORE_VISIT, { visit_trigger: visitType })),
  ]);
};

/**
 * @name navigateToAppStore
 * A helper to redirect to the app store, expected to be called with branch-links
 * that specify a $deeplink_path (and $android_deeplink_path) param.
 *
 * This should be called directly in a click-handler (or other
 * user-interaction event handler)
 *
 * This used to be an async action, but that doesn't work well with deep-linking.
 * iOS is stricter than Android, it's deep linking behavior depends on a combination of:
 *  1) is the navigation started in the event-handler of a user's interaction.
 *    i.e., Did the user click a button, and is this function called in that
 *          button's onClick method? IF you call `await` in that click handler
 *          before navigating, we'll be in a new call-stack.
 *  2) Is this page's url a local / dev url, or production.
 *    i.e., there's different behavior on reddit.com vs <machine-name>.local:4444
 *
 * You can violate (1) in dev, and still see deeplinking work. i.e. you can
 * can call `await somePromise()` _then_ call `navigateToAppStore` in development,
 * and be deeplinkined. In production, this does not work, so you should always
 * call this function in a user-interaction's original event-handler.
 *
 * This doesn't apply to all iOS versions, so its better to just do this
 * all the time. Additionally with universal links, when you're deep-linked into the
 * app, there will be clickable text that says `app.link` in the upper-right
 * of the status bar. When you press this, you'll be sent to the app-store page
 * and all subsequent branch links will always go to the app-store, event if you
 * follow all of the above recommendations. Once in this state, you can only
 * 'fix' it by tap-holding a branch-link and selecting the 'Open in "Reddit"' option.
 * We don't use real anchor tags, so there's no where in mweb that you can do this
 * at present.
 *
 * Android has a similar, but worse issue. In some circumstances play-store / deeplinks
 * on Android will open an invalid intent:// url page. In this case, the
 * user sees a grey page with a giant intent url that in the page body that takes
 * up most of the screen. Navigating in the event handler's call-stack resolves
 * this issue as well.
 *
 * Note: We only started calling `await` before navigating when we experimented with
 * waiting on tracking events, or animations before doing the redirect.
 * As long as you initiate the event-tracking XMLHTTPRequest before navigating,
 * the events should be okay. You can confirm this with Safari's remote debugging
 * for iOS Safari, and Chrome's remote debugging for Android devices.
 *
 * If there is some small percentage of drop-off, having deep-links
 * work on devices that already have the app installed is more desired for now.
 *
 * @param {string} url - Branch link used to open the app-store page of the reddit
 * app. This link should have $deeplink_path and $android_deeplink_path query-params
 * specified to deeplink on devices that already have the app installed.
 */
export const navigateToAppStore = url => {
  window.location = url;
};
