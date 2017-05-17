import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import url from 'url';

import { redirect } from 'platform/actions';
import * as xpromoActions from 'app/actions/xpromo';
import { getXPromoLinkforCurrentPage } from 'lib/xpromoState';
import { getSubredditNamePrefixed } from 'lib/getSubredditFromState';
import AppButton from 'app/components/DualPartInterstitial/AppButton';
import BulletList from 'app/components/DualPartInterstitial/Footer/BulletList';

import {
  loginRequiredEnabled as requireXPromoLogin,
} from 'app/selectors/xpromo';

class DualPartInterstitialFooter extends React.Component {
  componentDidMount() {
    const { dispatch, requireLogin } = this.props;
    if (requireLogin) {
      dispatch(xpromoActions.loginRequired());
    }
  }

  onClose = () => {
    const { dispatch, requireLogin } = this.props;
    if (requireLogin) {
      dispatch(redirect(this.loginLink()));
    } else {
      dispatch(xpromoActions.close());
      dispatch(xpromoActions.promoDismissed('link'));
    }
  }

  // note that we create and pass in the login link from the interstitial
  // because creating branch links require window. Since login is sometimes
  // rendered from the server, we have to do this here.
  loginLink() {
    const { nativeLoginLink } = this.props;
    return url.format({
      pathname: '/login',
      query: { 'native_app_promo': 'true', 'native_app_link': nativeLoginLink },
    });
  }

  dismissalLink() {
    const { requireLogin } = this.props;
    const defaultLink = (<span>or go to the <a className='DualPartInterstitialFooter__dismissalLink' onClick={ this.onClose } >mobile site</a></span>);
    const requireLoginLink = (<span>or <a className='DualPartInterstitialFooter__dismissalLink' onClick={ this.onClose } >login</a> to the mobile site</span>);
    return (
      <span className='DualPartInterstitialFooter__dismissalText'>
        { requireLogin ? requireLoginLink : defaultLink }
      </span>
    );
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
            <AppButton />
          </div>
          <div className='DualPartInterstitialFooter__dismissal'>
            { this.dismissalLink() }
          </div>
        </div>
      </div>
    );
  }
}

const selector = createStructuredSelector({
  requireLogin: requireXPromoLogin,
  subredditNamePrefixed: getSubredditNamePrefixed,
  nativeLoginLink: state => getXPromoLinkforCurrentPage(state, 'login'),
});

export default connect(selector)(DualPartInterstitialFooter);
