import createTest from 'platform/createTest';
import listingClick, { DEFAULT } from './index';

import * as xpromoActions from 'app/actions/xpromo';


createTest({ reducers: { listingClick } }, ({ getStore, expect }) => {
  describe('xpromo/listingClick', () => {
    describe('LISTING_CLICK_INITIAL_STATE', () => {
      it('should change `ineligibilityReason` and `lastModalClick`', () => {
        const { store } = getStore({ listingClick: DEFAULT });
        const ineligibilityReason = 'localstorage_unavailable';
        const lastModalClick = Date.now();
        store.dispatch(xpromoActions.listingClickInitialState({
          ineligibilityReason,
          lastModalClick,
        }));
        const { listingClick } = store.getState();
        expect(listingClick).to.eql({
          ...DEFAULT,
          ineligibilityReason,
          lastModalClick,
        });
      });
    });

    describe('LISTING_CLICK_MODAL_ACTIVATED', () => {
      it('should set `active` to be true', () => {
        const { store } = getStore({ listingClick: DEFAULT });
        store.dispatch(xpromoActions.xpromoListingClickModalActivated({}));
        const { listingClick } = store.getState();
        expect(listingClick.active).to.eql(true);
      });

      it('should set `listingClickType` and `postId` on clickInfo', () => {
        const listingClickType = 'title';
        const postId = 'abcd';
        const { store } = getStore({ listingClick: DEFAULT });
        store.dispatch(xpromoActions.xpromoListingClickModalActivated({ postId, listingClickType }));
        const { listingClick } = store.getState();

        console.log(JSON.stringify(listingClick, null, 2));
        expect(listingClick.clickInfo).to.eql({
          listingClickType,
          postId,
        });
      });
    });

    describe('LISTING_CLICK_RETURNER_MODAL_ACTIVATED', () => {
      it('should set `active` to be true', () => {
        const { store } = getStore({ listingClick: DEFAULT });
        store.dispatch(xpromoActions.xpromoListingClickReturnerModalActivated());
        const { listingClick } = store.getState();
        expect(listingClick.active).to.eql(true);
      });

      it('should set `showingAppStoreModal` to false, and `showingReturnerModal` to true', () => {
        const { store } = getStore({ listingClick: DEFAULT });
        // set's active true, app store modal true
        store.dispatch(xpromoActions.xpromoListingClickModalActivated({}));

        // now our test
        store.dispatch(xpromoActions.xpromoListingClickReturnerModalActivated());
        const { listingClick } = store.getState();
        expect(listingClick.active).to.eql(true);
        expect(listingClick.showingAppStoreModal).to.eql(false);
        expect(listingClick.showingReturnerModal).to.eql(true);
      });
    });

    describe('MARK_MODAL_LISTING_CLICK_TIMESTAMP', () => {
      it('should set `lastModalClick` to whatever was passed in', () => {
        const { store } = getStore({ listingClick: DEFAULT });
        const clickTime = Date.now();
        store.dispatch({
          type: xpromoActions.MARK_MODAL_LISTING_CLICK_TIMESTAMP,
          clickTime,
        });
        const { listingClick } = store.getState();
        expect(listingClick.lastModalClick).to.eql(clickTime);
      });
    });

    describe('LISTING_CLICK_MODAL_HIDDEN', () => {
      it('should clear all state set by `xpromoListingClickModalActivated()`', () => {
        const { store } = getStore({ listingClick: DEFAULT });
        const listingClickType = 'title';
        const postId = 'abcd';
        // sets active, clickInfo, and showingAppStoreModal
        store.dispatch(xpromoActions.xpromoListingClickModalActivated({ listingClickType, postId }));

        // clear it and test
        store.dispatch(xpromoActions.listingClickModalHidden());
        const { listingClick } = store.getState();
        expect(listingClick).to.eql(DEFAULT);
      });

      it('should clear all state set by `xpromoListingClickReturnerModalActivated`', () => {
        const { store } = getStore({ listingClick: DEFAULT });

        // sets active and showingReturnerModal
        store.dispatch(xpromoActions.xpromoListingClickReturnerModalActivated());

        // clear it and test
        store.dispatch(xpromoActions.listingClickModalHidden());
        const { listingClick } = store.getState();
        expect(listingClick).to.eql(DEFAULT);
      });
    });
  });
});
