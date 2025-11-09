import '../styles/globals.css'; // アプリ全体で共通して使うCSSを読み込む
import type { AppProps } from 'next/app'; // Next.js が提供する型定義（ページコンポーネント用）

// MyApp は全ページをラップする「共通のルートコンポーネント」
// ページを切り替えてもこのコンポーネントは再描画されない
export default function MyApp({ Component, pageProps }: AppProps) {
  // Component: 表示すべきページそのもの
  // pageProps: getStaticProps/getServerSideProps などで渡されたデータ
  return <Component {...pageProps} />;
}
