import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Ad from 'app/components/Ad';
import BannerAd from 'app/components/BannerAd';
import PaginationButtons from 'app/components/PaginationButtons';
import Post from 'app/components/Post';
import LoadingXpromo from 'app/components/LoadingXpromo';
import {
  adLocationForSubreddit,
  adLocationForDefaultListing,
  adLocationForProgrammatic,
  whitelistStatusForDefaultListing,
  canRequestAds,
  canRequestProgrammaticAds,
  ALL_ADS,
} from 'lib/ads';
import { addXPromoToPostsList } from 'app/components/XPromoAdFeed';
import { isXPromoInFeedEnabled } from 'app/selectors/xpromo';

const T = React.PropTypes;

export const PostsList = props => {
  const { loading, postRecords, nextUrl, prevUrl, shouldPage } = props;
  const shouldRenderPagination = !loading && shouldPage && postRecords.length;

  // On the Server side, the const "loading" is false until the client-side
  // is loaded, so we need to check the contents of the postRecords to find
  // out whether to show the Loader while rendering on the server-side
  if (loading || (!postRecords.length)) {
    return <LoadingXpromo />;
  }

  return (
    <div className='PostsList PostAndCommentList'>
      { renderPostsList(props) }
      { shouldRenderPagination ? renderPagination(postRecords, nextUrl, prevUrl) : null }
    </div>
  );
};

PostsList.propTypes = {
  loading: T.bool.isRequired,
  postRecords: T.array.isRequired,
  isSubreddit: T.bool,
  nextUrl: T.string,
  prevUrl: T.string,
  shouldPage: T.bool,
  forceCompact: T.bool,
  subredditIsNSFW: T.bool,
  subredditSpoilersEnabled: T.bool,
  whitelistStatus: T.oneOf([
    'no_ads',
    'house_only',
    'promo_specified',
    'promo_adult_nsfw',
    'promo_adult',
    'promo_all',
    'all_ads',
  ]),
  onPostClick: T.func,
};

PostsList.defaultProps = {
  nextUrl: '',
  prevUrl: '',
  forceCompact: false,
  isSubreddit: false,
  subredditIsNSFW: false,
  subredditSpoilersEnabled: false,
  shouldPage: true,
};


const renderPostsList = props => {
  const {
    postRecords,
    ad, adId,
    isSubreddit,
    shouldAdFallback,
    forceCompact,
    subredditIsNSFW,
    subredditShowSpoilers,
    onPostClick,
    isXPromoEnabled,
    posts,
    whitelistStatus,
  } = props;
  const postProps = {
    forceCompact,
    subredditIsNSFW,
    subredditShowSpoilers,
    onPostClick,
  };
  const getAdLocation = isSubreddit ? adLocationForSubreddit : adLocationForDefaultListing;
  let adLocation = ad ? getAdLocation({
    posts: postRecords.map(result => posts[result.uuid] || {}),
    whitelistStatus,
  }) : null;
  let adSlotWhitelistStatus = isSubreddit ? whitelistStatus : whitelistStatusForDefaultListing({
    posts: postRecords.map(result => posts[result.uuid] || {}),
    index: adLocation,
  });
  const postsList = postRecords.map((postRecord) => {
    const postId = postRecord.uuid;
    return <Post { ...postProps } postId={ postId } key={ `post-id-${postId}` }/>;
  });

  // eslint-disable-next-line eqeqeq
  if (adLocation != null && canRequestAds(adSlotWhitelistStatus)) {
    // We need to always inject an ad if we have one as sometimes
    // they are blanks (for inventory) and we'll still fallback to dfp.
    if (ad) {
      injectAd({
        postsList,
        adLocation,
        adComponent: (
          <Ad
            postProps={ {
              ...postProps,
              postId: ad.uuid,
              key: 'native-ad',
            } }
            adId={ adId }
            placementIndex={ adLocation }
          />
        ),
      });
    }

    if (shouldAdFallback) {
      // programmatic requires `ALL_ADS`, check to see
      // if there's a better slot available.
      if (adSlotWhitelistStatus !== ALL_ADS) {
        adLocation = adLocationForProgrammatic({ posts });
        // if we got a valid slot back then we know the
        // whitelist status of that slot has to be ALL_ADS
        // eslint-disable-next-line eqeqeq
        if (adLocation != null) {
          adSlotWhitelistStatus = ALL_ADS;
        }
      }

      // eslint-disable-next-line eqeqeq
      if (adLocation != null && canRequestProgrammaticAds(adSlotWhitelistStatus)) {
        injectAd({
          postsList,
          adLocation,
          adComponent: (
            <BannerAd
              sizes={ ['fluid'] }
              key='dfp-banner-ad'
              id='in-feed-banner'
              listingName='listing'
              whitelistStatus={ adSlotWhitelistStatus }
            />
          ),
        });
      }
    }
  }

  if (isXPromoEnabled) {
    addXPromoToPostsList(postsList, 5);
  }

  return postsList;
};

const injectAd = ({ postsList = [], adLocation, adComponent }) => {
  postsList.splice(
    adLocation,
    0,
    adComponent,
  );
};

const renderPagination = (postRecords, nextUrl, prevUrl) => (
  <PaginationButtons
    preventUrlCreation={ !!(nextUrl || prevUrl) }
    nextUrl={ nextUrl }
    prevUrl={ prevUrl }
    records={ postRecords }
  />
);

const isAdLoaded = adRequest => (
  adRequest && !adRequest.pending && adRequest.ad
);

const selector = createSelector(
  (state, props) => state.postsLists[props.postsListId],
  state => state.posts,
  (state, props) => {
    const postsList = state.postsLists[props.postsListId];
    if (!postsList) { return null; }
    return state.adRequests[postsList.adId];
  },
  (_, props) => props.nextUrl,
  (_, props) => props.prevUrl,
  isXPromoInFeedEnabled,
  (postsList, posts, adRequest, nextUrl, prevUrl, isXPromoEnabled) => ({
    loading: !!postsList && postsList.loading,
    postRecords: postsList ? postsList.results.filter(p => !posts[p.uuid].hidden) : [],
    ad: isAdLoaded(adRequest) ? adRequest.ad : '',
    adId: isAdLoaded(adRequest) ? adRequest.adId : '',
    shouldAdFallback: adRequest && adRequest.fallback,
    prevUrl,
    nextUrl,
    isXPromoEnabled,
    posts,
  }),
);

export default connect(selector)(PostsList);
