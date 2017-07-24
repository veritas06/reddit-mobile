import React from 'react';

function deferUntilMount(Comp) {
  return class DeferredRenderer extends React.Component {
    constructor(props) {
      super(props);

      this.state = { mounted: false };
    }

    componentDidMount() {
      this.setState({ mounted: true });
    }

    render() {
      if (!this.state.mounted) {
        return null;
      }

      return <Comp { ...this.props } />;
    }
  };
}

export default deferUntilMount;
