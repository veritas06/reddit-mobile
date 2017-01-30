import { endpoints, collections, errors } from '@r/api-client';
const { Modtools } = endpoints;
const { ModeratingSubreddits } = collections;
const { ResponseError } = errors;

import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import modelFromThingId from 'app/reducers/helpers/modelFromThingId';

export const MODTOOLS_REMOVAL_PENDING = 'MODTOOLS_REMOVAL_PENDING';
export const MODTOOLS_REMOVAL_ERROR = 'MODTOOLS_REMOVAL_ERROR';
export const MODTOOLS_REMOVAL_SUCCESS = 'MODTOOLS_REMOVAL_SUCCESS';
export const MODTOOLS_APPROVAL_PENDING = 'MODTOOLS_APPROVAL_PENDING';
export const MODTOOLS_APPROVAL_ERROR = 'MODTOOLS_APPROVAL_ERROR';
export const MODTOOLS_APPROVAL_SUCCESS = 'MODTOOLS_APPROVAL_SUCCESS';
export const MODTOOLS_DISTINGUISH_SUCCESS = 'MODTOOLS_DISTINGUISH_SUCCESS';
export const MODTOOLS_DISTINGUISH_ERROR = 'MODTOOLS_DISTINGUISH_ERROR';
export const MODTOOLS_TOGGLE_LOCK_SUCCESS = 'MODTOOLS_TOGGLE_LOCK_SUCCESS';
export const MODTOOLS_TOGGLE_LOCK_FAILURE = 'MODTOOLS_TOGGLE_LOCK_FAILURE';
export const MODTOOLS_TOGGLE_NSFW_SUCCESS = 'MODTOOLS_TOGGLE_NSFW_SUCCESS';
export const MODTOOLS_TOGGLE_NSFW_FAILURE = 'MODTOOLS_TOGGLE_NSFW_FAILURE';
export const MODTOOLS_TOGGLE_SPOILER_SUCCESS = 'MODTOOLS_TOGGLE_SPOILER_SUCCESS';
export const MODTOOLS_TOGGLE_SPOILER_FAILURE = 'MODTOOLS_TOGGLE_SPOILER_FAILURE';
export const FETCHING_MODERATING_SUBREDDITS = 'FETCHING_MODERATING_SUBREDDITS';
export const RECEIVED_MODERATING_SUBREDDITS = 'RECEIVED_MODERATING_SUBREDDITS';
export const FETCH_FAILED_MODERATING_SUBREDDITS = 'FETCH_FAILED_MODERATING_SUBREDDITS';

export const removalPending = spam => ({
  type: MODTOOLS_REMOVAL_PENDING,
  spam: spam,
});

export const removalError = spam => ({
  type: MODTOOLS_REMOVAL_ERROR,
  spam: spam,
});

export const removalSuccess = (spam, thing, username) => ({
  type: MODTOOLS_REMOVAL_SUCCESS,
  spam,
  thing,
  username,
});

export const approvalPending = () => ({
  type: MODTOOLS_APPROVAL_PENDING,
});

export const approvalError = () => ({
  type: MODTOOLS_APPROVAL_ERROR,
});

export const approvalSuccess = (thing, username) => ({
  type: MODTOOLS_APPROVAL_SUCCESS,
  thing,
  username,
});

export const distinguishError = error => ({
  type: MODTOOLS_DISTINGUISH_ERROR,
  error,
  message: 'You can not distinguish that.',
});

export const distinguishSuccess = (thing, distinguishType) => ({
  type: MODTOOLS_DISTINGUISH_SUCCESS,
  thing,
  distinguishType,
});

export const toggleLockSuccess = thing => ({
  type: MODTOOLS_TOGGLE_LOCK_SUCCESS,
  thing,
});

export const toggleLockFailure = error => ({
  type: MODTOOLS_TOGGLE_LOCK_FAILURE,
  error,
  message: 'Sorry, something went wrong when toggling the lock action.',
});

export const toggleNSFWSuccess = (thing, newNSFWState) => ({
  type: MODTOOLS_TOGGLE_NSFW_SUCCESS,
  thing,
});

