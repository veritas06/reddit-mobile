import get from 'lodash/get';
import pick from 'lodash/pick';
import setCookieParser from 'set-cookie-parser';
import * as accountActions from 'app/actions/accounts';
import * as sessionTrackerActions from 'app/actions/sessionTracker';
import {
  SESSION_TRACKER,
  extractSessionId,
} from 'lib/getSessionIdFromCookie';

const DEFAULT = {
  id: undefined,
  value: undefined,
};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case sessionTrackerActions.SET_SESSION_TRACKER: {
      const { id, value } = action;
      if (id) {
        return { id, value };
      }
      return DEFAULT;
    }

    // UserActions.fetchMyUser(), after which we get this RECEIVED_ACCOUNT,
    // is actually called almost each time the user navigates the site. In
    // case the server sent set-cookie headers, we need to update the session_tracker
    // so this ensures the api receives the most up-to-date value.
    case accountActions.RECEIVED_ACCOUNT: {
      const cookieHeadersPath = ['apiResponse','meta','set-cookie'];
      const setCookieHeaders = get(action, cookieHeadersPath, []);
      let sessionTrackerState = pick(state, ['id', 'value']); // prev. value

      if (setCookieHeaders.length) {
        setCookieHeaders.forEach(setCookieHeader => {
          const { name, value } = setCookieParser.parse(setCookieHeader)[0];
          if (name === SESSION_TRACKER) {
            const id = extractSessionId(value);
            sessionTrackerState = { id, value };
          }
        });
      }
      return sessionTrackerState;
    }
    default: return state;
  }
}
