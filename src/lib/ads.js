import { AD_LOCATION } from 'app/constants';

export const NO_ADS = 'no_ads';
export const PROMO_ADULT_NSFW = 'promo_adult_nsfw';
export const PROMO_SPECIFIED = 'promo_specified';
export const ALL_ADS = 'all_ads';

export const WHITELIST_STATUS = [
  NO_ADS,
  'house_only',
  PROMO_SPECIFIED,
  PROMO_ADULT_NSFW,
  'promo_adult',
  'promo_all',
  ALL_ADS,
];

export const canRequestAds = whitelistStatus =>
  whitelistStatus && whitelistStatus !== NO_ADS;

export const canRequestProgrammaticAds = whitelistStatus =>
  whitelistStatus && whitelistStatus === ALL_ADS;

const getMostRestictiveWhitelistStatus = (...statuses) => {
  // eslint-disable-next-line eqeqeq
  if (statuses.find(x => x == null)) {
    return null;
  }

  const index = Math.min(...statuses.map(s => WHITELIST_STATUS.indexOf(s)));

  return WHITELIST_STATUS[index];
};

const getAdLocation = ({ posts=[], test }, ...args) => {
  let location = null;
  for (let i = AD_LOCATION-1; i < posts.length; i++) {
    const currentPost = posts[i];
    const nextPost = posts[i+1];
    if (test(currentPost, ...args) &&
        (!nextPost || test(nextPost, ...args))) {
      location = i;
      break;
    }
  }

  // eslint-disable-next-line eqeqeq
  if (location == null) {
    return null;
  }

  return location + 1;
};

export const adLocationForProgrammatic = ({ posts=[] }) => {
  const canShowAdNextTo = (post) => {
    return post.whitelistStatus === ALL_ADS;
  };

  return getAdLocation({ posts, test: canShowAdNextTo });
};

export const adLocationForSubreddit = ({ posts=[], whitelistStatus }) => {
  const canShowAdNextTo = (post, whitelistStatus) => {
    // eslint-disable-next-line eqeqeq
    if (post.whitelistStatus == null || post.whitelistStatus === NO_ADS) {
      return false;
    }

    return post.whitelistStatus === whitelistStatus;
  };

  return getAdLocation({ posts, test: canShowAdNextTo }, whitelistStatus);
};

const DEFAULT_LISTING_DISALLOWED = new Set([
  NO_ADS,
  PROMO_ADULT_NSFW,
  PROMO_SPECIFIED,
]);

export const adLocationForDefaultListing = ({ posts=[] }) => {
  const canShowAdNextTo = post => {
    // eslint-disable-next-line eqeqeq
    return post.whitelistStatus && !DEFAULT_LISTING_DISALLOWED.has(post.whitelistStatus);
  };

  return getAdLocation({ posts, test: canShowAdNextTo });
};

export const whitelistStatusForDefaultListing = ({ posts=[], index }) => {
  // eslint-disable-next-line eqeqeq
  if (index == null) {
    return;
  }

  const postBefore = posts[index - 1];
  // `posts` doesn't contain any ads, so the postAfter the ad
  // has the same index the ad *will* have.
  const postAfter = posts[index];
  const whitelistStatus = getMostRestictiveWhitelistStatus(
    postBefore.whitelistStatus,
    postAfter.whitelistStatus,
  );

  if (DEFAULT_LISTING_DISALLOWED.has(whitelistStatus)) {
    return NO_ADS;
  }

  return whitelistStatus;
};

