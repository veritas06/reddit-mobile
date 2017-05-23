/**
 * @module {function} xpromo
 * @memberof app/reducers
 *
 * This reducer managers all of the xpromo related state of the application.
 * It can be thought of as the `root` reducer for xpromo; combines interstitials
 * and listingClick reducers that manage their own specific xpromo state.
 */
import { combineReducers } from 'redux';

import interstitials from './interstitials';
import listingClick from './listingClick';
import persistent from './persistent';
import serverSide from './serverSide';

export default combineReducers({
  interstitials,
  listingClick,
  persistent,
  serverSide,
});
