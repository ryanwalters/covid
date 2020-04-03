import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en-us">
        <Head>
          <meta
            name="description"
            content="A visual representation of the status of the total and day-over-day coronavirus (COVID-19) cases in the United States"
          />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link rel="preconnect" href="https://www.google-analytics.com" />
          <script async src="https://www.googletagmanager.com/gtag/js?id=UA-998540-9" />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'UA-998540-9');`,
            }}
          />
          <script data-ad-client="ca-pub-5242524909426428" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
