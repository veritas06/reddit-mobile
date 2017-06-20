import merge from 'platform/merge';
import * as loginActions from 'app/actions/login';
import * as platformActions from 'platform/actions';
import * as tfaActions from 'app/actions/twoFactorAuthentication';
import { loginForms } from 'app/constants';

export const DEFAULT = {
  activeForm: loginForms.AUTH,
};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case tfaActions.OPEN_APP_CODE_FORM: {
      return merge(state, {
        activeForm: loginForms.APP_CODE,
      });
    }
    case tfaActions.OPEN_BACKUP_CODE_FORM: {
      return merge(state, {
        activeForm: loginForms.BACKUP_CODE,
      });
    }
    case tfaActions.OPEN_AUTH_FORM: {
      return merge(state, {
        activeForm: loginForms.AUTH,
      });
    }
    case loginActions.LOGGED_IN: {
      return merge(state, DEFAULT);
    }
    case platformActions.GOTO_PAGE_INDEX: {
      return merge(state, DEFAULT);
    }
    default: return state;
  }
}
