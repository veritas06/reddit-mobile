import './styles.less';
import React from 'react';
import getXpromoTheme from 'lib/xpromoTheme';
import AppButton from 'app/components/DualPartInterstitial/AppButton';

import {
  XPROMO_AD_FEED_TYPES as TYPE,
  XPROMO_DISPLAY_THEMES as THEME,
} from 'app/constants';

const XPromoAppButton = (props) => {
  const buttonProps = {
    title : 'OPEN IN APP',
    visitTrigger : getXpromoTheme(THEME.ADFEED),
    interstitialType : props.varian,
  };
  return <AppButton { ...buttonProps } />;
};

export const AdListingSmall = () => (
  <div className='XPromoAdFeed mSmall'>
    <div className='XPromoAdFeed__img'></div>
    <h1 className='XPromoAdFeed__title'>
      { 'Reddit mobile app. ' }<br />
      { 'It\'s a smooth-er operator.' }
    </h1>
    <p className='XPromoAdFeed__text'>
      Never miss a conversation with<br />
      the Reddit mobile app.
    </p>
    <div className='XPromoAdFeed__button'>
      <XPromoAppButton varian={ TYPE.LISTING_SMALL } />
    </div>
  </div>
);

export const AdListingBig = () => {
  const headers = [
    'Oh, to be in a place that doesn\'t limit your character.',
    'Not just a book with faces, we\'re a novel of human conversation.',
    'I bet this browser is a bit too shiny, but our app is fit just for you.',
    'Discover interests you never knew you had. No compass icon needed.',
  ];
  const random = Math.floor(Math.random()*headers.length);
  const header = headers[random];
  return (
    <div className='XPromoAdFeed mBig'>
      <div className={ `XPromoAdFeed__img mPic${random}` }></div>
      <h1 className='XPromoAdFeed__title'>{ header }</h1>
      <p className='XPromoAdFeed__text'>
        Never miss a conversation with the Reddit mobile app.
      </p>
      <div className='XPromoAdFeed__button'>
        <XPromoAppButton
          varian={ TYPE.LISTING_BIG }
          contentVersion={ random }
        />
      </div>
      <sub className='XPromoAdFeed__sub'>Scroll to view mobile site</sub>
    </div>
  );
};
