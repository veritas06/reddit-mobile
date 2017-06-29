import get from 'lodash/get';
import setCookieParser from 'set-cookie-parser';

import * as userActions from 'app/actions/user';
import * as loidActions from 'app/actions/loid';
import * as sessionTrackerActions from 'app/actions/sessionTracker';
import { permanentRootCookieOptions } from './permanentRootCookieOptions';

export const dispatchInitialUser = async (ctx, dispatch, getState) => {
  // The lack of camel casing on the 'loidcreated' cookie name is intentional.
  const loidCookie = ctx.cookies.get('loid');
  const loidCreatedCookie = ctx.cookies.get('loidcreated');
  const edgeBucket = ctx.cookies.get('edgebucket');
  const sessionTracker = ctx.cookies.get('session_tracker');

  if (loidCookie && loidCookie.includes('.')) {
    // If there's a `.`, we have the new format of loids,
    // we ignore the loid created cookie and use whatever is in the loid payload
    const [loid, /* version */, loidCreated] = loidCookie.split('.');
    dispatch(loidActions.setLOID({
      loid,
      loidCookie,
      loidCreated,
      loidCreatedCookie,
    }));
  } else {
    dispatch(loidActions.setLOID({
      loid: loidCookie,
      loidCookie,
      loidCreated: loidCreatedCookie,
      loidCreatedCookie,
    }));
  }

  if (edgeBucket) {
    dispatch(loidActions.setEdgeBucket({
      edgeBucket,
    }));
  }

  // Before running the user account request, the sessionTracker state must
  // be updated from the cookie. This state is used to set the session_tracker
  // request header and prevent generation of a new session_tracker cookie value.
  if (sessionTracker) {
    dispatch(sessionTrackerActions.setSessionTracker(sessionTracker));
  }

  // FetchMyUser pulls in the loid and loidCreated fields
  await dispatch(userActions.fetchMyUser());

  const state = getState();

  // First, ensure that the account request succeeded.
  // If the request didn't succeed, we don't have any new information
  // to update cookies with
  if (!state.accountRequests.me || state.accountRequests.me.failed) {
    return;
  }

  // If there were set-cookie headers on the account request, set them
  const options = permanentRootCookieOptions(ctx);
  const setCookiePath = ['accountRequests','me','meta', 'set-cookie'];
  const setCookieHeaders = get(state, setCookiePath, []);

  setCookieHeaders.forEach(setCookieHeader => {
    const { name, value } = setCookieParser.parse(setCookieHeader)[0];
    ctx.cookies.set(name, value, options);
  });
};
