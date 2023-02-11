import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { AppContext } from "../components/AppContext";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppContext>
      <Component {...pageProps} />
    </AppContext>
  );
}

export default MyApp;