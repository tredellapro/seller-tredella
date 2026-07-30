'use client';
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { SessionProvider } from 'next-auth/react';
interface ProvidersProps {
  children: ReactNode;
}

const Customprovider: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <SessionProvider>{children}</SessionProvider>
    </Provider>
  );
};

export default Customprovider;
