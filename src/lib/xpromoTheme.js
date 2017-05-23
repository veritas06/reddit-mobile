import { XPROMO_DISPLAY_THEMES as THEME } from 'app/constants';

export default function getXpromoTheme(
  xpromoTheme, 
  scrollPast=false, 
  isXPromoPersistentActive
) {
  switch (xpromoTheme) {
    case THEME.ADLOADING:
      return {
        visitTrigger : 'ad_loading_button',
      };
    case THEME.MINIMAL:
      return {
        visitTrigger : 'banner_button',
        displayClass : {
          'xpromoMinimal': true,
          'fadeOut' : scrollPast,
        },
      };
    case THEME.PERSIST:
      return {
        visitTrigger : 'persist_banner_button',
        displayClass : {
          'xpromoPersist': true,
          'fadeOut' : scrollPast,
          'visiblePersist' : isXPromoPersistentActive,
        },
      };
    case THEME.USUAL:
    default:
      return {
        visitTrigger : 'interstitial_button',
        displayClass : {},
      };
  }
}
