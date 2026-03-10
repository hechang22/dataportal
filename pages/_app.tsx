import '@/styles/globals.css';
import '@/styles/styles.css';
import { useEffect } from 'react';
import Script from 'next/script';
import Head from 'next/head';
import { useRouter } from 'next/router';

import type { AppProps } from 'next/app';

// 1. 定义你的 GA ID
const GA_TRACKING_ID = 'G-3N9SXTC7GS';

// 2. 手动实现 pageview 函数
const trackPageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // 3. 使用本地函数替代 PortalJS 的 pageview
    const handleRouteChange = (url: string) => {
      trackPageview(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/squared_logo.png" />
      </Head>
      
      {/* 全局 GA 脚本 */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            page_path: window.location.pathname,
          });
        `,
        }}
      />
      <Component {...pageProps} />
    </>
  );
}