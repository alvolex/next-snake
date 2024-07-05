import { NextPage } from 'next';
import Head from 'next/head';

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Hello World</title>
        <meta name="description" content="A simple Hello World Next.js app" />
      </Head>
      <main>
        <h1>Hello World</h1>
      </main>
    </>
  );
};

export default HomePage;