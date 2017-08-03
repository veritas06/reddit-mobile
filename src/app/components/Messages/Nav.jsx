import './Nav.less';
import React from 'react';

import { Anchor } from 'platform/components';

const T = React.PropTypes;

const TYPES = [
  { type: 'messages', basepath: 'message', text: 'MESSAGES', icon: 'icon-message' },
  { type: 'comments', basepath: 'notification', text: 'COMMENTS', icon: 'icon-comment' },
  { type: 'selfreply', basepath: 'notification', text: 'POST REPLIES', icon: 'icon-post' },
  { type: 'mentions', basepath: 'notification', text: 'MENTIONS', icon: 'icon-crown' },
];

export default function MessagesNav(props) {
  return (
    <div className='MessagesNav'>
      { TYPES.map(data => renderNavItem(data, props.currentMailType)) }
    </div>
  );
}

MessagesNav.propTypes = {
  currentMailType: T.string.isRequired,
};

const renderNavItem = ({ type, text, icon, basepath }, currentType) => (
  <Anchor
    className={ `MessagesNav__item ${ type === currentType ? 'm-selected' : '' }` }
    href={ `/${basepath}/${ type }` }
  >
    <div className={ `MessagesNav__icon icon ${ icon }` }/>
    <div className='MessagesNav__text'>{ text }</div>
  </Anchor>
);
