import React from 'react';
import dashjs from 'dashjs';
import { debounce } from 'lodash';
import './styles.less';
import PostModel from 'apiClient/models/PostModel';
import { trackVideoEvent } from 'app/actions/posts';
import { connect } from 'react-redux';
import { VIDEO_EVENT } from 'app/constants';
import { createSelector } from 'reselect';
import { isCommentsPage } from 'platform/pageUtils';

const T = React.PropTypes;

class HTML5StreamPlayer extends React.Component {
  static propTypes = {
    // ownProps
    hlsSource: T.string.isRequired,
    mpegDashSource: T.string.isRequired,
    aspectRatioClassname: T.string.isRequired,
    postData: T.instanceOf(PostModel),
    onUpdatePostPlaytime: T.func.isRequired,
    scrubberThumbSource: T.string.isRequired,
    isGif: T.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      videoPaused: false,
      videoScrollPaused: true,
      videoMuted: true,
      videoPosition: 0,
      videoEnded: false,
      videoFullScreen: false,
      debounceFunc: null,
      videoInView: false,
      currentTime: '00:00',
      totalTime: '00:00',
      currentlyScrubbing: false,
      scrubPosition: 0,
      thumbPosition: 0,
      mediaPlayer: null,
      videoLoaded: false,
      autoPlay: true,
      lastUpdate: null,
      totalServedTime: 0,
    };
  }

  getMobileOperatingSystem() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
      return 'Android';
    }
    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'iOS';
    }

    return 'unknown';
  }

  isIOS() {
    return (this.getMobileOperatingSystem() === 'iOS');
  }

  isAndroid() {
    return (this.getMobileOperatingSystem() === 'Android');
  }

  isScrolledIntoView = () => {
    if (!this.state.videoScrollPaused || this.state.videoFullScreen) {
      return;
    }

    const videoContainer = this.refs.HTML5StreamPlayerContainer;

    const elemTop = videoContainer.getBoundingClientRect().top;
    const elemBottom = videoContainer.getBoundingClientRect().bottom;

    const totalVideoHeight = elemBottom - elemTop;
    let videoHeight;
    if (elemTop < 0) {
      videoHeight = elemBottom;
    } else if (elemBottom > window.innerHeight) {
      videoHeight = innerHeight - elemTop;
    } else {
      videoHeight = totalVideoHeight;
    }

    let videoIsInView = false;
    if ((videoHeight / totalVideoHeight) > 0.5) {
      videoIsInView = true;
    }

    if (this.state.videoInView !== videoIsInView) {
      const video = this.refs.HTML5StreamPlayerVideo;
      if (videoIsInView) {
        if (video.paused && !window.fullScreen) {
          video.play();
          this.sendTrackVideoEvent(VIDEO_EVENT.SCROLL_AUTOPLAY);
        }
      } else {
        if (!video.paused) {
          video.pause();
          this.sendTrackVideoEvent(VIDEO_EVENT.SCROLL_PAUSE);
        }
      }

      this.setState({videoInView: videoIsInView, videoScrollPaused: true});
    }
  }

  secondsToMinutes(seconds) {
    let minutes = Math.floor(seconds/60).toString();
    let seconds2 = Math.trunc(seconds%60).toString();

    if (minutes.length === 1) { minutes = `0${minutes}`; }
    if (seconds2.length === 1) { seconds2 = `0${seconds2}`; }

    return `${minutes}:${seconds2}`;
  }

  videoDidLoad = () => {
    if (this) {
      this.setState({videoLoaded: true});
      this.isScrolledIntoView();

      const video = this.refs.HTML5StreamPlayerVideo;
      if ((this.props.postData.videoPlaytime > 0) && (video.paused === false)) {
        this.setState({totalServedTime: this.props.postData.videoPlaytime * 1000.0});
        this.sendTrackVideoEvent(VIDEO_EVENT.CHANGED_PAGETYPE, this.getPercentServed());
      }
    }
  }

  componentDidMount() {
    //if non-hls compatible browser, initialize dashjs media player (dash.js handles this check automatically).
    const video = this.refs.HTML5StreamPlayerVideo;
    const player = dashjs.MediaPlayerFactory.create(video);

    document.addEventListener('webkitfullscreenchange', this.exitHandler, false);
    document.addEventListener('mozfullscreenchange', this.exitHandler, false);
    document.addEventListener('fullscreenchange', this.exitHandler, false);
    document.addEventListener('MSFullscreenChange', this.exitHandler, false);

    video.addEventListener('canplay', this.videoDidLoad, false);
    //draw initial buffer background (null video);
    this.drawBufferBar();

    const debounceFunc = debounce(this.isScrolledIntoView, 50);
    window.addEventListener('scroll', debounceFunc);

    //store function handler for removal
    this.setState({debounceFunc, mediaPlayer: player});

    if (this.props.postData.videoPlaytime) {
      video.currentTime = this.props.postData.videoPlaytime;
      if (this.state.autoPlay && this.state.paused) {
        this.playPauseVideo();
      }
    }
  }

  componentWillMount() {
    //if video has a previous time position, prevent autoplay, this stops the video from continuing unintentionally on report modal open/close
    if (this.props.postData.videoPlaytime) {
      this.setState({autoPlay: false});
    }
  }

  componentWillUnmount() {
    if (this.state.totalServedTime > 0) {
      //Video has been watched and we are now removing it.
      this.sendTrackVideoEvent(VIDEO_EVENT.SERVED_VIDEO, this.getPercentServed());
    }
    const video = this.refs.HTML5StreamPlayerVideo;
    video.removeEventListener('canplay', this.videoDidLoad, false);
    window.removeEventListener('scroll', this.state.debounceFunc);

    document.removeEventListener('webkitfullscreenchange', this.exitHandler, false);
    document.removeEventListener('mozfullscreenchange', this.exitHandler, false);
    document.removeEventListener('fullscreenchange', this.exitHandler, false);
    document.removeEventListener('MSFullscreenChange', this.exitHandler, false);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.videoFullScreen !== this.state.videoFullScreen) {
      //Entered or exited fullscreen, send page type event
      this.sendTrackVideoEvent(VIDEO_EVENT.CHANGED_PAGETYPE, this.getPercentServed());
    }
  }

  playPauseVideo = () => {
    const video = this.refs.HTML5StreamPlayerVideo;

    if (video.paused) {
      video.play();
      if (this.state.videoEnded) {
        this.sendTrackVideoEvent(VIDEO_EVENT.REPLAY);
      } else {
        this.sendTrackVideoEvent(VIDEO_EVENT.PLAY);
      }
      this.setState({videoPaused: false, videoScrollPaused: true, videoEnded:false});
    } else if (this.props.isGif) {
      //is gif
      if (this.state.videoFullScreen) {
        this.exitFullscreen();
      } else {
        this.enterFullScreen();
      }
    } else {
      video.pause();
      this.setState({videoPaused: true, videoScrollPaused: false});
      this.sendTrackVideoEvent(VIDEO_EVENT.PAUSE);
    }
  }

  resetVideo = () => {
    const video = this.refs.HTML5StreamPlayerVideo;
    video.currentTime = 0.1;
  }

  exitHandler = () => {
    if (this.state.videoFullScreen === true) {
      this.setState({videoFullScreen: false});
      this.exitFullscreen();
    } else {
      this.setState({videoFullScreen: true});
    }
  }

  exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }

  enterFullScreen = () => {
    //Default to standard video controls in fullscreen for iOS
    let video = this.refs.HTML5StreamPlayerVideo;
    
    if (this.isAndroid()) {
      video = this.refs.HTML5StreamPlayerContainer;
    }

    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    } else if (video.mozRequestFullScreen) {
      video.mozRequestFullScreen(); // Firefox
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen(); // Chrome and Safari
    }

    if (this.state.videoMuted) {
      this.muteVideo();
    }

    this.sendTrackVideoEvent(VIDEO_EVENT.FULLSCREEN);
  }

  muteVideo = () => {
    const video = this.refs.HTML5StreamPlayerVideo;

    if (video.muted) {
      this.sendTrackVideoEvent(VIDEO_EVENT.UNMUTE);
    } else {
      this.sendTrackVideoEvent(VIDEO_EVENT.MUTE);
    }

    video.muted = !video.muted;
    this.setState({videoMuted: video.muted});
  }

  renderMute() {
    //if gif, no mute button
    if (this.props.isGif) {
      return;
    }

    const video = this.refs.HTML5StreamPlayerVideo;
    if ((video && video.muted) || this.state.videoMuted) {
      return (<span className={ 'HTML5StreamPlayer__playback-mute icon icon-mute' } />);
    }

    return (<span className={ 'HTML5StreamPlayer__playback-unmute icon icon-unmute' } />);
  }

  renderPlaybackIcon() {
    if (!this.state.videoLoaded) {
      return null;
    }

    const video = this.refs.HTML5StreamPlayerVideo;

    if (this.state.videoEnded && !this.props.isGif) {
      return (
        <div className={ 'HTML5StreamPlayer__playback-action-circle regular' }>
          <div className={ 'HTML5StreamPlayer__replay-icon-container' }>
            <span className={ 'HTML5StreamPlayer__playback-action-icon white icon icon-replay' } />
          </div>
        </div>
      );
    } else if (video.paused) {
      return (
        <div className={ 'HTML5StreamPlayer__playback-action-circle regular' }>
          <div className={ 'HTML5StreamPlayer__play-icon-container' }>
            <span
              className={ 'HTML5StreamPlayer__playback-action-icon white icon icon-play_triangle' }
            />
          </div>
        </div>
      );
    }
    return null;
  }

  setVideoPos = (event) => {
    const video = this.refs.scrubberThumbnail;
    const bufferBar = this.refs.scrubBuffer;
    const value = event.target.value;
    if (video) {
      video.currentTime = ((video.duration/100) * value).toFixed(1);
    }
    this.setState({
      scrubPosition: value,
      thumbPosition: ((bufferBar.clientWidth-16) * value/100 + 2),
    }); //(bufferWidth - thumb width) //2 == border width
  }

  drawBufferBar(video = null) {

    //no bufferbar for gifs
    if (this.props.isGif) {
      return;
    }

    const bufferBar = this.refs.scrubBuffer;
    const context = bufferBar.getContext('2d');

    //Bufferbar height needs to be set to clientHeight on initial load to prevent blending glitches from canvas stretching (safari).
    if (video === null) {
      bufferBar.height = bufferBar.clientHeight;
    }

    context.fillStyle = '#CCCCCA';
    context.fillRect(0, 0, bufferBar.width, bufferBar.height);

    if (video) {
      context.fillStyle = '#939393';
      context.strokeStyle = '#939393';

      const inc = bufferBar.width / video.duration;
      
      //draw buffering each update
      for (let i = 0; i < video.buffered.length; i++) {
        const startX = video.buffered.start(i) * inc;
        const endX = video.buffered.end(i) * inc;
        const width = endX - startX;

        context.fillRect(startX, 0, width, bufferBar.height);
        context.stroke();
      }
      
      context.fillStyle = '#0DD3BB';
      context.strokeStyle = '#0DD3BB';
      context.fillRect(0, 0, video.currentTime * inc, bufferBar.height);
    }
  }

  updateTime = () => {
    //Create buffer bar for data
    const video = this.refs.HTML5StreamPlayerVideo;
    this.drawBufferBar(video);

    let newTime = this.state.totalServedTime;
    if ((this.state.lastUpdate !== null) && (video.paused === false) && (this.state.wasPlaying === true)) {
      newTime += performance.now() - this.state.lastUpdate;
    }

    if (video.currentTime && video.duration) {
      let isVideoEnded = false;
      if (video.currentTime >= video.duration) {
        if (!this.props.isGif) {
          isVideoEnded = true;
        }
      }
      this.setState({
        videoPosition: ((video.currentTime/video.duration) * 100),
        videoEnded:isVideoEnded,
        currentTime: this.secondsToMinutes(video.currentTime),
        totalTime: this.secondsToMinutes(video.duration),
        lastUpdate: performance.now(),
        totalServedTime: newTime,
        wasPlaying: !video.paused,
      });
      this.props.onUpdatePostPlaytime(video.currentTime);
    }
  }

  renderThumbnail() {
    return (
      <div className = { this.state.currentlyScrubbing ?
        'HTML5StreamPlayer__control__thumbContainer'
        :'HTML5StreamPlayer__control__scrubThumbHidden' }>
        <div
          style = { { left: this.state.thumbPosition } }
          className = { 'HTML5StreamPlayer__control__scrubThumb' }
          ref = { 'scrubberThumbnailContainer' }
        >
          <video
            className = { 'HTML5StreamPlayer__control__scrubVideo' }
            preload = 'metadata'
            autoPlay = { false }
            playsInline = { true }
            muted = { true }
            ref = { 'scrubberThumbnail' }
          >
            <source src={ this.props.scrubberThumbSource } type={ 'video/mp4' }/>
          </video>
        </div>
      </div>
    );  
  }

  scrubEnd = () => {
    const video = this.refs.HTML5StreamPlayerVideo;
    video.currentTime = (video.duration/100) * this.state.scrubPosition;
    this.setState({currentlyScrubbing: false, videoPosition: this.state.scrubPosition});
    this.sendTrackVideoEvent(VIDEO_EVENT.SEEK);
  }

  scrubStart = () => {
    this.setState({currentlyScrubbing: true});
  }

  render() {
    return (
      <div className = { 'HTML5StreamPlayer' } ref='HTML5StreamPlayerContainer'>
        <div
          className = { this.state.videoFullScreen ?
            'HTML5StreamPlayer__videoContainer__fullscreen'
            :'HTML5StreamPlayer__videoContainer' }
        >
          <div
            className = { `HTML5StreamPlayer__videoTrim
              ${this.state.videoFullScreen ?
                '' : this.props.aspectRatioClassname
              }`
            }
          >
            <video
              data-dashjs-player
              loop={ this.props.isGif }
              autoPlay={ false }
              muted={ this.state.videoMuted }
              onTimeUpdate={ this.updateTime }
              preload='metadata'
              playsInline={ true }
              className = { this.state.videoFullScreen ?
                'HTML5StreamPlayer__video__fullscreen'
                : 'HTML5StreamPlayer__video__regular' }
              ref='HTML5StreamPlayerVideo'
            >
              <source src={ this.props.mpegDashSource } type={ 'application/dash+xml' }/>
              <source src={ this.props.hlsSource } type={ 'application/vnd.apple.mpegURL' }/>
            </video>
          </div>
          
          <div className = 'HTML5StreamPlayer__controlPanel' id="html5-video-stream-controls">
            <div className = 'HTML5StreamPlayer__control__play'>
              <button
                className = { 'HTML5StreamPlayer__control__play' }
                onClick = { this.playPauseVideo }
              >
                { this.renderPlaybackIcon() }
              </button>
            </div>

            <div className = 'HTML5StreamPlayer__control__bar'>

              { !this.props.isGif &&
                <div className = 'HTML5StreamPlayer__control__fullscreen'>
                  <button
                    className = 'HTML5StreamPlayer__control'
                    onClick={ this.state.videoFullScreen ?
                      this.exitFullscreen
                      : this.enterFullScreen
                    }
                  >
                    <span
                      className = { this.state.videoFullScreen ?
                        'HTML5StreamPlayer__playback-full-screen-collapse icon icon-full-screen-collapse'
                        : 'HTML5StreamPlayer__playback-full-screen icon icon-full-screen'
                      }
                    />
                  </button>
                </div>
              }

              <div className = 'HTML5StreamPlayer__control__mute'>
                <button className = 'HTML5StreamPlayer__control' onClick = { this.muteVideo }>
                  { this.renderMute() }
                </button>
              </div>

              { !this.props.isGif &&
              <div className = 'HTML5StreamPlayer__control__scrubberContainer'>
                <div className = 'HTML5StreamPlayer__control__barMargin'>    
                  <div className = 'HTML5StreamPlayer__control__timeTotal'>
                    { this.state.totalTime }  
                  </div>

                  <div className = 'HTML5StreamPlayer__control__timeCurrent'>
                    { this.state.currentTime }
                  </div>

                  <canvas
                    ref = 'scrubBuffer'
                    className = { 'HTML5StreamPlayer__control__scrubBar__buffer' }
                  >
                  </canvas>
                  
                  <input
                    type='range'
                    step='any'
                    value = { this.state.currentlyScrubbing ?
                      this.state.scrubPosition
                      : this.state.videoPosition
                    }
                    className = 'HTML5StreamPlayer__control__scrubBar'
                    onChange={ this.setVideoPos }
                    onTouchEnd={ this.scrubEnd }
                    onTouchStart={ this.scrubStart }
                  />

                  { this.renderThumbnail() }
                </div>
              </div>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  buildBaseEventData() {
    const video = this.refs.HTML5StreamPlayerVideo;
    const { postData } = this.props;

    let currentTime = 0;
    let durationTime = 0;
    let isVertical = false;
    let pageType = this.state.videoFullScreen ? 'full_screen' : 'listing';

    if (video) {
      currentTime = parseInt(video.currentTime * 1000);
      durationTime = parseInt(video.duration * 1000);
      isVertical = (video.height > video.width);

      if (isCommentsPage(this.props.currentPage) === true) {
        pageType = 'comments';
      }
    }

    const currentUTC = new Date();
    const currentUTCSeconds = Math.round(currentUTC.getTime() / 1000);
    const msSinceCreation = parseInt((currentUTCSeconds - postData.createdUTC) * 1000);

    let subredditShortID = postData.subredditId;
    //Should always be greater than 3 but just incase.
    if (subredditShortID.length > 3) {
      subredditShortID = subredditShortID.substring(3,(subredditShortID.length - 3));
    }

    const payload = {
      video_time: currentTime,
      video_duration: durationTime,
      vertical: isVertical,
      nsfw: postData.over18,
      spoiler: postData.spoiler,
      app_name: 'mweb',
      target_fullname: postData.uuid,
      target_author_id: parseInt(postData.author, 36),
      target_author_name: postData.author,
      target_created_ts: msSinceCreation,
      target_id: parseInt(postData.id, 36),
      target_url: postData.cleanUrl,
      target_url_domain: postData.domain,
      target_type: (this.state.isGif ? 'gif':'video'),
      sr_name: postData.subreddit,
      sr_fullname: postData.subredditId,
      sr_id: parseInt(subredditShortID, 36),
      page_type: pageType,
    };

    return payload;
  }

  sendTrackVideoEvent(eventType, optionalParams={}) {
    const payload = {
      ...this.buildBaseEventData(),
      ...optionalParams,
    };
    this.props.dispatch(trackVideoEvent(eventType,payload));
  }

  getPercentServed() {
    const video = this.refs.HTML5StreamPlayerVideo;
    let pctServed = 0;
    if (video) {
      let servedTime = this.state.totalServedTime;

      //If we have no served time, video has just loaded (page change etc.) take currentTime as backup.
      if (servedTime === 0) {
        servedTime = video.currentTime;
      }
      pctServed = servedTime / parseInt(video.duration * 1000);
    }
    const payload = {
      max_timestamp_served: parseInt(this.state.totalServedTime),
      percent_served: pctServed,
    };

    return payload;
  }
}

const mapStateToProps = createSelector(
  state => state.platform.currentPage,
  (currentPage) => {
    return { currentPage };
  },
);

export default connect(mapStateToProps)(HTML5StreamPlayer);
