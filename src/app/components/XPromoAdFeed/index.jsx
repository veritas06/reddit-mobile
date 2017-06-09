import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { XPROMO_AD_FEED_TYPES as TYPE } from 'app/constants';
import {
  xpromoAdFeedVariant,
  xpromoAdFeedIsVariantEnabled,
} from 'app/selectors/xpromo';
import {
  AdListingBig,
  AdListingSmall,
} from 'app/components/XPromoAdFeed/adlist';

// Variants switcher
const XPromoAd = props => {
  const { variant, isEnabled } = props;
  const variants = {
    [TYPE.LISTING_BIG]: (<AdListingBig />),
    [TYPE.LISTING_SMALL]: (<AdListingSmall />),
  };
  return (isEnabled ? variants[variant] : null);
  // @TODO remove me
  // return (isEnabled ? variants[TYPE.LISTING_BIG] : null);
};

const selector = createSelector(
  (state) => xpromoAdFeedVariant(state),
  (state, props) => xpromoAdFeedIsVariantEnabled(state, props.variant),
  (variant, isEnabled) => ({ variant, isEnabled }),
);
const XPromoAdSwitcher = connect(selector)(XPromoAd);

// This func inject (Big or Small) Ad into the posts feed
export const addXPromoToPostsList = (postsList, place) => {
  const inFeedVariants = [TYPE.LISTING_BIG, TYPE.LISTING_SMALL];
  return postsList.splice(place, 0, <XPromoAdSwitcher variant={ inFeedVariants } />);
};
