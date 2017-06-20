import { BaseHandler, METHODS } from 'platform/router';
import * as platformActions from 'platform/actions';import ValidationError from 'apiClient/errors/ValidationError';
import Session from 'app/models/Session';
import * as sessionActions from 'app/actions/session';
import * as loginActions from 'app/actions/login';
import * as tfaActions from 'app/actions/twoFactorAuthentication';
import { loginInfo, loginForms } from 'app/constants';
import { getEventTracker } from 'lib/eventTracker';
import { getBasePayload, trackPageEvents } from 'lib/eventUtils';



export default class Login extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    trackPageEvents(getState());
  }

  async [METHODS.POST](dispatch, getState) {
    const { username, password, otp, redirectTo } = this.bodyParams;
    let successful = true;
    let errorCode = null;

    try {
      const state = getState();
      const loginForm = state.twoFactorAuthentication && state.twoFactorAuthentication.activeForm;
      const otpInRightForm = loginForm === loginForms.BACKUP_CODE ? 'B_' + otp : otp;

      const data = await Session.fromLogin(username, password, otpInRightForm);
      
      // if 2fa required and we did not create Session 
      if (data && data.details === loginInfo.TWO_FA_REQUIRED) {
        dispatch(tfaActions.openAppCodeForm());
        return;
      }

      dispatch(sessionActions.setSession(data.session));
      dispatch(loginActions.loggedIn());

      // This is awaited to guarantee the user is loaded for event logging
      await dispatch(platformActions.redirect(redirectTo));
    } catch (e) {
      successful = false;
      if (e instanceof ValidationError && e.errors && e.errors[0]) {
        errorCode = e.errors[0].error;
        dispatch(sessionActions.sessionError(errorCode));
      } else {
        throw e;
      }
    }

    logAttempt(this.bodyParams, successful, errorCode, getState());
  }
}

function logAttempt(data, successful, errorCode, state) {
  const payload = {
    ...getBasePayload(state),
    successful,
    user_name: data.username,
  };

  if (!successful && errorCode) {
    payload.process_notes = errorCode;
  }

  getEventTracker().track('login_events', 'cs.login_attempt', payload);
}
