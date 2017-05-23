import url from 'url';
import cookies from 'js-cookie';

import config from 'config';
import localStorageAvailable from './localStorageAvailable';
import {
  getBasePayload,
  buildSubredditData,
  xPromoExtraScreenViewData,
} from 'lib/eventUtils';

import {
  getXPromoExperimentPayload,
  isEligibleCommentsPage,
  isEligibleListingPage,
  loginRequiredEnabled,
  getExperimentRange,
  isXPromoPersistent,
} from 'app/selectors/xpromo';

import {
  LISTING_CLICK_TYPES,
  EXPERIMENT_FREQUENCY_VARIANTS as FREQUENCIES,
  EVERY_TWO_WEEKS,
  LOCAL_STORAGE_KEYS,
  XPROMO_MODAL_LISTING_CLICK_NAME,
  XPROMO_DISPLAY_THEMES,
} from 'app/constants';

const {
  USUAL,
  LOGIN,
  MINIMAL,
  PERSIST,
} = XPROMO_DISPLAY_THEMES;

const {
  BANNER_LAST_CLOSED,
  XPROMO_LAST_MODAL_CLICK,
} = LOCAL_STORAGE_KEYS;

// Get loid values either from the account state or the cookies.
function getLoidValues(accounts) {
  if (accounts.me) {
    return {
      loid: accounts.me.loid,
      loidCreated: accounts.me.loidCreated,
    };
  }

  const loid = cookies.get('loid');
  const loidCreated = cookies.get('loidcreated');

  return {
    loid,
    loidCreated,
  };
}

export function isXPromoPersistentEnabled(state) {
  return isXPromoPersistent(state);
}

export function getXPromoLinkforCurrentPage(state, linkType, additionalData={}) {
  const path = state.platform.currentPage.url;
  return getXPromoLink(state, path, linkType, additionalData);
}

export function getXPromoListingClickLink(state, postId, listingClickType) {
  const post = state.posts[postId];
  if (!post) {
    throw new Error(`XPromoListingClickLink called with invalid postId: ${postId}`);
  }

  const path = getXPromoListingClickPath(state, post, listingClickType);

  return getXPromoLink(state, path, XPROMO_MODAL_LISTING_CLICK_NAME, {
    listing_click_type: listingClickType,
  });
}

function getXPromoListingClickPath(state, post, listingClickType) {
  switch (listingClickType) {
    case LISTING_CLICK_TYPES.AUTHOR: {
      const { author } = post;
      // note: android has problems with /user/, so keep this as /u/
      return `/u/${author}`;
    }

    case LISTING_CLICK_TYPES.SUBREDDIT: {
      const { subreddit } = post;
      return `/r/${subreddit}`;
    }

    default: {
      // promoted posts don't have subreddits.....
      // and there permalink format isn't supported by the android app
      // instead of deep linking, we can just send them to the current listing page
      if (post.promoted) {
        const { subredditName } = state.platform.currentPage.urlParams;
        if (subredditName) {
          return `/r/${subredditName}`;
        }
        return '/';
      }
      return post.cleanPermalink;
    }
  }
}

function getXPromoLink(state, path, linkType, additionalData={}) {
  let payload = {
    utm_source: 'xpromo',
    utm_content: linkType,
    ...interstitialData(state),
    ...additionalData,
  };

  const experimentData = getXPromoExperimentPayload(state);
  if (experimentData && experimentData.experiment_name && experimentData.experiment_variant) {
    payload = {
      ...payload,
      utm_name: experimentData.experiment_name,
      utm_term: experimentData.experiment_variant,
      utm_medium: 'experiment',
    };
  } else {
    payload = {
      ...payload,
      utm_medium: 'interstitial',
    };
  }

  payload = {
    ...payload,
    ...xPromoExtraScreenViewData(state),
  };

  return getBranchLink(state, path, payload);
}

function getXpromoClosingTime(state, localStorageKey=BANNER_LAST_CLOSED) {
  if (localStorageAvailable()) {
    const lastClosedStr = localStorage.getItem(localStorageKey);
    return (lastClosedStr ? new Date(lastClosedStr).getTime() : 0);
  }
  return Infinity;
}

