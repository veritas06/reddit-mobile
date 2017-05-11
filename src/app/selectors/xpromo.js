import { find, some } from 'lodash';

import {
  EXPERIMENT_FREQUENCY_VARIANTS,
  EVERY_HOUR,
  EVERY_DAY,
  flags as flagConstants,
  COLOR_SCHEME,
  XPROMO_DISPLAY_THEMES,
  XPROMO_MODAL_LISTING_CLICK_NAME,
} from 'app/constants';

import features, { isNSFWPage } from 'app/featureFlags';
import getRouteMetaFromState from 'lib/getRouteMetaFromState';
import { getExperimentData } from 'lib/experiments';
import { getDevice, IPHONE, ANDROID } from 'lib/getDeviceFromState';
import { isInterstitialDimissed } from 'lib/xpromoState';
import { trackXPromoIneligibleEvent } from 'lib/eventUtils';

const { DAYMODE } = COLOR_SCHEME;
const { USUAL, MINIMAL, PERSIST } = XPROMO_DISPLAY_THEMES;

const {
  XPROMOBANNER,

  // XPromo Login Required
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS,
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID,
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS_CONTROL,
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID_CONTROL,

  // XPromo Comments Interstitial
  VARIANT_XPROMO_INTERSTITIAL_COMMENTS_IOS,
  VARIANT_XPROMO_INTERSTITIAL_COMMENTS_ANDROID,

  // XPromo Modal Listing Click
  VARIANT_MODAL_LISTING_CLICK_IOS,
  VARIANT_MODAL_LISTING_CLICK_ANDROID,

  // XPromo Interstitial Frequrency
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_IOS,
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_ANDROID,

  // XPromo Persistent Banner
  VARIANT_XPROMO_PERSISTENT_IOS,
  VARIANT_XPROMO_PERSISTENT_ANDROID,

  // Server Ad loading
  AD_LOADING,
} = flagConstants;

const EXPERIMENT_FULL = [
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS,
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID,
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS_CONTROL,
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID_CONTROL,
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_IOS,
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_ANDROID,
  AD_LOADING,
];

const LOGIN_REQUIRED_FLAGS = [
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS,
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID,
];

const COMMENTS_PAGE_BANNER_FLAGS = [
  VARIANT_XPROMO_INTERSTITIAL_COMMENTS_IOS,
  VARIANT_XPROMO_INTERSTITIAL_COMMENTS_ANDROID,
];

const MODAL_LISTING_CLICK_FLAGS = [
  VARIANT_MODAL_LISTING_CLICK_IOS,
  VARIANT_MODAL_LISTING_CLICK_ANDROID,
];

const INTERSTITIAL_FREQUENCY_FLAGS = [
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_IOS,
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_ANDROID,
];

const XPROMO_PERSISTENT_FLAGS = [
  VARIANT_XPROMO_PERSISTENT_IOS,
  VARIANT_XPROMO_PERSISTENT_ANDROID,
];

const EXPERIMENT_NAMES = {
  [VARIANT_XPROMO_LOGIN_REQUIRED_IOS]: 'mweb_xpromo_require_login_ios',
  [VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID]: 'mweb_xpromo_require_login_android',
  [VARIANT_XPROMO_LOGIN_REQUIRED_IOS_CONTROL]: 'mweb_xpromo_require_login_ios',
  [VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID_CONTROL]: 'mweb_xpromo_require_login_android',
  [VARIANT_XPROMO_INTERSTITIAL_COMMENTS_IOS]: 'mweb_xpromo_interstitial_comments_ios',
  [VARIANT_XPROMO_INTERSTITIAL_COMMENTS_ANDROID]: 'mweb_xpromo_interstitial_comments_android',
  [VARIANT_MODAL_LISTING_CLICK_IOS]: 'mweb_xpromo_modal_listing_click_ios',
  [VARIANT_MODAL_LISTING_CLICK_ANDROID]: 'mweb_xpromo_modal_listing_click_android',
  [VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_IOS]: 'mweb_xpromo_interstitial_frequency_ios',
  [VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_ANDROID]: 'mweb_xpromo_interstitial_frequency_android',
  [VARIANT_XPROMO_PERSISTENT_IOS]: 'mweb_xpromo_persistent_ios',
  [VARIANT_XPROMO_PERSISTENT_ANDROID]: 'mweb_xpromo_persistent_android',
};

export function getRouteActionName(state) {
  const routeMeta = getRouteMetaFromState(state);
  const actionName = routeMeta && routeMeta.name;
  return actionName;
}

