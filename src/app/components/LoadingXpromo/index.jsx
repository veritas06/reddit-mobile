import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { isXPromoAdLoadingEnabled } from 'app/selectors/xpromo';
import AppButton from 'app/components/DualPartInterstitial/AppButton';
import Loading from 'app/components/Loading';

const AdLoading = (props) => {
  return (
    <div className='adLoading'>
      <Loading />
      <p>Happy text here</p>
      <div className='adLoading__wrapper'>
        <div className='adLoading__button'>
          <AppButton title='Get your App'/>
        </div>
      </div>
    </div>
  );
}

const Loader = (props) => {
  return (props.isEnabled ? <AdLoading {...props} /> : <Loading />);
}

const selector = createSelector(
  (state) => state.xpromo.server.appLink,
  isXPromoAdLoadingEnabled,
  (appLink, isEnabled) => ({
    appLink, isEnabled
  }),
);

export default connect(selector)(Loader);
