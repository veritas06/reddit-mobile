import React, { PropTypes as T } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import classNames from 'lib/classNames';
import getSubreddit from 'lib/getSubredditFromState';
import createBannerProperties from 'lib/createBannerProperties';
import {
  defineSlot,
  destroySlot,
  getSlotId,
} from 'lib/dfp';
import deferUntilMount from 'lib/deferUntilMount';
import './style.less';


class BannerAd extends React.Component {
  adSlot = null;
  frame = null

  static defaultProps = {
    sizes: [[320, 50]],
  };

  defineSlot() {
    const {
      id,
      slot,
      properties,
      sizes,
      shouldCollapse,
      a9,
    } = this.props;

    this.destroySlot();

    defineSlot(this.frame, {
      id,
      slot,
      properties,
      shouldCollapse,
      sizes,
      a9,
    });
  }

  destroySlot() {
    destroySlot(this.props.slot);
  }

  componentDidMount() {
    this.defineSlot();
  }

  componentDidUpdate() {
    this.defineSlot();
  }

  componentWillReceiveProps(nextProps) {
    const compactChanged = nextProps.compact !== this.props.compact;
    const themeChanged = nextProps.theme !== this.props.theme;
    if (compactChanged || themeChanged) {
      this.destroySlot();
    }
  }

  componentWillUnmount() {
    this.destroySlot();
  }

  shouldComponentUpdate(nextProps) {
    return (this.props.slot !== nextProps.slot || !this.adSlot);
  }

  render() {
    const { id, slot, hideAds } = this.props;
    if (!slot || hideAds) {
      return null;
    }

    return (
      <div
        data-slot={ slot }
        className={ classNames('BannerAd', {
          'BannerAd__320x50': !this.props.sizes.includes('fluid'),
          'BannerAd__fluid': this.props.sizes.includes('fluid'),
        }) }
      >
        <div ref={ ref => { this.frame = ref; } } id={ id }></div>
      </div>
    );
  }
}

BannerAd.propTypes = {
  id: T.string,
  properties: T.object,
  shouldCollapse: T.bool,
  sizes: T.array,
  slot: T.string,
  a9: T.bool,
};

const subredditSelector = (state) => {
  const subredditName = getSubreddit(state) || '';
  return state.subreddits[subredditName.toLowerCase()];
};

const selector = createStructuredSelector({
  hideAds: state => state.preferences.hideAds,
  theme: state => state.theme,
  compact: state => state.compact,
  properties: (state, ownProps) => {
    const currentPage = state.platform.currentPage;
    if (!currentPage) {
      return {};
    }

    return createBannerProperties(
      ownProps.placement,
      state.user,
      subredditSelector(state, ownProps),
      state.theme,
      state.compact,
    );
  },
  slot: (state, ownProps) => {
    const subredditName = getSubreddit(state);
    return getSlotId(ownProps.listingName, subredditName);
  },
});

export default connect(selector)(deferUntilMount(BannerAd));
