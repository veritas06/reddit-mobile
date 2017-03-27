import createTest from 'platform/createTest';
import listingClick, { DEFAULT } from './index';

import * as xpromoActions from 'app/actions/xpromo';


createTest({ reducers: { listingClick } }, ({ getStore, expect }) => {
  describe('xpromo/listingClick', () => {
    describe('CAN_LISTING_CLICK', () => {
      it('should change `canListingClick` to be true', () => {
        const { store } = getStore({ listingClick: DEFAULT });
        store.dispatch(xpromoActions.canListingClick());
        const { listingClick } = store.getState();
        expect(listingClick.canListingClick).to.eql(true);
      });
    });

    describe('MARK_LISTING_CLICK_TIMESTAMP', () => {
      it('should change `canListingClick` to be false', () => {
        const { store } = getStore({ listingClick: {
          ...DEFAULT,
          canListingClick: true,
        }});
        store.dispatch({ type: xpromoActions.MARK_LISTING_CLICK_TIMESTAMP });
        const { listingClick } = store.getState();
        expect(listingClick.canListingClick).to.eql(false);
      });
    });

    describe('XPROMO_LISTING_CLICKED', () => {
      it('should change `showingListingClickInterstitial` to true', () => {
        const { store } = getStore({ listingClick: DEFAULT });
        store.dispatch(xpromoActions.promoListingClicked());
        const { listingClick } = store.getState();
        expect(listingClick.showingListingClickInterstitial).to.eql(true);
      });
    });

    describe('XPROMO_HIDE_LISTING_CLICK_INTERSTITIAL', () => {
      it('should change `showingListingClickInterstitial` to be false', () => {
        const { store } = getStore({ listingClick: {
          ...DEFAULT,
          showingListingClickInterstitial: true,
        }});
        store.dispatch({ type: xpromoActions.XPROMO_HIDE_LISTING_CLICK_INTERSTITIAL });
        const { listingClick } = store.getState();
        expect(listingClick.showingListingClickInterstitial).to.eql(false);
      });
    });
  });
});
