import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { isXPromoAdLoadingEnabled } from 'app/selectors/xpromo';
import Loading from 'app/components/Loading';

const AdLoading = (props) => {
  return (
    <div className='adLoading'><Loading />
      <p>Happy text here</p>
      <div className='adLoading__button'>
        <button>Get your App</button>
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
  (appLink, isEnabled) => {
    return { appLink, isEnabled};
  },
);

export default connect(selector)(Loader);
