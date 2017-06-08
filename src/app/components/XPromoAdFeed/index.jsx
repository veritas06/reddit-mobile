import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import adlist from 'app/components/XPromoAdFeed/adlist';
import { XPROMO_AD_FEED_TYPES as TYPE } from 'app/constants';
import {
  xpromoAdFeedVariant,
  xpromoAdFeedIsVariantEnabled,
} from 'app/selectors/xpromo';

// Variants switcher
const XPromoAd = props => {
  const { variant, isEnabled } = props;
  return (isEnabled ? adlist[variant] : null);
};
const selector = createSelector(
  (state) => xpromoAdFeedVariant(state),
  (state, props) => xpromoAdFeedIsVariantEnabled(state, props.variant),
  (variant, isEnabled) => ({ variant, isEnabled }),
);
const XPromoAdSwitcher = connect(selector)(XPromoAd);

// Shared dumb components
// 1) Top-big XPromo Ad
export const XPromoAdFeedTopBig = () => {
  return (<XPromoAdSwitcher variant={ [TYPE.TOP_BIG] } />);
};
// 2) Big and Small (in feed) XPromo Ad
// This func inject (Big or Small) Ad into the posts feed
export const addXPromoToPostsList = (postsList, place) => {
  const inFeedVariants = [TYPE.LISTING_BIG, TYPE.LISTING_SMALL];
  return postsList.splice(place, 0, <XPromoAdSwitcher variant={ inFeedVariants } />);
};
