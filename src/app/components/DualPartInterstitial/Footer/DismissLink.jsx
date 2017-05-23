import './styles.less';
import url from 'url';

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { redirect } from 'platform/actions';
import * as xpromoActions from 'app/actions/xpromo';
import { getXPromoLinkforCurrentPage } from 'lib/xpromoState';
import {
  loginRequiredEnabled as requireXPromoLogin,
} from 'app/selectors/xpromo';

class DismissLink extends React.Component {
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
    const CLASSNAME = 'DualPartInterstitialFooter__dismissalLink';

    const defaultLink = (
      <span>
        or go to the <a className={ CLASSNAME } onClick={ this.onClose }>mobile site</a>
      </span>
    );
    const requireLoginLink = (
      <span>
        or <a className={ CLASSNAME } onClick={ this.onClose }>login</a> to the mobile site
      </span>
    );
    return (
      <span className='DualPartInterstitialFooter__dismissalText'>
        { requireLogin ? requireLoginLink : defaultLink }
      </span>
    );
  }

  render() {
    return this.dismissalLink();
  }
}

const selector = createStructuredSelector({
  requireLogin: requireXPromoLogin,
  nativeLoginLink: state => getXPromoLinkforCurrentPage(state, 'login'),
});

export default connect(selector)(DismissLink);
