import { xpromoSetAppLink } from '../../app/actions/xpromo';
// import { COLOR_SCHEME } from '../../app/constants';
// import { DEFAULT } from '../../app/reducers/theme';
// import { permanentCookieOptions } from './permanentCookieOptions';

import { getXPromoLinkforCurrentPage } from '../../lib/xpromoState';
// const { DAYMODE, NIGHTMODE } = COLOR_SCHEME;

export const dispatchInitialXPromoLink = async (ctx, dispatch, getState) => {
  const link = getXPromoLinkforCurrentPage(getState(), 'interstitial')
  // console.error('>> 2', link);
  // console.error('>> 3', xpromoSetAppLink);

  dispatch(xpromoSetAppLink(link));

  // const themeCookie = ctx.cookies.get('theme');
  // const themeFromQuery = ctx.query.theme;
  // let theme = themeFromQuery || themeCookie;

  // if (!(theme === NIGHTMODE || theme === DAYMODE)) {
  //   theme = DEFAULT;
  // }

  // // NOTE: there was a bug were we set HTTP_ONLY cookies so the client' couldn't
  // // override them. Set this cookie no matter what so httpOnly flag is removed
  // // for those users affected
  // ctx.cookies.set('theme', theme, permanentCookieOptions());

  // dispatch(themeActions.setTheme(theme));
};
