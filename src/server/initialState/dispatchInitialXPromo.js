import { xpromoSetAppLink } from '../../app/actions/xpromo';
import { getXPromoLinkforCurrentPage } from '../../lib/xpromoState';

export const dispatchInitialXPromoLink = async (ctx, dispatch, getState) => {
  const link = getXPromoLinkforCurrentPage(getState(), 'interstitial')
  dispatch(xpromoSetAppLink(link));
};
