/* eslint dot-notation: 0 */
import 'app/components/LoginRegistrationForm/styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { METHODS } from 'platform/router';
import { Form, Anchor, BackAnchor } from 'platform/components';
import { loginErrors, genericErrors, loginForms } from 'app/constants';

import * as sessionActions from 'app/actions/session';
import * as tfaActions from 'app/actions/twoFactorAuthentication';
import * as xpromoActions from 'app/actions/xpromo';

import goBackDest from 'lib/goBackDest';
import { markBannerClosed } from 'lib/xpromoState';

import SnooIcon from 'app/components/SnooIcon';
import LoginInput from 'app/components/LoginRegistrationForm/Input';
import SquareButton from 'app/components/LoginRegistrationForm/SquareButton';


class Login extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      isPasswordField: true,
      password: '',
      username: '',
      otp: '',
    };

    this.handleBackToAuth = this.handleBackToAuth.bind(this);
    this.handleOpenAppCodeForm = this.handleOpenAppCodeForm.bind(this);
    this.handleOpenBackupCodeForm = this.handleOpenBackupCodeForm.bind(this);
    this.clearPassword = this.clearField.bind(this, 'password');
    this.clearUsername = this.clearField.bind(this, 'username');
    this.clearOtp = this.clearField.bind(this, 'otp');
    this.updatePassword = this.updateField.bind(this, 'password');
    this.updateUsername = this.updateField.bind(this, 'username');
    this.updateOtp = this.updateField.bind(this, 'otp');
    this.toggleEye = this.toggleEye.bind(this);
  }

  toggleEye() {
    const { isPasswordField } = this.state;
    this.setState({ isPasswordField: !isPasswordField });
  }

  clearField(fieldName, e) {
    const { resetSessionError } = this.props;
    e.preventDefault();
    this.setState({ [fieldName]: '' }, resetSessionError);
  }

  updateField(fieldName, e) {
    e.preventDefault();
    this.setState({ [fieldName]: e.target.value });
  }

  renderClear(methodName) {
    return (
      <button
        type='button'
        className='Login__input-action-btn'
        onClick={ this[methodName] }
      >
        <span className='icon icon-x red' />
      </button>
    );
  }

  renderEye() {
    const { isPasswordField } = this.state;
    const blue = isPasswordField ? '' : 'blue';

    return (
      <button
        type='button'
        className='Login__input-action-btn'
        onClick={ this.toggleEye }
      >
        <span className={ `icon icon-eye ${blue}` } />
      </button>
    );
  }

  onAppPromoClick = () => {
    const { nativeAppNavigator, nativeAppLink } = this.props;
    markBannerClosed();
    nativeAppNavigator(nativeAppLink);
  }

  renderAppPromo() {
    return (
      <div className='Login__app-promo'>
        <p className='Login__app-promo__or'>or</p>
        <SquareButton
          onClick={ this.onAppPromoClick }
          modifier='orangered'
          text='Continue in the app'
        />
        <p className='Login__app-promo__subtext'>(no login required)</p>
      </div>
    );
  }

  handleBackToAuth(e) {
    const { openAuthForm } = this.props;
    openAuthForm();
    this.clearOtp(e);
  }

  renderCloseButton() {
    const { activeForm, platform } = this.props;
    const backDest = goBackDest(platform, ['/login', '/register']);

    if (activeForm === loginForms.APP_CODE ||
        activeForm === loginForms.BACKUP_CODE) {
      return (
        <a
          className='Login__back-to-auth icon icon-nav-arrowup'
          onClick={ this.handleBackToAuth }
          href=''
        />
      );
    }

    return (
      <BackAnchor
        className='Register__close icon icon-x'
        href={ backDest }
      />
    );
  }

  renderTitle() {
    const { activeForm } = this.props;

    if (activeForm === loginForms.AUTH) {
      return (
        <div>
          <SnooIcon />
          <div className='Login__register-link'>
            <p>
              <Anchor href='/register'> New user? Sign up! </Anchor>
            </p>
          </div>
        </div>
      );
    } else if (activeForm === loginForms.APP_CODE) {
      return (
        <div className='Login__tfa-title'>
          <h1 className='tfa-title-header'>Enter the 6 digit code from your authenticator app</h1>
          <p className='tfa-title-desc'>You have 2 factor authentication enabled on this account because you're awesome.</p>
        </div>
      );
    } else if (activeForm === loginForms.BACKUP_CODE) {
      return (
        <div className='Login__tfa-title'>
          <h1 className='tfa-title-header'>Enter a 6 digit backup code</h1>
          <p className='tfa-title-desc'>You have 2 factor authentication enabled on this account because you're awesome.</p>
        </div>
      );
    }
  }

  handleOpenBackupCodeForm(e) {
    const { openBackupCodeForm } = this.props;
    openBackupCodeForm();
    this.clearOtp(e);
  }

  handleOpenAppCodeForm(e) {
    const { openAppCodeForm } = this.props;
    openAppCodeForm();
    this.clearOtp(e);
  }

  renderCodeTypeSwitcher() {
    const { activeForm } = this.props;
    
    if (activeForm === loginForms.APP_CODE) {
      return (
        <div className='Login__switch-code-type'>
          <a onClick={ this.handleOpenBackupCodeForm }>Or use a backup code</a>
        </div>
      );
    } else if (activeForm === loginForms.BACKUP_CODE) {
      return (
        <div className='Login__switch-code-type'>
          <a onClick={ this.handleOpenAppCodeForm }>Or use a code from an authenticator app</a>
        </div>
      );
    }
  }

  render() {
    const { session, platform, displayAppPromo, activeForm } = this.props;
    const { isPasswordField, password, username, otp } = this.state;

    const authFormIsActive = activeForm === loginForms.AUTH;
    const passwordFieldType = authFormIsActive ? (isPasswordField ? 'password' : 'text') : 'hidden';

    const otpFieldType = authFormIsActive ? 'hidden' : 'number';
    const usernameFieldType = authFormIsActive ? 'text' : 'hidden';
    const otpPlaceholder = activeForm === loginForms.APP_CODE ? 'Application code' : 'Backup code';
    const submitButtonText = authFormIsActive ? 'LOG IN' : 'CHECK CODE';

    const backDest = goBackDest(platform, ['/login', '/register']);
    const errorType = session ? session.error : null;

    const error = { username: '', password: '', otp: '' };

    switch (errorType) {
      case loginErrors.WRONG_PASSWORD: {
        error.password = 'Sorry, that’s not the right password';
        break;
      }

      case loginErrors.BAD_USERNAME: {
        error.username = 'Sorry, that’s not a valid username';
        break;
      }

      case loginErrors.INCORRECT_USERNAME_PASSWORD: {
        error.username = true;
        error.password = 'Sorry, that’s an incorrect username or password';
        break;
      }

      case loginErrors.WRONG_OTP: {
        error.otp = 'The verification code you entered is not valid.';
        break;
      }

      case genericErrors.UNKNOWN_ERROR: {
        error.password = 'Sorry, we were unable to log you in';
        break;
      }
    }

    return (
      <div className='Login'>
        <div className='Register__header'>
          { this.renderCloseButton() }
        </div>
        { this.renderTitle() }
        <Form
          className='Login__form'
          method={ METHODS.POST }
          action='/login'
        >
          <LoginInput
            name='username'
            type={ usernameFieldType }
            placeholder='Username'
            showTopBorder={ true }
            error={ error.username }
            onChange={ this.updateUsername }
            value={ username }
          >
            {
              authFormIsActive && error.username
              ? this.renderClear('clearUsername')
              : null
            }
          </LoginInput>
          <LoginInput
            name='password'
            type={ passwordFieldType }
            placeholder='Password'
            showTopBorder={ false }
            shouldAutocomplete={ false }
            error={ error.password }
            onChange={ this.updatePassword }
            value={ password }
          >
            {
              authFormIsActive
              ? error.password
                ? this.renderClear('clearPassword')
                : this.renderEye()
              : null
            }
          </LoginInput>
          <LoginInput
            name='otp'
            type={ otpFieldType }
            placeholder={ otpPlaceholder }
            showTopBorder={ false }
            shouldAutocomplete={ false }
            error={ error.otp }
            onChange={ this.updateOtp }
            value={ otp }
            otpInput={ true }
          >
            {
              error.otp
              ? this.renderClear('clearOtp')
              : null
            }
          </LoginInput>
          <LoginInput
            name='redirectTo'
            type='hidden'
            value={ backDest }
          />
          { this.renderCodeTypeSwitcher() }
          <div className='Login__submit'>
            <SquareButton text={ submitButtonText } type='submit'/>
          </div>
        </Form>
        { displayAppPromo ? this.renderAppPromo() : null }
    </div>
    );
  }
}

