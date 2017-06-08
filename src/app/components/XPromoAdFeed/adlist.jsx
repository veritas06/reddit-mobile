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
  <div className="XPromoAdFeed">
    <h1>{ 'Reddit mobile app. It\'s a smooth-er operator.' }</h1>
    <p>Never miss a conversation with the Reddit mobile app.</p>
    <XPromoAppButton varian={ TYPE.LISTING_SMALL } />
  </div>
);

export const AdListingBig = () => {
  const content = [
    {
      imagePath: 'img/picture1.gif',
      header: 'Oh, to be in a place that doesn\'t limit your character.',
    },{
      imagePath: 'img/picture2.gif',
      header: 'Not just a book with faces, we\'re a novel of human conversation.',
    },{
      imagePath: 'img/picture3.gif',
      header: 'I bet this browser is a bit too shiny, but our app is fit just for you.',
    },{
      imagePath: 'img/picture4.gif',
      header: 'Discover interests you never knew you had. No compass icon needed.',
    },
  ];
  const random = Math.floor(Math.random()*header.length);
  const { imagePath, header } = content[random];
  return (
    <div className="XPromoAdFeed">
      <img src={ imagePath } />
      <h1>{ header }</h1>
      <p>Never miss a conversation with the Reddit mobile app.</p>
      <XPromoAppButton
        varian={ TYPE.LISTING_BIG }
        contentVersion={ random }
      />
      <sub>Scroll to view mobile site</sub>
    </div>
  );
};