function getXpromoClosingRange(state, presetRange) {
  return FREQUENCIES[(presetRange || getExperimentRange(state) || EVERY_TWO_WEEKS)];
}

function getXpromoClosingLimit(state) {
  return getXpromoClosingTime(state)+getXpromoClosingRange(state);
}

export function isInterstitialDimissed(state) {
  const defaultRange = getXpromoClosingTime(state)+getXpromoClosingRange(state, EVERY_TWO_WEEKS);
  return (defaultRange > Date.now());
}

export function getBranchLink(state, path, payload={}) {
  const { user, accounts } = state;

  const { loid, loidCreated } = getLoidValues(accounts);

  let userName;
  let userId;

  const userAccount = user.loggedOut ? null : accounts[user.name];
  if (userAccount) {
    userName = userAccount.name;
    userId = userAccount.id;
  }

  const basePayload = {
    channel: 'mweb_branch',
    feature: 'xpromo',
    campaign: 'xpromo',
    // We can use this space to fill "tags" which will populate on the
    // branch dashboard and allow you sort/parse data. Optional/not required.
    // tags: [ 'tag1', 'tag2' ],
    // Pass in data you want to appear and pipe in the app,
    // including user token or anything else!
    // android deep links expect reddit/ prefixed urls
    '$og_redirect': `${config.reddit}${path}`,
    '$deeplink_path': path,
    '$android_deeplink_path': `reddit${path}`,
    mweb_loid: loid,
    mweb_loid_created: loidCreated,
    mweb_user_id36: userId,
    mweb_user_name: userName,
    ...getBasePayload(state),
    ...buildSubredditData(state),
  };


  return url.format({
    protocol: 'https',
    host: 'reddit.app.link',
    pathname: '/',
    query: {...basePayload, ...payload},
  });
}

/**
 * @TODO: These functions should refactored:
 * - shouldNotShowBanner
 * - shouldNotListingClick
 */
export function shouldNotShowBanner(state) {
  // Do not show the banner:
  // If localStorage is not available
  if (!localStorageAvailable()) {
    return 'local_storage_unavailable';
  }
  // Do not show the banner:
  // If closing date is in limit range still
  if (getXpromoClosingLimit(state) > Date.now()) {
    return 'dismissed_previously';
  }
  // Show the banner
  return false;
}

export function listingClickInitialState() {
  // Check if there's been a listing click in the last two weeks
  const lastClickedStr = localStorageAvailable() ? localStorage.getItem(XPROMO_LAST_MODAL_CLICK) : null;
  const lastModalClick = lastClickedStr ? new Date(lastClickedStr).getTime() : 0;
  const ineligibilityReason = localStorageAvailable() ? null : 'local_storage_unavailable';
  return {
    ineligibilityReason,
    lastModalClick,
  };
}

export function markBannerClosed() {
  if (!localStorageAvailable()) { return false; }

  // note that we dismissed the banner
  localStorage.setItem(BANNER_LAST_CLOSED, new Date());
}

export const markListingClickTimestampLocalStorage = (dateTime) => {
  if (!localStorageAvailable()) { return; }

  localStorage.setItem(XPROMO_LAST_MODAL_CLICK, dateTime);
};

export function interstitialType(state) {
  if (isEligibleListingPage(state)) {
    if (state.xpromo.listingClick.active) {
      return XPROMO_MODAL_LISTING_CLICK_NAME;
    } else if (isXPromoPersistentEnabled(state)) {
      return PERSIST;
    } else if (loginRequiredEnabled(state)) {
      return LOGIN;
    }
    return USUAL;
  } else if (isEligibleCommentsPage(state)) {
    return MINIMAL;
  }
}

export function interstitialData(state) {
  const baseData = {
    interstitial_type: interstitialType(state),
  };

  const { active, clickInfo } = state.xpromo.listingClick;
  if (active && !!clickInfo) {
    return {
      ...baseData,
      listing_click_type: clickInfo.listingClickType,
    };
  }

  return baseData;
}
