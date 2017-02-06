import './styles.less';
import React from 'react';
import { Modal } from '@r/widgets/modal';
import { DropdownRow } from 'app/components/Dropdown';
import { ModalBanner } from 'app/components/ModalBanner';
import { getStatusBy, getApprovalStatus } from 'lib/modToolHelpers.js';
const T = React.PropTypes;

export function ReportsModal(props) {
  const {
    userReports,
    modReports,
    isApproved,
    isRemoved,
    isSpam,
    removedBy,
    approvedBy,
    reportModalId,
    onClick,
  } = props;

  return (
    <div className='ModeratorModalWrapper' onClick={ onClick }>
      <Modal
        id={ reportModalId }
        className='DropdownModal ModeratorModal'
      >
        <div className='DropdownClose'>
          <DropdownRow
            icon='x'
            onClick={ onClick }
          />
        </div>
        <div className='ModeratorModalRowWrapper' onClick={ onClick }>
          <ModalBanner
            status={ getApprovalStatus(isApproved,
                                       isRemoved,
                                       isSpam,) }
            statusBy={ getStatusBy(isApproved,
                                   isRemoved,
                                   isSpam,
                                   removedBy,
                                   approvedBy,) }
            pageName={ 'moderatorModal' }
          />
          { showReports(modReports, 'Moderator') }
          { showReports(userReports, 'User') }
        </div>
      </Modal>
    </div>
  );
}

function showReports(reports, reportType) {
  if (reports.length > 0) {
    return (
      <div className='Reports'>
        <div className='m-reports-title'>{ `${reportType} Reports:` }</div>
        {
          reports.map(function(report) {
            return (
              <div>{ `${report[1]}: ${report[0]}` }</div>
            );
          })
        }
      </div>
    );
  }
}

ReportsModal.propTypes = {
  onToggleModal: T.func.isRequired,
  userReports: T.arrayOf(T.object),
  modReports: T.arrayOf(T.object),
  isApproved: T.bool,
  isRemoved: T.bool,
  isSpam: T.bool,
  removedBy: T.string,
  approvedBy: T.string,
};

ReportsModal.defaultProps = {
  userReports: [],
  modReports: [],
  isApproved: true,
  isRemoved: false,
  isSpam: false,
  removedBy: null,
  approvedBy: null,
};