const mapStateToProps = createSelector(
  state => state.session,
  state => state.platform,
  state => state.twoFactorAuthentication,
  (session, platform, twoFactorAuthentication) => {
    const displayAppPromo = !!platform.currentPage.queryParams['native_app_promo'];
    const nativeAppLink = platform.currentPage.queryParams['native_app_link'];
    const activeForm = twoFactorAuthentication.activeForm;
    return { session, platform, nativeAppLink, displayAppPromo, activeForm };
  },
);

const mapDispatchToProps = dispatch => {
  let preventExtraClick = false;
  return {
    resetSessionError: () => {
      dispatch(sessionActions.sessionError(null));
    },
    nativeAppNavigator: (async (url) => {
      // Prevention of additional click events
      // while the Promise dispatch is awaiting
      if (!preventExtraClick) {
        preventExtraClick = true;
        // We should not call `await` until the app-store navigation is in progress.
        // see actions/xpromo.navigateToAppStore for more info.
        const trackingPromise = dispatch(xpromoActions.logAppStoreNavigation('login_screen_button'));
        xpromoActions.navigateToAppStore(url);
        await trackingPromise;
        preventExtraClick = false;
      }
    }),
    openAuthForm: () => {
      dispatch(tfaActions.openAuthForm());
    },
    openAppCodeForm: () => {
      dispatch(tfaActions.openAppCodeForm());
    },
    openBackupCodeForm: () => {
      dispatch(tfaActions.openBackupCodeForm());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
