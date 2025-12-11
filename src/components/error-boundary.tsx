'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary component for catching React rendering errors
 * Provides a fallback UI and retry functionality
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to error reporting service (e.g., Sentry)
        console.error('Error Boundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        We encountered an unexpected error. Please try again or refresh the page.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={this.handleRetry} variant="default">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Refresh Page
                        </Button>
                    </div>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <pre className="mt-6 p-4 bg-muted rounded-lg text-left text-xs overflow-auto max-w-full">
                            {this.state.error.message}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
