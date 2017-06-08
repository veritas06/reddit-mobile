import mergeAPIModels from './helpers/mergeAPIModels';
import * as loginActions from 'app/actions/login';
import * as accountActions from 'app/actions/accounts';

const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case accountActions.RECEIVED_ACCOUNT: {
      const { accounts } = action.apiResponse;

      Object.keys(accounts).forEach(accountName => {
        const account = accounts[accountName];
        accounts[accountName] = account.set({
          features: {
            ...(account.features || {}),

            // mweb_xpromo_interstitial_comments_ios: {
            //   variant: 'treatment',
            //   owner: 'channels',
            //   experiment_id: 1000,
            // },

            // mweb_xpromo_persistent_ios: {
            //   variant: 'treatment',
            //   owner: 'channels',
            //   experiment_id: 1001,
            // },
            // mweb_xpromo_modal_listing_click_ios: {
            //   variant: 'hourly_dismissible',
            //   owner: 'channels',
            //   experiment_id: 1002,
            // },

            // mweb_xpromo_interstitial_frequency_ios: {
            //   variant: 'every_day',
            //   owner: 'channels',
            //   experiment_id: 1003,
            // },
            // mweb_xpromo_interstitial_frequency_android: {
            //   variant: 'every_day',
            //   owner: 'channels',
            //   experiment_id: 1004,
            // },


            // mweb_xpromo_require_login_ios: {
            //   variant: 'login_required',
            //   owner: 'channels',
            //   experiment_id: 1005,
            // },
            // mweb_xpromo_require_login_android: {
            //   variant: 'login_required',
            //   owner: 'channels',
            //   experiment_id: 1006,
            // },

            // mweb_xpromo_ad_loading_ios: {
            //   variant: 'treatment',
            //   owner: 'channels',
            //   experiment_id: 1007,
            // },

            // mweb_xpromo_modal_listing_click_retry_ios: {
            //   variant: 'hourly_dismissible',
            //   owner: 'channels',
            //   experiment_id: 1008,
            // },

            // mweb_xpromo_ad_feed_ios: { variant: 'ad_feed_big_top_banner', owner: 'channels', experiment_id: 1009 },
            // mweb_xpromo_ad_feed_ios: { variant: 'ad_feed_big_feed_banner', owner: 'channels', experiment_id: 1009 },
            mweb_xpromo_ad_feed_ios: { variant: 'ad_feed_small_feed_banner', owner: 'channels', experiment_id: 1009 },
          },
        });
      });

      return mergeAPIModels(state, accounts);
    }

    default: return state;
  }
}
