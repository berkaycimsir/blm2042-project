// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';

import type { AppProps } from 'next/app';
import { createTheme, MantineProvider } from '@mantine/core';
import { Quicksand } from 'next/font/google';
import { api } from '~/utils/api';
import DashboardLayout from '~/layouts/dashboard';
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';

const quicksand = Quicksand({
  variable: '--quicksand',
  subsets: ['latin'],
  weight: '600',
});

const theme = createTheme({
  focusRing: 'never',
  fontFamily: quicksand.style.fontFamily,
});

function App({ Component, pageProps, router }: AppProps) {
  if (router.pathname.includes('/dashboard')) {
    return (
      <MantineProvider theme={theme}>
        <Notifications />
        <DashboardLayout>
          <Component {...pageProps} />
        </DashboardLayout>
      </MantineProvider>
    );
  }
  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <Notifications />
      <Component {...pageProps} />
    </MantineProvider>
  );
}

export default api.withTRPC(App);
