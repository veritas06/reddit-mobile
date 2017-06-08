export const AD_LOCATION = 11;

export const GTM_JAIL_ID = 'gtm-jail';

export const ADBLOCK_TEST_ID = 'adblock-test';

export const TOGGLE_OVER_18 = 'toggleOver18';

export const USER_MENU_TOGGLE = 'sideNavToggle';

export const COMMUNITY_MENU_TOGGLE = 'community`MenuToggle';

export const TOP_NAV_HAMBURGER_CLICK = 'topNavHamburgerClick';

export const TOP_NAV_COMMUNITY_CLICK = 'topNavCommunityClick';

export const USER_DATA_CHANGED = 'userDataChanged';

export const VOTE = 'vote';

export const OVERLAY_MENU_OPEN = 'overlayMenuOpen';

export const OVERLAY_MENU_OFFSET = -10; // from cs;

export const OVERLAY_MENU_VISIBLE_CSS_CLASS = 'OverlayMenu-visible';

export const DROPDOWN_CSS_CLASS = 'Dropdown';

export const DROPDOWN_OPEN = 'dropdownOpen';

export const COMPACT_TOGGLE = 'compactToggle';

export const THEME_TOGGLE = 'themeToggle';

export const TOP_NAV_HEIGHT = 45;

export const RESIZE = 'resize';

export const SCROLL = 'scroll';

export const ICON_SHRUNK_SIZE = 16;

export const CACHEABLE_COOKIES = ['compact'];

export const DEFAULT_API_TIMEOUT = 10000;

export const HIDE_GLOBAL_MESSAGE = 'hideGlobalMessage';


export const EU_COOKIE_HIDE_AFTER_VIEWS = 3;

export const NEW_INFOBAR_MESSAGE = 'newInfoBarMessage';

export const messageTypes = {
  GLOBAL: 'global',
  EU_COOKIE: 'euCookie',
};

export const DEFAULT_KEY_COLOR = '#336699';

export const SET_META_COLOR = 'setMetaColor';

export const VISITED_POSTS_COUNT = 20;

export const RECENT_CLICKS_LENGTH = 5;

export const XPROMO_MODAL_LISTING_CLICK_NAME = 'modal_listing_click_retry';

/*
 * OptOut flags
 * Structure:
 *  1) STORE_KEY { String } (required) — LocakStorage key name
 *  2) URL_FLAG { String } (optional) — URL flag name (as URL flag, accept: [empty]/true/false)
 *    (ex: URL_FLAG : 'no_xpromo_interstitial')
 *    (OptOut is ON): http://../?no_xpromo_interstitial
 *    (OptOut is ON): http://../?no_xpromo_interstitial=true
 *    (OptOut is OFF): http://../no_xpromo_interstitial=false
 */
export const OPT_OUT_XPROMO_INTERSTITIAL = {
  STORE_KEY : 'xpromoInterstitial',
  URL_FLAG  : 'no_xpromo_interstitial',
};
export const OPT_OUT_XPROMO_INTERSTITIAL_MENU = {
  STORE_KEY : 'xpromoInterstitialMenu',
  URL_FLAG  : 'no_xpromo_interstitial_menu',
};
export const OPT_OUT_FLAGS = [
  /* COMMENT any flag here to turn it OFF */
  OPT_OUT_XPROMO_INTERSTITIAL,
  OPT_OUT_XPROMO_INTERSTITIAL_MENU,
];

/**
 * Listing clicks have a target type,
 * i.e. if you click on the username, the deeplink goes to the user profile,
 * and the target type is 'user'
 */
export const LISTING_CLICK_TYPES = {
  AUTHOR: 'author',
  COMMENTS_LINK: 'comments_link',
  CONTENT: 'content',
  DOMAIN_LINK: 'domain_link',
  FOOTER: 'footer',
  FOOTER_DROPDOWN: 'footer_dropdown',
  MOD_SHIELD: 'mod_shield', // we should never block mod actions,
  // if we see this in anayltics it indicates a bug with our implementation
  OTHER: 'other',
  SUBREDDIT: 'subreddit',
  THUMBNAIL: 'thumbnail',
  TITLE: 'title',
  VOTE_CONTROLS: 'vote_controls',
};

