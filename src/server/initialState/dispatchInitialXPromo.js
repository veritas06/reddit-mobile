import { getExperimentDataByFlags } from '../../app/selectors/xpromo';
import { XPROMO_ADLOADING_TYPES as TYPE } from '../../app/constants';
import {
  trackBucketingEvents,
  trackPagesXPromoEvents,
} from 'lib/eventUtils';

export const dispatchInitialXPromo = async (ctx, dispatch, getState) => {
  const state = getState();
  const experimentData = getExperimentDataByFlags(state);
  trackBucketingEvents(state, experimentData, dispatch);
  trackPagesXPromoEvents(state, {interstitial_type: TYPE.MAIN});
};
