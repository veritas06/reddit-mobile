import './styles.less';
import React from 'react';

export default function SuspensionBanner() {
  return (
    <div className='SuspensionBanner'>
      <div className='SuspensionBanner__icon icon icon-xl icon-law' />
      <div className='SuspensionBanner__text'>
        Your account has been permanently
        <br />
        suspended from Reddit
      </div>
    </div>
  );
}
