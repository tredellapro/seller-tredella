'use client';

import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';
import { store } from '../store';
import client from 'config/apolloClient';

interface ProvidersProps {
  children: ReactNode;
}

/* The session is the backend's own JWT held in a cookie (see lib/token), so
   there is no second session layer here — Apollo attaches it per request. */
const Customprovider: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </Provider>
  );
};

export default Customprovider;
