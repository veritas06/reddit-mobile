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
            //   experiment_id: 1233,
            // },

            // mweb_xpromo_persistent_ios: {
            //   variant: 'treatment',
            //   owner: 'channels',
            //   experiment_id: 1234,
            // },
            // mweb_xpromo_modal_listing_click_ios: {
            //   variant: 'hourly_dismissible',
            //   owner: 'channels',
            //   experiment_id: 1235,
            // },

            // mweb_xpromo_interstitial_frequency_ios: {
            //   variant: 'every_day',
            //   owner: 'channels',
            //   experiment_id: 12345,
            // },
            // mweb_xpromo_interstitial_frequency_android: {
            //   variant: 'every_day',
            //   owner: 'channels',
            //   experiment_id: 12345,
            // },


            // mweb_xpromo_require_login_ios: {
            //   variant: 'login_required',
            //   owner: 'channels',
            //   experiment_id: 123456,
            // },
            // mweb_xpromo_require_login_android: {
            //   variant: 'login_required',
            //   owner: 'channels',
            //   experiment_id: 123456,
            // },

            mweb_xpromo_ad_loading: {
              variant: 'treatment',
              owner: 'channels',
              experiment_id: 1237,
            },

          },
        });
      });


      return mergeAPIModels(state, accounts);
    }

    default: return state;
  }
}
