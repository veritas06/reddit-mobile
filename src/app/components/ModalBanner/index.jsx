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
    pageName,
    showX,
    status,
    statusBy,
  } = props;

  console.log(showX, status, statusBy)
  // if (!(showX || status && statusBy)) { return null; }
  if ((!status || !statusBy) && !showX) { return null; }

  let bannerText = `${statusText[status]} by ${statusBy}`;

  return (
    <div className={ `ModalBanner m-${status} ${pageName}` }>
      <DropdownRow
        text={ '' }
        icon='x'
      />
    </div>
  );
}

ModalBanner.propTypes = {
  pageName: T.string,
  showX: T.bool,
  status: T.oneOf(Object.keys(statusText)),
  statusBy: T.string,
};

ModalBanner.defaultProps = {
  pageName: null,
  showX: true,
  status: null,
  statusBy: null,
};
