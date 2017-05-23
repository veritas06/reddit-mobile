import { getExperimentDataByFlags } from '../../app/selectors/xpromo';
import { XPROMO_ADLOADING_TYPES as TYPE } from '../../app/constants';
import {
  trackBucketingEvents,
  trackPagesXPromoEvents,
} from 'lib/eventUtils';

export const dispatchInitialXPromoLink = async (ctx, dispatch, getState) => {
  const state = getState();
  const experimentData = getExperimentDataByFlags(state);

  console.error('=======================================');
  console.error(state.meta.env, 'EVENT: bucketing_events');
  console.error('=======================================');
  trackBucketingEvents(state, experimentData, dispatch);

  console.error('========================================');
  console.error(state.meta.env, 'EVENT: xpromo_view_event');
  console.error('========================================');
  trackPagesXPromoEvents(state, {interstitial_type: TYPE.MAIN});
};
