import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/shadcn';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          componentName={this.props.componentName}
          onReset={this.handleReset}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  componentName?: string;
  onReset?: () => void;
  onReload?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  componentName,
  onReset,
  onReload,
}) => {
  const isDev = import.meta.env.DEV;

  return (
    <div className="error-fallback">
      <div className="error-fallback__container">
        <div className="error-fallback__icon">
          <AlertTriangle size={48} />
        </div>

        <h2 className="error-fallback__title">Something went wrong</h2>

        {componentName && (
          <p className="error-fallback__component">
            Error in: <code>{componentName}</code>
          </p>
        )}

        <p className="error-fallback__message">
          An unexpected error occurred. You can try resetting this section or reloading the page.
        </p>

        {isDev && error && (
          <details className="error-fallback__details">
            <summary>Error Details (Development Only)</summary>
            <pre className="error-fallback__stack">
              {error.name}: {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="error-fallback__actions">
          {onReset && (
            <Button variant="heroic" onClick={onReset}>
              <RefreshCw size={16} />
              Try Again
            </Button>
          )}
          {onReload && (
            <Button variant="outline" onClick={onReload}>
              <Home size={16} />
              Reload Page
            </Button>
          )}
        </div>
      </div>

      <style>{`
        .error-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          padding: 2rem;
          background: var(--bg-secondary, #1a1a2e);
          border-radius: 8px;
          border: 1px solid var(--border-color, #333);
        }

        .error-fallback__container {
          max-width: 500px;
          text-align: center;
        }

        .error-fallback__icon {
          color: var(--error, #ef4444);
          margin-bottom: 1rem;
        }

        .error-fallback__title {
          color: var(--text-primary, #fff);
          font-size: 1.5rem;
          margin: 0 0 0.5rem;
          font-family: var(--font-display, 'Cinzel', serif);
        }

        .error-fallback__component {
          color: var(--text-secondary, #888);
          font-size: 0.875rem;
          margin: 0 0 1rem;
        }

        .error-fallback__component code {
          background: var(--bg-tertiary, #252538);
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
        }

        .error-fallback__message {
          color: var(--text-secondary, #aaa);
          font-size: 0.9375rem;
          margin: 0 0 1.5rem;
          line-height: 1.5;
        }

        .error-fallback__details {
          text-align: left;
          margin-bottom: 1.5rem;
          background: var(--bg-tertiary, #252538);
          border-radius: 8px;
          padding: 1rem;
        }

        .error-fallback__details summary {
          cursor: pointer;
          color: var(--text-secondary, #888);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .error-fallback__stack {
          font-size: 0.75rem;
          color: var(--error, #ef4444);
          overflow: auto;
          max-height: 200px;
          padding: 0.5rem;
          background: var(--bg-primary, #0d0d1a);
          border-radius: 4px;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .error-fallback__actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .error-fallback__actions button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default ErrorBoundary;
