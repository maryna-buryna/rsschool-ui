import * as React from 'react';
import * as fetch from 'isomorphic-fetch';
import LoadingScreen from './LoadingScreen';
import Router from 'next/router';

import '../index.scss';

export interface Session {
  id: number;
  githubId: string;
  roles: { [key: number]: 'student' | 'mentor' };
}

type State = {
  session?: Session;
  isLoading: boolean;
};

let sessionCache: Session | undefined;

function withSession(WrappedComponent: React.ComponentType<any>) {
  return class extends React.Component<any, State> {
    state: State = {
      isLoading: false,
      session: undefined,
    };

    constructor(props: any) {
      super(props);
    }

    async componentDidMount() {
      if (sessionCache != null) {
        this.setState({ session: sessionCache });
        return;
      }
      this.setState({ isLoading: true });
      const response = await fetch(`/api/session`, {
        credentials: 'same-origin',
      });
      this.setState({ isLoading: false });
      if (!response.ok) {
        Router.push('/login');
        return;
      }
      const json = await response.json();
      sessionCache = json.data;
      this.setState({ session: sessionCache });
    }

    render() {
      if (this.state.isLoading) {
        return <LoadingScreen />;
      }
      return <WrappedComponent session={this.state.session} {...this.props} />;
    }
  };
}

export default withSession;