export const toggleNSFWFailure = error => ({
  type: MODTOOLS_TOGGLE_NSFW_FAILURE,
  error,
  message: 'Sorry, something went wrong when marking the post NSFW.',
})

export const fetchingSubs = () => ({
  type: FETCHING_MODERATING_SUBREDDITS,
});

export const receivedSubs = apiResponse => ({
  type: RECEIVED_MODERATING_SUBREDDITS,
  apiResponse,
});

export const fetchSubsFailed = error => ({
  type: FETCH_FAILED_MODERATING_SUBREDDITS,
  error,
});

export const toggleSpoilerSuccess = thing => ({
  type: MODTOOLS_TOGGLE_SPOILER_SUCCESS,
  thing,
});

export const toggleSpoilerFailure = error => ({
  type: MODTOOLS_TOGGLE_SPOILER_FAILURE,
  error,
  message: 'Sorry, something went wrong when trying to spoiler/unspoiler the post.',
});

export const remove = (id, spam) => async (dispatch, getState) => {
  const state = getState();
  const apiOptions = apiOptionsFromState(state);
  const model = modelFromThingId(id, state);
  const username = state.user.name;

  dispatch(removalPending(spam));

  try {
    await Modtools.remove(apiOptions, id, spam);
    dispatch(removalSuccess(spam, model, username));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(removalError(e));
    } else {
      throw e;
    }
  }
};

export const approve = id => async (dispatch, getState) => {
  const state = getState();
  const apiOptions = apiOptionsFromState(state);
  const model = modelFromThingId(id, state);
  const username = state.user.name;

  dispatch(approvalPending());

  try {
    await Modtools.approve(apiOptions, id);
    dispatch(approvalSuccess(model, username));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(approvalError(e));
    } else {
      throw e;
    }
  }
};

export const distinguish = (id, distinguishType) => async (dispatch, getState) => {
  const state = getState();
  const apiOptions = apiOptionsFromState(state);
  const model = modelFromThingId(id, state);

  try {
    await Modtools.distinguish(apiOptions, id, distinguishType);
    dispatch(distinguishSuccess(model, distinguishType));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(distinguishError(e));
    } else {
      throw e;
    }
  }
};

export const toggleLock = id => async (dispatch, getState) => {
  const state = getState();
  const apiOptions = apiOptionsFromState(state);
  const model = modelFromThingId(id, state);

  try {
    if (model.locked) {
      await Modtools.unlock(apiOptions, id);
    } else {
      await Modtools.lock(apiOptions, id);
    }
    dispatch(toggleLockSuccess(model));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(toggleLockFailure(e));
    } else {
      throw e;
    }
  }
}

export const toggleNSFW = id => async (dispatch, getState) => {
  const state = getState();
  const apiOptions = apiOptionsFromState(state);
  const model = modelFromThingId(id, state);

  try {
    if (model.over18) {
      await Modtools.unmarkNSFW(apiOptions, id);
    } else {
      await Modtools.markNSFW(apiOptions, id);
    }

    dispatch(toggleNSFWSuccess(model));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(toggleNSFWFailure(e));
    } else {
      throw e;
    }
  }
};

export const toggleSpoiler = id => async(dispatch, getState) => {
  const state = getState();
  const apiOptions = apiOptionsFromState(state);
  const model = modelFromThingId(id, state);

  try{
    if (model.spoiler) {
      await Modtools.unspoiler(apiOptions, id);
    } else {
      await Modtools.spoiler(apiOptions, id);
    }
    dispatch(toggleSpoilerSuccess(model));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(toggleSpoilerFailure(e));
    } else {
      throw e;
    }
  }
}

export const fetchModeratingSubreddits = () => async (dispatch, getState) => {
  const state = getState();
  const apiOptions = apiOptionsFromState(state);

  const subredditsAlreadyFetched = (
    state.moderatingSubreddits.loading === true ||
    state.moderatingSubreddits.responseCode === 200);

  // don't make API call again
  if (subredditsAlreadyFetched) { return; }

  dispatch(fetchingSubs());

  try {
    const moderatingSubs = await ModeratingSubreddits.fetch(apiOptions);
    dispatch(receivedSubs(moderatingSubs.apiResponse));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(fetchSubsFailed(e));
    } else {
      throw e;
    }
  }
};
