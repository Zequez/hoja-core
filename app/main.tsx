import './styles';
import { render } from 'preact';
import App from './App';
import { AuthWrapper } from './components/Auth';

if (import.meta.env.DEV) {
  const hostnameParts = location.hostname.split('.');
  if (hostnameParts.length > 1) {
    window.location.href = `${location.protocol}//${hostnameParts.slice(1)}:${location.port}${
      location.pathname
    }`;
  }
}

const container = document.getElementById('root');
if (!(container instanceof HTMLElement)) throw 'No root';
render(
  <AuthWrapper>
    <App />
  </AuthWrapper>,
  container,
);
