const ONE_HOUR_IN_MS = 1000 * 60 * 60;
const FRONTPAGE_WHITELIST_STATUS = 'all_ads';

const createBannerProperties = (placement, user, subreddit, theme, compact) => {
  const properties = {};
  let age;

  if (!user.isLoggedOut) {
    // TODO: add just one property, `age`, which represents the diff between
    // the user's created date and now.
  } else if (user.loid.loidCreated) { // might not have an loid if bot
    const loidCreatedDate = (new Date(user.loid.loidCreated)).getTime();
    const now = (new Date()).getTime();
    age = now - loidCreatedDate;
  }

  if (age) {
    properties.age_hours = Math.floor(age / ONE_HOUR_IN_MS);
  }

  properties.subreddit_screen = !!subreddit;
  properties.logged_in = !user.isLoggedOut;
  // use both `percentage` and `random_number` for backwards compatibility
  properties.percentage = properties.random_number = Math.floor(Math.random() * 100);
  properties.placement = placement;
  properties.full_url = window && window.location && window.location.href;

  properties.nsfw = subreddit && subreddit.over18;


  if (subreddit) {
    properties.subreddit = subreddit.name;
    properties.whitelist_status = subreddit.whitelistStatus;
  } else {
    // TODO: re-evaluate this. Probably want it to always come from the api.
    properties.whitelist_status = FRONTPAGE_WHITELIST_STATUS;
  }

  properties.theme = theme;
  properties.compact = compact;

  return properties;
};

export default createBannerProperties;
