import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import cx from 'lib/classNames';
import getXpromoTheme from 'lib/xpromoTheme';
import { getDevice } from 'lib/getDeviceFromState';
import XPromoWrapper from 'app/components/XPromoWrapper';
import DualPartInterstitialHeader from 'app/components/DualPartInterstitial/Header';
import DualPartInterstitialFooter from 'app/components/DualPartInterstitial/Footer';

import {
  xpromoTheme,
  scrollPastState,
  isXPromoPersistentActive,
} from 'app/selectors/xpromo';

export function DualPartInterstitial(props) {
  const { 
    mixin,
    scrollPast,
    xpromoTheme,
    isXPromoPersistentActive,
  } = props;

  const CLASS = 'DualPartInterstitial';
  const themeDisplayClass = getXpromoTheme(
    xpromoTheme,
    scrollPast,
    isXPromoPersistentActive
  ).displayClass;

  return (
    <XPromoWrapper>
      <div className={ cx(CLASS, themeDisplayClass, mixin) }>
        <div className={ `${CLASS}__content` }>
          <div className={ `${CLASS}__common` }>
            <DualPartInterstitialHeader { ...props } />
            <DualPartInterstitialFooter { ...props } />
          </div>
        </div>
      </div>
    </XPromoWrapper>
  );
}

export const selector = createSelector(
  getDevice,
  scrollPastState,
  xpromoTheme,
  isXPromoPersistentActive,
  (device, scrollPast, xpromoTheme, isXPromoPersistentActive) => ({
    device, scrollPast, xpromoTheme, isXPromoPersistentActive,
  }),
);

export default connect(selector)(DualPartInterstitial);
