import './styles.less';
import React from 'react';
import { DropdownRow } from 'app/components/Dropdown';

const T = React.PropTypes;

const statusText = {
  spam: 'Removed as spam',
  removed: 'Removed',
  approved: 'Approved',
};

export function ModalBanner(props) {
  const {
    status,
    statusBy,
    pageName,
    showX,
  } = props;

  if ((!status || !statusBy) && !showX) { return null; }

  let bannerText;
  if (statusText && statusBy){
    bannerText = `${statusText[status]} by ${statusBy}`;
  }

  return (
    <div className={ `ModalBanner m-${status} ${pageName}` }>
      <DropdownRow
        text={ bannerText }
        icon='x'
      />
    </div>
  );
}

ModalBanner.propTypes = {
  status: T.oneOf(Object.keys(statusText)),
  statusBy: T.string,
  pageName: T.string,
  showX: T.bool,
};

ModalBanner.defaultProps = {
  status: null,
  statusBy: null,
  pageName: null,
  showX: true,
};
