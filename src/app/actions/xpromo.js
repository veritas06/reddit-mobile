import { XPROMO_MODAL_LISTING_CLICK_NAME } from 'app/constants';
import {
  getXPromoListingClickLink,
  markBannerClosed,
  markListingClickTimestampLocalStorage,
  shouldNotShowBanner,
  listingClickInitialState as getListingClickInitialState,
  isXPromoPersistentEnabled,
} from 'lib/xpromoState';
import {
  trackPreferenceEvent,
  XPROMO_APP_STORE_VISIT,
  XPROMO_DISMISS,
  XPROMO_VIEW,
} from 'lib/eventUtils';

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

export const XPROMO_PERSIST_DEACTIVE = 'XPROMO__PERSIST_DEACTIVE';
export const promoPersistDeactivate = () => ({ type: XPROMO_PERSIST_DEACTIVE });
export const XPROMO_PERSIST_ACTIVE = 'XPROMO__PERSIST_ACTIVE';
export const promoPersistActivate = () => async (dispatch) => {
  dispatch({ type: XPROMO_PERSIST_ACTIVE });
  dispatch(show());
};

export const XPROMO_DISMISS_CLICKED = 'XPROMO__DISMISS_CLICKED';
export const promoDismissed = (dismissType) => async (dispatch, getState) => {
  dispatch({ type: XPROMO_DISMISS_CLICKED });
  if (dismissType) {
    dispatch(trackXPromoEvent(XPROMO_DISMISS, { dismiss_type: dismissType }));
  }
  if (isXPromoPersistentEnabled(getState())) {
    dispatch(promoPersistActivate());
  }
};

export const LISTING_CLICK_INITIAL_STATE = 'XPROMO__LISTING_CLICK_INITIAL_STATE';
export const listingClickInitialState = ({ ineligibilityReason='', lastModalClick=0 }) => ({
  type: LISTING_CLICK_INITIAL_STATE,
  payload: {
    ineligibilityReason,
    lastModalClick,
  },
});

export const MARK_MODAL_LISTING_CLICK_TIMESTAMP = 'XPROMO__MARK_MODAL_LISTING_CLICK_TIMESTAMP';
export const markModalListingClickTimestamp = () => async (dispatch) => {
  const dateTime = new Date();
  dispatch({
    type: MARK_MODAL_LISTING_CLICK_TIMESTAMP,
    clickTime: dateTime.getTime(),
  });
  markListingClickTimestampLocalStorage(dateTime);
};

export const LISTING_CLICK_MODAL_ACTIVATED = 'XPROMO__LISTING_CLICK_MODAL_ACTIVATED';
export const xpromoListingClickModalActivated = ({ postId='', listingClickType='' }) => ({
  type: LISTING_CLICK_MODAL_ACTIVATED,
  payload: {
    postId,
    listingClickType,
  },
});

export const LISTING_CLICK_RETURNER_MODAL_ACTIVATED =
  'XPROMO__LISTING_CLICK_RETURNER_MODAL_ACTIVATED';

export const xpromoListingClickReturnerModalActivated = () => ({
  type: LISTING_CLICK_RETURNER_MODAL_ACTIVATED,
});

export const LISTING_CLICK_MODAL_HIDDEN = 'XPROMO__LISTING_CLICK_MODAL_HIDDEN';
export const listingClickModalHidden = () => ({ type: LISTING_CLICK_MODAL_HIDDEN });

export const TRACK_XPROMO_EVENT = 'XPROMO__TRACK_EVENT';
export const trackXPromoEvent = (eventType, data) => ({
  type: TRACK_XPROMO_EVENT,
  eventType,
  data,
});

export const LOGIN_REQUIRED = 'XPROMO__LOGIN_REQUIRED';
export const loginRequired = () => ({ type: LOGIN_REQUIRED });

export const XPROMO_ADD_BUCKET_EVENT = 'XPROMO__ADD_BUCKET_EVENT';
export const xpromoAddBucketingEvent = (bucketEventName='') => async (dispatch) => {
  dispatch({type: XPROMO_ADD_BUCKET_EVENT, payload: { bucketEventName }});
};

// element is the interface element through which
// the user dismissed the crosspromo experience.
const EXTERNAL_PREF_NAME = 'hide_mweb_xpromo_banner';
export const close = () => async (dispatch, getState) => {
  markBannerClosed();
  dispatch(hide());
  // We use a separate externally-visible name/value
  // for the preference for clarity when analyzing
  // these events in our data pipeline.
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
  if (isXPromoPersistentEnabled(getState())) {
    dispatch(promoPersistActivate());
  }
  dispatch(listingClickInitialState(getListingClickInitialState()));
};

export const performListingClick = (postId, listingClickType) => async (dispatch, getState) => {
  if (getState().xpromo.listingClick.active) {
    return;
  }

  dispatch(xpromoListingClickModalActivated({ postId, listingClickType }));
  dispatch(trackXPromoEvent(XPROMO_VIEW));
  dispatch(markModalListingClickTimestamp());
};

export const listingClickModalAppStoreClicked = () => async (dispatch, getState) => {
  // guard against duplicate clicks
  const state = getState();
  if (!state.xpromo.listingClick.showingAppStoreModal) {
    return;
  }

  const { listingClickType, postId } = state.xpromo.listingClick.clickInfo;

  // Start tracking before navigating to the app store
  const trackingPromise = dispatch(trackAppStoreVisit(XPROMO_MODAL_LISTING_CLICK_NAME));

  dispatch(xpromoListingClickReturnerModalActivated());

  navigateToAppStore(getXPromoListingClickLink(state, postId, listingClickType));

  await trackingPromise;
};

export const listingClickModalDismissClicked = () => async (dispatch, getState) => {
  // guard against duplicate clicks
  const state = getState();
  if (!state.xpromo.listingClick.active) {
    return;
  }

  const { showingReturnerModal } = state.xpromo.listingClick;

  dispatch(trackXPromoEvent(XPROMO_DISMISS, {
    dismiss_type: `${XPROMO_MODAL_LISTING_CLICK_NAME}${showingReturnerModal ? '_returner' : ''}`,
  }));

  dispatch(listingClickModalHidden());
};

export const logAppStoreNavigation = (visitType, extraData={}) => async (dispatch) => {
  return Promise.all([
    dispatch(trackXPromoEvent(XPROMO_DISMISS, { dismiss_type: 'app_store_visit' })),
    dispatch(trackAppStoreVisit(visitType, extraData)),
  ]);
};

const trackAppStoreVisit = (visitType, extraData) => trackXPromoEvent(XPROMO_APP_STORE_VISIT, {
  ...extraData,
  visit_trigger: visitType,
});

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
