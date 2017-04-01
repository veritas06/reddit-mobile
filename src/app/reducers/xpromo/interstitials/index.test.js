import createTest from 'platform/createTest';
import { METHODS } from 'platform/router';
import * as platformActions from 'platform/actions';
import routes from 'app/router';
import interstitials, { DEFAULT } from './index';

import * as xpromoActions from 'app/actions/xpromo';


createTest({ reducers: { interstitials }, routes }, ({ getStore, expect }) => {
  describe('/xpromo/interstitials', () => {
    describe('SHOW', () => {
      it('should show the smart banner', () => {
        const { store } = getStore({ interstitials: DEFAULT });
        const expected = {
          ...DEFAULT,
          showBanner: true,
        };

        store.dispatch(xpromoActions.show());
        const { interstitials } = store.getState();
        expect(interstitials).to.eql(expected);
      });
    });

    describe('HIDE', () => {
      it('should hide the smart banner', () => {
        const { store } = getStore({ interstitials: DEFAULT });

        // Show and then hide to make sure we're setting and then clearing
        // The SHOW test verifies that setting works.
        store.dispatch(xpromoActions.show('foo', 'bar'));
        store.dispatch(xpromoActions.hide());
        const { interstitials } = store.getState();
        expect(interstitials).to.eql(DEFAULT);
      });
    });

    describe('SCROLLPAST', () => {
      it('should change store status after viewport has been scrolled down', () => {
        const { store } = getStore({ interstitials: DEFAULT });
        store.dispatch(xpromoActions.promoScrollPast());
        const { interstitials } = store.getState();
        expect(interstitials.scrolledPast).to.eql(true);
      });
    });

    describe('SCROLLUP', () => {
      it('should change the store status after viewport has been scrolled up', () => {
        const { store } = getStore({ interstitials: DEFAULT });
        store.dispatch(xpromoActions.promoScrollUp());
        const { interstitials } = store.getState();
        expect(interstitials.scrolledPast).to.eql(false);
      });
    });

    describe('PLATFORM__NAVIGATE_TO_URL', () => {
      it('should not remove desire to show xpromo if we have already shown it once and navigate to another app url', () => {
        const { store } = getStore({ interstitials: DEFAULT });

        // Indicate desire to show, record that we showed, navigate.
        store.dispatch(xpromoActions.show());
        store.dispatch(platformActions.navigateToUrl(METHODS.GET, '/user/foobar'));
        const { interstitials } = store.getState();
        const { showBanner } = interstitials;
        expect(showBanner).to.eql(true);
      });

      it('should not remove desire to show xpromo if we have not shown it yet', () => {
        const { store } = getStore({ interstitials: DEFAULT });

        // Indicate desire to show, navigate.
        store.dispatch(xpromoActions.show());
        store.dispatch(platformActions.navigateToUrl(METHODS.GET, '/user/foobar'));
        const { interstitials } = store.getState();
        const { showBanner } = interstitials;
        expect(showBanner).to.eql(true);
      });
    });
  });
});
