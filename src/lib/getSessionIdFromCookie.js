/*
 * Note: this Lib gets the session ID of the user from cookies (named
 * 'session_tracker'). For the client-side, 'js-cookie' will be used to
 * get this data, but for the server-side we need to pass the argument
 * 'ctxCookie', which receives the coookies data from:
 * Redux.store.{accountRequests}.{me}.{meta}.{set_cookies}.[...]
 */

import cookies from 'js-cookie';

export const SESSION_TRACKER = 'session_tracker';

export const parseServerSideCookies = (ctxCookie) => {
  if (Array.isArray(ctxCookie) && process.env.ENV === 'server') {
    const ctxCookieStr = ctxCookie.join();
    const regexp = new RegExp(`${SESSION_TRACKER}=(.+?);`, 'g');
    const result = regexp.exec(ctxCookieStr);
    if (result) {
      return result[1];
    }
  }
};

export const extractSessionId = (cookieStr) => {
  if (cookieStr) {
    const [sessionId] = cookieStr.split('.');
    return sessionId;
  }
};

export default (ctxCookie) => {
  const sessionTrackerStr = (
    cookies.get(SESSION_TRACKER) ||
    parseServerSideCookies(ctxCookie)
  );
  return (extractSessionId(sessionTrackerStr) || null);
};
