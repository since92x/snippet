
/* eslint-disable jsx-a11y/iframe-has-title */
import React from 'react';
import PropTypes from 'prop-types';

class CustomIframe extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
    this.iframeRef = React.createRef();
  }
  componentDidMount = () => {
    window.addEventListener('message', this.onReceiveMessage, false);
    this.iframeRef.current.addEventListener('load', this.onLoad, false);
  };
  componentWillUnmount = () => {
    window.removeEventListener('message', this.onReceiveMessage, false);
  };
  UNSAFE_componentWillReceiveProps = nextProps => {
    if (
      JSON.stringify(this.props.postMessageData) !==
      JSON.stringify(nextProps.postMessageData)
    ) {
      this.sendMessage(nextProps.postMessageData);
    }
  };
  onReceiveMessage = event => {
    const { handleReceiveMessage } = this.props;
    handleReceiveMessage && handleReceiveMessage(event);
  };
  autoResize() {
    const target = this.iframeRef.current;
    target.style.width =
      target.contentWindow.top.document.body.scrollWidth + 'px';
    target.style.height =
      target.contentWindow.top.document.body.scrollHeight + 'px';
  }
  onLoad = () => {
    const { handleReady, autoResize } = this.props;
    autoResize && this.autoResize();
    handleReady && handleReady();
    this.sendMessage(this.props.postMessageData);
  };
  serializePostMessageData = data => {
    if (!this.props.serializeMessage) return data;
    if (typeof data === 'object') {
      return JSON.stringify(data);
    } else if (typeof data === 'string') {
      return data;
    } else {
      return `${data}`;
    }
  };
  sendMessage = postMessageData => {
    const { targetOrigin } = this.props;
    const serializedData = this.serializePostMessageData(postMessageData);
    this.iframeRef.current.contentWindow.postMessage(
      serializedData,
      targetOrigin
    );
  };
  render() {
    const { classes, attributes } = this.props;
    const defaultAttributes = {
      title: `iframe${new Date().getTime()}`,
      allowFullScreen: false,
      frameBorder: 0,
      scrolling: 'auto',
    };
    const mergedAttributes = { ...defaultAttributes, ...attributes };
    return (
      <iframe
        ref={this.iframeRef}
        className={classes.iframe}
        {...mergedAttributes}>
        <p>Your browser does not support iframes.</p>
      </iframe>
    );
  }
}

CustomIframe.defaultProps = {
  autoResize: false,
  serializeMessage: false,
  targetOrigin: '*',
  postMessageData: '',
};

CustomIframe.propTypes = {
  classes: PropTypes.object.isRequired,
  attributes: PropTypes.shape({
    allowFullScreen: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    frameBorder: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    scrolling: PropTypes.string,
    sandbox: PropTypes.string,
    srcDoc: PropTypes.string,
    src: PropTypes.string.isRequired,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  handleReceiveMessage: PropTypes.func,
  handleReady: PropTypes.func,
  autoResize: PropTypes.bool,
  postMessageData: PropTypes.any.isRequired,
  serializeMessage: PropTypes.bool,
  targetOrigin: PropTypes.string,
};

export default CustomIframe;
