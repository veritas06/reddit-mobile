import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getSubredditNamePrefixed } from 'lib/getSubredditFromState';
import { XPROMO_DISPLAY_THEMES as THEME } from 'app/constants';
import { xpromoTheme } from 'app/selectors/xpromo';
import getXpromoTheme from 'lib/xpromoTheme';

import AppButton from 'app/components/DualPartInterstitial/AppButton';
import BulletList from 'app/components/DualPartInterstitial/Footer/BulletList';
import DismissLink from 'app/components/DualPartInterstitial/Footer/DismissLink';

class DualPartInterstitialFooter extends React.Component {
  buttonProps() {
    const { xpromoTheme } = this.props;
    return {
      title: (xpromoTheme === THEME.PERSIST ? 'Open in app' : 'Continue'),
      visitTrigger: getXpromoTheme(xpromoTheme).visitTrigger,
      interstitialType: xpromoTheme,
    };
  }

  subtitleText() {
    const { subredditNamePrefixed } = this.props;
    const pageName = subredditNamePrefixed ? subredditNamePrefixed : 'Reddit';
    return `View ${ pageName } in the app because you deserve the best.`;
  }

  render() {
    return (
      <div className='DualPartInterstitialFooter'>
        <div className='DualPartInterstitialFooter__content'>
          <div className='DualPartInterstitialFooter__subtitle'>
            { this.subtitleText() }
          </div>
          <BulletList />
          <div className='DualPartInterstitialFooter__button'>
            <AppButton { ...this.buttonProps() } />
          </div>
          <div className='DualPartInterstitialFooter__dismissal'>
            <DismissLink />
          </div>
        </div>
      </div>
    );
  }
}

const selector = createStructuredSelector({
  xpromoTheme: state => xpromoTheme(state),
  subredditNamePrefixed: getSubredditNamePrefixed,
});

export default connect(selector)(DualPartInterstitialFooter);