// Post content

export const POST_COMPACT_THUMBNAIL_WIDTH = 70;

export const POST_DEFAULT_WIDTH = 320;

export const BANNER_URLS_DIRECT = {
  IOS: 'https://itunes.apple.com/us/app/reddit-the-official-app/id1064216828',
  ANDROID: 'https://play.google.com/store/apps/details?id=com.reddit.frontpage',
};

// feature flags
export const flags = {
  BETA: 'beta',
  XPROMOBANNER: 'banner',
  USE_BRANCH: 'useBranch',
  VARIANT_NEXTCONTENT_BOTTOM: 'experimentNextContentBottom',
  VARIANT_RECOMMENDED_BOTTOM: 'experimentRecommendedBottom',
  VARIANT_RECOMMENDED_TOP: 'experimentRecommendedTop',
  VARIANT_RECOMMENDED_TOP_PLAIN: 'experimentRecommendedTopPlain',
  VARIANT_RECOMMENDED_BY_POST: 'experimentRecommendedByPost',
  VARIANT_RECOMMENDED_BY_POST_TOP_ALL: 'experimentRecommendedByPostTopAll',
  VARIANT_RECOMMENDED_BY_POST_TOP_DAY: 'experimentRecommendedByPostTopDay',
  VARIANT_RECOMMENDED_BY_POST_TOP_MONTH: 'experimentRecommendedByPostTopMonth',
  VARIANT_RECOMMENDED_BY_POST_HOT: 'experimentRecommendedByPostHot',
  VARIANT_RECOMMENDED_SIMILAR_POSTS: 'experimentRecommendedSimilarPosts',
  VARIANT_SUBREDDIT_HEADER: 'experimentSubredditHeader',
  VARIANT_TITLE_EXPANDO: 'experimentTitleExpando',
  VARIANT_MIXED_VIEW: 'experimentMixedView',
  SHOW_AMP_LINK: 'showAmpLink',

  // Removing defaults experiment
  VARIANT_DEFAULT_SRS_TUTORIAL: 'experimentDefaultSrsTutorial',
  VARIANT_DEFAULT_SRS_POPULAR: 'experimentDefaultSrsPopular',

  // RULES
  RULES_MODAL_ON_COMMENT_CLICK_ANYWHERE: 'rulesModalOnCommentClickAnywhere',
  RULES_MODAL_ON_COMMENT_CLICK_BUTTON: 'rulesModalOnCommentClickButton',
  RULES_MODAL_ON_SUBMIT_CLICK_ANYWHERE: 'rulesModalOnSubmitClickAnywhere',
  RULES_MODAL_ON_SUBMIT_CLICK_BUTTON: 'rulesModalOnSubmitClickButton',

  // XPromo Login Required
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS: 'experimentXPromoLoginRequiredIOS',
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID: 'experimentXPromoLoginRequiredAndroid',
  VARIANT_XPROMO_LOGIN_REQUIRED_IOS_CONTROL: 'experimentXPromoLoginRequiredIOSControl',
  VARIANT_XPROMO_LOGIN_REQUIRED_ANDROID_CONTROL: 'experimentXPromoLoginRequiredAndroidControl',

  // XPromo Comments Interstitial
  VARIANT_XPROMO_INTERSTITIAL_COMMENTS_IOS: 'experimentXPromoInterstitialCommentsIos',
  VARIANT_XPROMO_INTERSTITIAL_COMMENTS_ANDROID: 'experimentXPromoInterstitialCommentsAndroid',

  // XPromo Modal Listing Click
  VARIANT_MODAL_LISTING_CLICK_IOS: 'experimentXPromoModalListingClickRetryIOS',
  VARIANT_MODAL_LISTING_CLICK_ANDROID: 'experimentXPromoModalListingClickRetryAndroid',

  // XPromo Interstitial Frequrency
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_IOS: 'experimentXPromoInterstitialFrequencyIos',
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_ANDROID: 'experimentXPromoInterstitialFrequencyAndroid',
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_IOS_CONTROL: 'experimentXPromoInterstitialFrequencyIosControl',
  VARIANT_XPROMO_INTERSTITIAL_FREQUENCY_ANDROID_CONTROL: 'experimentXPromoInterstitialFrequencyAndroidControl',

  // XPromo Persistent Banner
  VARIANT_XPROMO_PERSISTENT_IOS: 'experimentXPromoPersistentIos',
  VARIANT_XPROMO_PERSISTENT_ANDROID: 'experimentXPromoPersistentAndroid',

  // XPromo Ad loading (preloader and Mobile App redirect button)
  // Note: client and server side rendering
  VARIANT_XPROMO_AD_LOADING_IOS: 'experimentXPromoAdLoadingIos',
  VARIANT_XPROMO_AD_LOADING_ANDROID: 'experimentXPromoAdLoadingAndroid',

  // XPromo Ad Feed inside the Listing pages
  VARIANT_XPROMO_AD_FEED_IOS: 'experimentXPromoAdFeedIos',
  VARIANT_XPROMO_AD_FEED_ANDROID: 'experimentXPromoAdFeedAndroid',
};

