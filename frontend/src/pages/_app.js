import { Toaster } from 'react-hot-toast';
import { WalletProvider } from '../context/WalletContext';
import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <WalletProvider>
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#132538',
              color: '#EDEAE2',
              border: '1px solid #1B3349',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '13px',
            },
          }}
        />
      </AuthProvider>
    </WalletProvider>
  );
}
