import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { isXPromoAdLoadingEnabled } from 'app/selectors/xpromo';
import AppButton from 'app/components/DualPartInterstitial/AppButton';
import Loading from 'app/components/Loading';
import SnooIcon from 'app/components/SnooIcon';

const CommentsTextButton = () => {
  return (
    <div className='adLoading m-comments'>
      <h3 className='textLoader'>Comments loading
        <span className="textLoader__ball1"></span>
        <span className="textLoader__ball2"></span>
        <span className="textLoader__ball3"></span>
      </h3>

      <p>The App is 50% Faster</p>
      <div className='adLoading__button'>
        <AppButton title='OPEN IN APP' />
      </div>
    </div>
  );
};

const BigLogoTextButton = () => {
  return (
    <div className='adLoading'>
      <div className='adLoading__logo'>
        <SnooIcon />
        <div className='adLoading__logoBg'></div>
      </div>
      <h3>The Reddit App is&nbsp;50% Faster than&nbsp;Web</h3>
      <p>Infinite Scrolls. Autoplay GIFs.</p>
      <div className='adLoading__wrapper'>
        <div className='adLoading__button'>
          <AppButton title='UPGRADE TO APP'/>
        </div>
      </div>
    </div>
  );
};

// In case when XPromo experiment with button is enabled let's 
// show <AdLoading />, otherwise - regular <Loading />;
const Loader = (props) => {
  if (props.isEnabled) {
    switch (props.type) {
      case 'comments':
        return <CommentsTextButton { ...props } />;
      default:
        return <BigLogoTextButton { ...props } />;
    }
  }
  return <Loading />;
};

const selector = createSelector(
  (state) => state.xpromo.server.appLink,
  isXPromoAdLoadingEnabled,
  (appLink, isEnabled) => ({
    appLink, isEnabled,
  }),
);

export default connect(selector)(Loader);