// Now we have 2 different types of XPromo
// 1) interstitial banners (USUAL, MINIMAL, PERSIST...)
// 2) main and comments ad loader (main, comments)
export const XPROMO_TYPES = {
  INTERSTITIAL: 'interstitial',         // All interstitials banners
  ADLOADING: 'ad_loading',              // App button inside the preloader
  ADFEED: 'ad_feed',
};

export const XPROMO_AD_FEED_TYPES = {
  TOP_BIG: 'ad_feed_big_top_banner',
  LISTING_BIG: 'ad_feed_big_feed_banner',
  LISTING_SMALL: 'ad_feed_small_feed_banner',
};

export const XPROMO_ADLOADING_TYPES = {
  MAIN: 'ad_loading_main',
  COMMENTS: 'ad_loading_comment',
};

export const XPROMO_DISPLAY_THEMES = {
  USUAL: 'transparent',                 // Banner with transparency and subtext
  LOGIN: 'require_login',               // ...same as USUAL but with login link instead of subtext
  MINIMAL: 'black_banner_fixed_bottom', // Black banner in the fixed bottom position and dismiss link
  PERSIST: 'persistent_banner',         // ...same as MINIMAL but without dismiss link
  ADLOADING: 'ad_loading',
  ADFEED: 'ad_feed',
};

export const COLOR_SCHEME = {
  NIGHTMODE: 'nightmode',
  DAYMODE: 'daymode',
};

export const LOGGEDOUT_REDIRECT = '/register';

export const loginErrors = {
  WRONG_PASSWORD: 'WRONG_PASSWORD',
  BAD_USERNAME: 'BAD_USERNAME',
  INCORRECT_USERNAME_PASSWORD: 'INCORRECT_USERNAME_PASSWORD',
};

export const genericErrors = {
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export const EVERY_HOUR = 'every_hour';
export const EVERY_DAY = 'every_day';
export const EVERY_THREE_DAYS = 'every_three_days';
export const EVERY_WEEK = 'every_week';
export const EVERY_TWO_WEEKS = 'every_two_weeks';

const HOUR_IN_MS = 60 * 60 * 1000;

export const EXPERIMENT_FREQUENCY_VARIANTS = {
  [EVERY_HOUR]: HOUR_IN_MS,
  [EVERY_DAY]: 24 * HOUR_IN_MS,
  [EVERY_THREE_DAYS]: 3 * 24 * HOUR_IN_MS,
  [EVERY_WEEK]: 1 * 7 * 24 * HOUR_IN_MS,
  [EVERY_TWO_WEEKS]: 2 * 7 * 24 * HOUR_IN_MS,
};

export const LOCAL_STORAGE_KEYS = {
  BANNER_LAST_CLOSED : 'bannerLastClosed',
  XPROMO_LAST_MODAL_CLICK: 'lastModalListingClick',
  BANNER_PERSIST_SHOWED : 'lastPersistBannerShowed',
};
