import Head from 'next/head';

import { api } from '~/utils/api';

export default function Home() {
  const hello = api.post.hello.useQuery({ text: 'from tRPC' });

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>hello {hello.data?.greeting}</main>
    </>
  );
}
