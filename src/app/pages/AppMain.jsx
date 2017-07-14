import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { UrlSwitch, Page } from 'platform/url';
import CommentsPage from './Comments';
import { SUPPORTED_SORTS } from 'app/sortValues';
import { PostsFromSubredditPage } from './PostsFromSubreddit';
import { SavedAndHiddenPage } from './SavedAndHidden';
import { SearchPage } from './SearchPage';
import { SubredditAboutPage } from './SubredditAbout';
import { SubredditRulesPage } from './SubredditRules';
import { UserActivityPage } from './UserActivity';
import { UserProfilePage } from './UserProfile';
import { WikiPage } from './WikiPage';

import DirectMessage from 'app/components/DirectMessage';
import DropdownCover from 'app/components/DropdownCover';
import ErrorPage from 'app/components/ErrorPage';
import Login from 'app/components/Login';
import Messages from 'app/components/Messages';
import MessageThread from 'app/components/MessageThread';
import ModalSwitch from 'app/components/ModalSwitch';
import Place from 'app/components/Place';
import PostSubmitCommunityModal from 'app/components/PostSubmitCommunityModal';
import PostSubmitModal from 'app/components/PostSubmitModal';
import Register from 'app/components/Register';
import Toaster from 'app/components/Toaster';
import NavFrame from 'app/components/NavFrame';

const SORTS = SUPPORTED_SORTS.join('|');

const selector = createSelector(
  state => state.platform.currentPage,
  state => state.toaster.isOpen,
  state => !!state.widgets.tooltip.id,
  state => state.posting.showCaptcha,
  state => !!state.modal.type,
  (
    currentPage,
    isToasterOpen,
    isTooltipOpen,
    isCaptchaOpen,
    isModalOpen,
  ) => {
    return {
      isModalOpen,
      isToasterOpen,
      showDropdownCover: isTooltipOpen || isCaptchaOpen || isModalOpen,
      url: currentPage.url,
      referrer: currentPage.referrer,
      statusCode: currentPage.status,
    };
  }
);

const makeFramed = Component => props => (
  <NavFrame>
    <Component { ...props } />
  </NavFrame>
);

const FramedPostsFromSubredditPage = makeFramed(PostsFromSubredditPage);
const FramedPlace = makeFramed(Place);
const FramedCommentsPage = makeFramed(CommentsPage);
const FramedSearchPage = makeFramed(SearchPage);
const FramedSubredditAboutPage = makeFramed(SubredditAboutPage);
const FramedSubredditRulesPage = makeFramed(SubredditRulesPage);
const FramedWikiPage = makeFramed(WikiPage);
const FramedUserActivityPage = makeFramed(UserActivityPage);
const FramedUserProfilePage = makeFramed(UserProfilePage);
const FramedSavedAndHiddenPage = makeFramed(SavedAndHiddenPage);
const FramedDirectMessage = makeFramed(DirectMessage);
const FramedMessages = makeFramed(Messages);

const AppMain = props => {

  const {
    statusCode,
    url,
    referrer,
    isToasterOpen,
    isModalOpen,
    showDropdownCover,
  } = props;

  if (statusCode !== 200) {
    return (
      <div className='AppMainPage'>
        <NavFrame>
          <ErrorPage status={ statusCode } url={ url } referrer={ referrer } />
        </NavFrame>
      </div>
    );
  }

  return (
    <div className='AppMainPage'>
      <UrlSwitch>
        <Page url='/login' component={ Login } />
        <Page url='/register' component={ Register } />
        <Page url='/message/messages/:threadId' component={ MessageThread } />
        <Page url='/r/:subredditName/submit' component={ PostSubmitModal } />
        <Page url='/submit' component={ PostSubmitModal } />
        <Page url='/submit/to_community' component={ PostSubmitCommunityModal } />
        <Page url='/' component={ FramedPostsFromSubredditPage } />
        <Page url='/place' component={ FramedPlace } />
        <Page url='/r/:subredditName(place)' component={ FramedPlace } />
        <Page url='/r/:subredditName' component={ FramedPostsFromSubredditPage } />
        <Page
          url={ `/r/:subredditName(place)/:sort(${SORTS})` }
          component={ FramedPlace }
        />
        <Page
          url={ `/r/:subredditName/:sort(${SORTS})` }
          component={ FramedPostsFromSubredditPage }
        />
        <Page
          url='/r/:subredditName/comments/:postId/comment/:commentId'
          component={ FramedCommentsPage }
        />
        <Page
          url='/r/:subredditName/comments/:postId/:postTitle/:commentId'
          component={ FramedCommentsPage }
        />
        <Page
          url='/r/:subredditName/comments/:postId/:postTitle?'
          component={ FramedCommentsPage }
        />
        <Page url='/search' component={ FramedSearchPage } />
        <Page url='/r/:subredditName/search' component={ FramedSearchPage } />
        <Page url='/r/:subredditName/about' component={ FramedSubredditAboutPage } />
        <Page url='/r/:subredditName/about/rules' component={ FramedSubredditRulesPage } />
        <Page url='/r/:subredditName/(w|wiki)/:path(.*)?' component={ FramedWikiPage } />
        <Page url='/(help|w|wiki)/:path(.*)?' component={ FramedWikiPage } />
        <Page
          url='/comments/:postId/:postTitle/:commentId'
          component={ FramedCommentsPage }
        />
        <Page url='/comments/:postId/:postTitle?' component={ FramedCommentsPage } />
        <Page url='/user/:userName/activity' component={ FramedUserActivityPage } />
        <Page url='/user/:userName/comments' component={ FramedUserActivityPage } />
        <Page url='/user/:userName/submitted' component={ FramedUserActivityPage } />
        <Page url='/user/:userName' component={ FramedUserActivityPage } />
        <Page url='/user/:userName/gild' component={ FramedUserProfilePage } />
        <Page
          url='/user/:userName/:savedOrHidden(saved|hidden)'
          component={ FramedSavedAndHiddenPage }
        />
        <Page url='/user/:userName/about' component={ FramedUserProfilePage } />
        <Page
          url='/user/:userName/comments/:postId/:postTitle/:commentId'
          component={ FramedCommentsPage }
        />
        <Page
          url='/user/:userName/comments/:postId/:postTitle?'
          component={ FramedCommentsPage }
        />
        <Page url='/message/compose' component={ FramedDirectMessage } />
        <Page url='/message/:mailType' component={ FramedMessages } />
      </UrlSwitch>
      { showDropdownCover ? <DropdownCover /> : null }
      { isToasterOpen ? <Toaster /> : null }
      { isModalOpen ? <ModalSwitch /> : null }
    </div>
  );
};

export default connect(selector)(AppMain);
