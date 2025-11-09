import React from 'react';
import { Error404 } from '../components/notFound/Error404';
import { ErrorMessage } from '../components/notFound/errorMessage';
import { Help } from '../components/notFound/help';
import { Background } from '../components/notFound/background';
import { Buttons } from '../components/notFound/buttons';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <Background />
      <div className="relative z-10 max-w-2xl w-full text-center">
        <Error404 />
        <ErrorMessage />
        <Buttons />
        <Help />
      </div>
    </div>
  );
};
