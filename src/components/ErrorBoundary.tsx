'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary that catches unhandled React errors
 * and displays a recovery UI instead of crashing the entire app.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development, send to Sentry/error tracker in production
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);

    // TODO: Send to Sentry when integrated
    // Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, system-ui, sans-serif',
            background: '#f2f0eb',
            padding: '2rem',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              textAlign: 'center',
              background: '#fff',
              borderRadius: '12px',
              padding: '3rem 2rem',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '28px',
              }}
            >
              ⚠️
            </div>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 600,
                color: 'rgba(0, 0, 0, 0.87)',
                margin: '0 0 0.75rem',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.58)',
                lineHeight: 1.6,
                margin: '0 0 2rem',
              }}
            >
              We hit an unexpected error. This has been logged and we&apos;re looking into it.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: '#00754A',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                padding: '12px 32px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#006241')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#00754A')}
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                style={{
                  marginTop: '2rem',
                  textAlign: 'left',
                  background: '#FEF2F2',
                  borderRadius: '8px',
                  padding: '1rem',
                }}
              >
                <summary
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#991B1B',
                    cursor: 'pointer',
                    marginBottom: '0.5rem',
                  }}
                >
                  Error Details (dev only)
                </summary>
                <pre
                  style={{
                    fontSize: '11px',
                    color: '#991B1B',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                  }}
                >
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
