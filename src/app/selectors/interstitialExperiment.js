import { some } from 'lodash/collection';
import { flags } from 'app/constants';

import { createSelector } from 'reselect';
import { featuresSelector} from 'app/selectors/features';


const {
  VARIANT_XPROMO_LIST,
  VARIANT_XPROMO_SUBREDDIT,
  VARIANT_XPROMO_SUBREDDIT_TRANSPARENT,
  VARIANT_XPROMO_SUBREDDIT_EMBEDDED_APP,
  VARIANT_XPROMO_SUBREDDIT_LISTING,
  VARIANT_XPROMO_FP_GIF,
  VARIANT_XPROMO_FP_STATIC,
  VARIANT_XPROMO_FP_SPEED,
  VARIANT_XPROMO_FP_TRANSPARENT,
} = flags;


export const interstitialExperimentSelector = createSelector(
  featuresSelector,
  (features) => {
    const showTransparency = (
      features.enabled(VARIANT_XPROMO_SUBREDDIT_TRANSPARENT) ||
      features.enabled(VARIANT_XPROMO_FP_TRANSPARENT)
    )
    const showEmbeddedApp = (
      features.enabled(VARIANT_XPROMO_SUBREDDIT_EMBEDDED_APP)
    )
    const showStaticAppPreview = (
      features.enabled(VARIANT_XPROMO_FP_STATIC)
    )
    const showGifAppPreview = (
      features.enabled(VARIANT_XPROMO_FP_GIF)
    )
    const showSpeedAppPreview = (
      features.enabled(VARIANT_XPROMO_FP_SPEED)
    )
    const showThumbnailGrid = (
      features.enabled(VARIANT_XPROMO_SUBREDDIT) && ! (
        features.enabled(VARIANT_XPROMO_SUBREDDIT_TRANSPARENT) ||
        features.enabled(VARIANT_XPROMO_SUBREDDIT_EMBEDDED_APP) ||
        features.enabled(VARIANT_XPROMO_SUBREDDIT_LISTING)
      )
    )
    return {
      showTransparency,
      showEmbeddedApp,
      showStaticAppPreview,
      showGifAppPreview,
      showSpeedAppPreview,
      showThumbnailGrid,
    }
  }
);
