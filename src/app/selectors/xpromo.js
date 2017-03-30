import { find, some } from 'lodash';

import {
  EXPERIMENT_FREQUENCY_VARIANTS,
  EVERY_HOUR,
  EVERY_DAY,
  flags as flagConstants,
  themes,
  xpromoDisplayTheme,
  XPROMO_MODAL_LISTING_CLICK_NAME,
} from 'app/constants';

import features, { isNSFWPage } from 'app/featureFlags';
import getRouteMetaFromState from 'lib/getRouteMetaFromState';
import { getExperimentData } from 'lib/experiments';
import { getDevice, IPHONE, ANDROID } from 'lib/getDeviceFromState';

import { trackXPromoIneligibleEvent } from 'lib/eventUtils';

const { DAYMODE } = themes;
const { USUAL, MINIMAL } = xpromoDisplayTheme;

const {
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
} = flagConstants;

const EXPERIMENT_FULL = [
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS,
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID,
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS_CONTROL,
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID_CONTROL,
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_IOS,
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_ANDROID,
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

export function xpromoIsConfiguredOnPage(state) {
  const actionName = getRouteActionName(state);
  if (actionName === 'index' || actionName === 'listing') {
    return true;
  } else if (actionName === 'comments') {
    return commentsInterstitialEnabled(state);
  }

  return false;
}

// @TODO: this should be controlled
// by FeatureFlags.js config only
export function xpromoIsEnabledOnPage(state) {
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

export function xpromoIsEnabledOnDevice(state) {
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
  if (!(shouldShowXPromo(state) && state.user.loggedOut)) {
    return false;
  }
  return anyFlagEnabled(state, LOGIN_REQUIRED_FLAGS);
}

export function commentsInterstitialEnabled(state) {
  if (!shouldShowXPromo(state)) {
    return false;
  }

  return anyFlagEnabled(state, COMMENTS_PAGE_BANNER_FLAGS);
}

/**
 * @param {object} state - redux state
 * @param {string} postId - id of the post that was clicked on
 * @return {boolean} is this listing click eligible to be intercepted,
 * and redirected to the app store page for the reddit app
 */
export function listingClickEnabled(state, postId) {
  if (!isEligibleListingPage(state) || !xpromoIsEnabledOnDevice(state)) {
    return false;
  }
  if (!state.user.loggedOut) {
    const userAccount = state.accounts[state.user.name];
    if (userAccount && userAccount.isMod) {
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
 * This should only be called when we know the user is eligible and buckted
 * for a listing click experiment group. Used to let `getXPromoExperimentPayload`
 * properly attribute experiment data
 */
export function listingClickExperimentData(state) {
  const experimentName = activeXPromoExperimentName(state, MODAL_LISTING_CLICK_FLAGS);
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
  const { variant} = listingClickExperimentData(state);
  const [ timePeriodString, dimissableString ] = variant.split('_');

  return {
    timeLimit: EXPERIMENT_FREQUENCY_VARIANTS[timePeriodString === 'hourly' ? EVERY_HOUR : EVERY_DAY],
    dismissable: dimissableString === 'dismissable',
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
export function eligibleTimeForModalListingClick(state) {
  const { lastModalClick } = state.xpromo.listingClick;
  if (lastModalClick === 0) {
    return true;
  }

  const { timeLimit } = xpromoModalListingClickVariantInfo(state);
  const ineligibleLimit = lastModalClick + timeLimit;
  return Date.now() > ineligibleLimit;
}

/**
 * @TODO: These functions should refactored:
 * - listingClickExperimentData
 * - getFrequencyExperimentData
 * - currentExperimentData
 */
export function getFrequencyExperimentData(state) {
  const experimentName = activeXPromoExperimentName(state, INTERSTITIAL_FREQUENCY_FLAGS);
  return getExperimentData(state, experimentName);
}

export function currentExperimentData(state) {
  const experimentName = activeXPromoExperimentName(state);
  return getExperimentData(state, experimentName);
}

export function scrollPastState(state) {
  return state.xpromo.interstitials.scrolledPast;
}

export function scrollStartState(state) {
  return state.xpromo.interstitials.scrolledStart;
}

export function shouldShowXPromo(state) {
  return state.xpromo.interstitials.showBanner &&
    xpromoIsEnabledOnPage(state) &&
    xpromoIsEnabledOnDevice(state);
}

export function isPartOfXPromoExperiment(state) {
  return shouldShowXPromo(state) && !!activeXPromoExperimentName(state);
}

export function XPromoIsActive(state) {
  return shouldShowXPromo(state) && xpromoIsConfiguredOnPage(state);
}