function isDayMode(state) {
  return DAYMODE === state.theme;
}

function activeXPromoExperimentName(state, flags=EXPERIMENT_FULL) {
  const featureContext = features.withContext({ state });
  const featureFlag = find(flags, feature => {
    return featureContext.enabled(feature);
  });
  return featureFlag ? EXPERIMENT_NAMES[featureFlag] : null;
}

export function xpromoTheme(state) {
  if (isXPromoPersistent(state)) {
    return PERSIST;
  }
  switch (getRouteActionName(state)) {
    case 'comments':
      return MINIMAL;
    default: 
      return USUAL;
  }
}

export function xpromoThemeIsUsual(state) {
  return xpromoTheme(state) === USUAL;
}
export function isXPromoFixedBottom(state) {
  const theme = xpromoTheme(state);
  return (theme === PERSIST || theme === MINIMAL);
}

function xpromoIsConfiguredOnPage(state) {
  const actionName = getRouteActionName(state);
  if (actionName === 'index' || actionName === 'listing') {
    return true;
  } else if (actionName === 'comments') {
    return commentsInterstitialEnabled(state);
  }

  return false;
}

export function isXPromoEnabledOnPages(state) {
  return isEligibleListingPage(state) || isEligibleCommentsPage(state);
}

export function isEligibleListingPage(state) {
  const actionName = getRouteActionName(state);
  return actionName === 'index'
    || (actionName === 'listing' && !isNSFWPage(state));
}

export function isEligibleCommentsPage(state) {
  const actionName = getRouteActionName(state);
  return actionName === 'comments' && isDayMode(state) && !isNSFWPage(state);
}

function isXPromoEnabledOnDevice(state) {
  const device = getDevice(state);
  // If we don't know what device we're on, then
  // we should not match any list
  // of allowed devices.
  return (!!device) && [ANDROID, IPHONE].includes(device);
}

function anyFlagEnabled(state, flags) {
  const featureContext = features.withContext({ state });
  return some(flags, feature => {
    return featureContext.enabled(feature);
  });
}

export function loginRequiredEnabled(state) {
  if (shouldShowXPromo(state)) {
    return anyFlagEnabled(state, LOGIN_REQUIRED_FLAGS);
  }
  return false;
}

export function commentsInterstitialEnabled(state) {
  if (shouldShowXPromo(state)) {
    return anyFlagEnabled(state, COMMENTS_PAGE_BANNER_FLAGS);
  }
  return false;
}

/**
 * @param {object} state - redux state
 * @param {string} postId - id of the post that was clicked on
 * @return {boolean} is this listing click eligible to be intercepted,
 * and redirected to the app store page for the reddit app
 */
export function listingClickEnabled(state, postId) {
  if (!isEligibleListingPage(state) || !isXPromoEnabledOnDevice(state)) {
    return false;
  }
  if (!state.user.loggedOut) {
    const userAccount = state.accounts[state.user.name];
    if (userAccount && (userAccount.isMod || userAccount.isGold)) {
      return false;
    }
  }

  const eventData = {
    interstitial_type: XPROMO_MODAL_LISTING_CLICK_NAME,
  };

  if (state.xpromo.listingClick.ineligibilityReason) {
    trackXPromoIneligibleEvent(state, eventData, state.xpromo.listingClick.ineligibilityReason);
    return;
  }

  if (!anyFlagEnabled(state, MODAL_LISTING_CLICK_FLAGS)) {
    return false;
  }

  if (!eligibleTimeForModalListingClick(state)) {
    trackXPromoIneligibleEvent(state, eventData, 'dismissed_previously');
    return false;
  }

  const post = state.posts[postId];
  if (post.promoted) {
    trackXPromoIneligibleEvent(state, eventData, 'promoted_post');
    return false;
  }

  return true;
}

/**
 * @func getExperimentDataByFlags
 *
 * Note: This should only be called when we know the user is eligible and buckted
 * for a listing click experiment group. Used to let `getXPromoExperimentPayload`
 * properly attribute experiment data
 *
 * @param {object} state - our applications redux state.
 * @param {array} FLAGS - list of experiments.
 *
 * Note: If FLAGS-param is empty -> current experiment data will be returned.
 *
 * @return {object}
 */
function getExperimentDataByFlags(state, FLAGS) {
  const experimentName = activeXPromoExperimentName(state, FLAGS);
  return getExperimentData(state, experimentName);
}

