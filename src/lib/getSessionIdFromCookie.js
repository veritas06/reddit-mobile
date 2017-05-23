/*
 * Note: this Lib gets the session ID of the user from cookies (named
 * 'session_tracker'). For the client-side, 'js-cookie' will be used to
 * get this data, but for the server-side we need to pass the argument
 * 'ctxCookie', which receives the coookies data from:
 * Redux.store.{accountRequests}.{me}.{meta}.{set_cookies}.[...]
 */

import cookies from 'js-cookie';

const SESSION_COOKIE_KEY = 'session_tracker';

const parseServerSideCookies = (ctxCookie) => {
  if (ctxCookie && process.env.ENV === 'server') {
    const delimiter = ';';
    const cookieStr = [ctxCookie].join(delimiter);
    const getSession = new RegExp(`${SESSION_COOKIE_KEY}=(.+?;).*`, 'g');
    const sessionId = cookieStr.replace(getSession, '$1');
    const isSessionIdWasFound = new RegExp(delimiter).test(sessionId);
    return (isSessionIdWasFound ? sessionId : false);
  }
  return false;
};

export default (ctxCookie) => {
  const cookieStr = (
    cookies.get(SESSION_COOKIE_KEY) ||
    parseServerSideCookies(ctxCookie)
  );

  if (cookieStr) {
    const [sessionId] = cookieStr.split('.');
    return sessionId;
  }
  return null;
};
