import createTest from 'platform/createTest';
import twoFactorAuthentication, { DEFAULT } from './twoFactorAuthentication';
import * as tfaActions from 'app/actions/twoFactorAuthentication';
import { loginForms } from 'app/constants';

createTest({ reducers: { twoFactorAuthentication } }, ({ getStore, expect }) => {
  describe('twoFactorAuthentication', () => {
    describe('OPEN_APP_CODE_FORM', () => {
      it('should change `activeForm` to be app code form', () => {
        const { store } = getStore({ twoFactorAuthentication: DEFAULT });
        store.dispatch(tfaActions.openAppCodeForm());
        const { twoFactorAuthentication } = store.getState();
        expect(twoFactorAuthentication.activeForm).to.eql(loginForms.APP_CODE);
      });
    });

    describe('OPEN_BACKUP_CODE_FORM', () => {
      it('should change `activeForm` to be backup code form', () => {
        const { store } = getStore({ twoFactorAuthentication: DEFAULT });
        store.dispatch(tfaActions.openBackupCodeForm());
        const { twoFactorAuthentication } = store.getState();
        expect(twoFactorAuthentication.activeForm).to.eql(loginForms.BACKUP_CODE);
      });
    });

    describe('OPEN_AUTH_FORM', () => {
      it('should change `activeForm` to be auth form', () => {
        const { store } = getStore({ twoFactorAuthentication: DEFAULT });
        store.dispatch(tfaActions.openAuthForm());
        const { twoFactorAuthentication } = store.getState();
        expect(twoFactorAuthentication.activeForm).to.eql(loginForms.AUTH);
      });
    });
  });
});