/**
 * @func xpromoModalListingClickVariantInfo
 * @param {object} state - our application's redux state
 *
 * @return {object} details of the experiment based on the variant name
 * @return {int} details.timeLimit - the length of time in epoch milliseconds
 *  to wait before showing the modal again
 * @return {bool} details.dimissable - true if the app store modal can be dimissed
 * NOTE: this function should not be called until we're sure the user is
 * eligible and bucketed in the experiment. It will throw or mis-fire bucketing
 * events otherwise
 */
export function xpromoModalListingClickVariantInfo(state) {
  const { variant } = getExperimentDataByFlags(state, MODAL_LISTING_CLICK_FLAGS);
  const [ timePeriodString, dimissableString ] = variant.split('_');

  return {
    timeLimit: EXPERIMENT_FREQUENCY_VARIANTS[timePeriodString === 'hourly' ? EVERY_HOUR : EVERY_DAY],
    dismissible: dimissableString === 'dismissible',
  };
}

/**
 * @func eligibleTimeForModalListingClick
 * @param {object} state - our applications redux state. Depends on
 *  - state.xpromo.listingClick.lastModalClick
 *  - state.accounts.me
 *
 * Note: This function is time senstiive, it's result will vary based on the
 * current time.
 *
 * @return {bool} Based only on time based eligibility, can we bucket the
 *   current user into one of the xpromo modal listing click experiments
 */
function eligibleTimeForModalListingClick(state) {
  const { lastModalClick } = state.xpromo.listingClick;
  if (lastModalClick === 0) {
    return true;
  }

  const { timeLimit } = xpromoModalListingClickVariantInfo(state);
  const ineligibleLimit = lastModalClick + timeLimit;
  return Date.now() > ineligibleLimit;
}

export function getExperimentRange(state) {
  // For frequency experiment
  const experimentName = activeXPromoExperimentName(state, INTERSTITIAL_FREQUENCY_FLAGS);
  const experimentData = getExperimentData(state, experimentName);
  if (experimentData) {
    return experimentData.variant;
  }
}

function populateExperimentPayload(experimentData) {
  let experimentPayload = {};
  if (experimentData) {
    const {experiment_name, variant } = experimentData;
    experimentPayload = { experiment_name, experiment_variant: variant };
  }
  return experimentPayload;
}

export function getXPromoExperimentPayload(state) {
  let experimentPayload = {};

  // If we're showing a listing_click, then we should using.
  if (state.xpromo.listingClick.active) {
    const experimentData = getExperimentDataByFlags(state, MODAL_LISTING_CLICK_FLAGS);
    experimentPayload = populateExperimentPayload(experimentData);
  } else if (isXPromoPersistent(state)) {
    // For persistent_banner interstitial we should exclude PERSISTENT FLAGS from
    // "Common rules" to DO NOT fire bucketing event right after the page has been
    // loaded (be cause this should happen after dismiss click by link).
    const experimentData = getExperimentDataByFlags(state, XPROMO_PERSISTENT_FLAGS);
    experimentPayload = populateExperimentPayload(experimentData);
  }
  // Common rules
  if (isPartOfXPromoExperiment(state) && getExperimentDataByFlags(state)) {
    const experimentData = getExperimentDataByFlags(state);
    experimentPayload = populateExperimentPayload(experimentData);
  }
  return experimentPayload;
}

export function scrollPastState(state) {
  return state.xpromo.interstitials.scrolledPast;
}
export function scrollStartState(state) {
  return state.xpromo.interstitials.scrolledStart;
}

export function dismissedState(state) {
  return state.xpromo.persistent.dismissed;
}
export function isXPromoPersistentActive(state) {
  return state.xpromo.persistent.active;
}
export function isXPromoPersistent(state) {
  return isInterstitialDimissed(state) &&
    anyFlagEnabled(state, XPROMO_PERSISTENT_FLAGS);
}
export function isXPromoBannerEnabled(state) {
  return anyFlagEnabled(state, [XPROMOBANNER]);
}
export function isXPromoAdLoadingEnabled(state) {
  return anyFlagEnabled(state, [AD_LOADING]);
}
function shouldShowXPromo(state) {
  return state.xpromo.interstitials.showBanner &&
    isXPromoBannerEnabled(state);
}
function isPartOfXPromoExperiment(state) {
  return shouldShowXPromo(state) && anyFlagEnabled(state, EXPERIMENT_FULL);
}
export function XPromoIsActive(state) {
  return shouldShowXPromo(state) && xpromoIsConfiguredOnPage(state);
}
