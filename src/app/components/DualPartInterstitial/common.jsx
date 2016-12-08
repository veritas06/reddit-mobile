/* eslint-disable react/jsx-curly-spacing */

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { flags } from 'app/constants';
import { getDevice } from 'lib/getDeviceFromState';
import getSubreddit from 'lib/getSubredditFromState';
import { getBranchLink } from 'lib/smartBannerState';

import DualPartInterstitialHeader from 'app/components/DualPartInterstitial/Header'
import DualPartInterstitialFooter from 'app/components/DualPartInterstitial/Footer';
import PostsFromSubreddit from 'app/router/handlers/PostsFromSubreddit';
import { paramsToPostsListsId } from 'app/models/PostsList';
import { featuresSelector} from 'app/selectors/features';

const T = React.PropTypes;

const THUMBNAIL_THRESHOLD = 9;

export function DualPartInterstitialCommon(props) {
  return (
    <div className='DualPartInterstitial__common'>
      <DualPartInterstitialHeader { ...props } />
      <DualPartInterstitialFooter { ...props }/>
    </div>
  );
}

DualPartInterstitialCommon.propTypes = {
  urls: T.array.isRequired,
  onClose: T.func,
};

function getUrls(state) {
  return [
    getBranchLink(state, {
      feature: 'interstitial',
      campaign: 'xpromo_interstitial_listing',
      utm_medium: 'interstitial',
      utm_name: 'xpromo_interstitial_listing',
      utm_content: 'element_1',
    }),
    getBranchLink(state, {
      feature: 'interstitial',
      campaign: 'xpromo_interstitial_listing',
      utm_medium: 'interstitial',
      utm_name: 'xpromo_interstitial_listing',
      utm_content: 'element_2',
    }),
  ];
}

export const selector = createStructuredSelector({
  urls: getUrls,
  device: getDevice,
});
