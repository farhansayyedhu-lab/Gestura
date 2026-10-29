import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Error boundary to catch runtime crashes and display them instead of blank screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App crash:', error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#080d1a',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '700px',
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '2rem',
          }}>
            <h1 style={{ color: '#f87171', marginBottom: '1rem', fontSize: '1.1rem' }}>
              ⚠ Application Error
            </h1>
            <pre style={{
              textAlign: 'left',
              background: '#020617',
              padding: '1rem',
              borderRadius: '6px',
              overflow: 'auto',
              fontSize: '0.75rem',
              color: '#fca5a5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.info?.componentStack}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null, info: null })}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1.5rem',
                background: '#1d4ed8',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
