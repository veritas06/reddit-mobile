import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { interstitialExperimentSelector } from 'app/selectors/interstitialExperiment';
import getSubreddit from 'lib/getSubredditFromState';

const List = (props) => {
  const { featureSpeed } = props;

  if (featureSpeed) {
    return (
      <div className='DualPartInterstitialFooter__bulletItem feature-speed'>
        <div className='DualPartInterstitialFooter__bulletIcon icon icon-controversial' />
        <div>Browse Reddit 50% Faster</div>
      </div>
    )
  }

  return (
    <div className='DualPartInterstitialFooter__bulletList'>
      <div className='DualPartInterstitialFooter__bulletItem no-feature'>
        <div className='DualPartInterstitialFooter__bulletIcon icon icon-controversial' />
        <div>50% Faster</div>
      </div>
      <div className='DualPartInterstitialFooter__bulletItem no-feature'>
        <span className='DualPartInterstitialFooter__bulletIcon icon icon-compact' />
        Infinite Scroll
      </div>
      <div className='DualPartInterstitialFooter__bulletItem no-feature'>
        <span className='DualPartInterstitialFooter__bulletIcon icon icon-play_triangle' />
        Autoplay GIFs
      </div>
    </div>
  );
}

const DualPartInterstitialFooter = (props) => {
  const {
    subredditName,
    showThumbnailGrid,
    showSpeedAppPreview,
    urls,
    onClose,
    thumbnails,
    navigator,
  } = props;

  const pageName = subredditName ? `r/${ subredditName }` : 'Reddit';

  let subtitleText;
  if (showThumbnailGrid) {
    subtitleText = `${ pageName } is better in the app. ` +
                   'We hate to intrude, but you deserve the best.'
  } else if (!showSpeedAppPreview) {
    subtitleText = `View ${ pageName } in the app because you deserve the best.`;
  } else {
    subtitleText = '';
  }

  const buttonText = 'Continue';

  return (
    <div className='DualPartInterstitialFooter'>
      <div className='DualPartInterstitialFooter__content'>
        <div className='DualPartInterstitialFooter__subtitle'>
          { subtitleText }
        </div>
        <List featureSpeed={ showSpeedAppPreview }/>
        <div
            className='DualPartInterstitialFooter__button'
            onClick={ navigator(urls[0]) }
        >
          { buttonText }
        </div>
        <div className='DualPartInterstitialFooter__dismissal'>
          <span className='DualPartInterstitialFooter__dismissalText'>
            { 'or go to the '}
          </span>
          <a className='DualPartInterstitialFooter__dismissalLink' onClick={ onClose }>
            mobile site
          </a>
        </div>
      </div>
    </div>
  );
}

const selector = createSelector(
  getSubreddit,
  interstitialExperimentSelector,
  (subredditName, experiments) => {
    // TODO: ban NSFW subreddits.
    return { subredditName, ...experiments };
  }
)

export default connect(selector)(DualPartInterstitialFooter);
