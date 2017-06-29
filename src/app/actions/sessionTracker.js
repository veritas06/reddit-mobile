import { extractSessionId } from 'lib/getSessionIdFromCookie';

export const SET_SESSION_TRACKER = 'SESSION__SET_SESSION_TRACKER';

export const setSessionTracker = value => async (dispatch) => {
  const id = extractSessionId(value);
  dispatch({ type: SET_SESSION_TRACKER, id, value });
};
