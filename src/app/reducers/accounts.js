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
            ...account.features,
            mweb_xpromo_modal_listing_click_ios: {
              owner: 'channels',
              experiment_id: 165,
              variant: 'hourly_systemPrompt',
            },
            mweb_xpromo_modal_listing_click_android: {
              owner: 'channels',
              experiment_id: 165,
              variant: 'hourly_systemPrompt',
            },
          },
        });
      });
      return mergeAPIModels(state, accounts);
    }

    default: return state;
  }
}
