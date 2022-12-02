import { GoAHeroBanner } from '@abgov/react-components';
import React, { FunctionComponent } from 'react';
import styles from './app.module.scss';

export const Landing: FunctionComponent = () => {
  return (
    <>
      <GoAHeroBanner
        heading="Quick start of a digital service"
        backgroundUrl={'../assets/banner.jpg'}
      />
      <main>
        <section>
          <h2>Welcome to opportunity-intake-app!</h2>
          <p>
            Don't panic. Start editing the project to build your digital
            service.
          </p>
          <h3>A few things you might want to do next:</h3>
        </section>
      </main>
    </>
  );
};
