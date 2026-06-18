import React from "react";
import { AlertOctagon, RotateCw } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
          <Card className="max-w-md w-full border-rose-100 bg-white p-6 text-center space-y-4">
            <div className="mx-auto h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
              <AlertOctagon size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Something went wrong</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              An unexpected error occurred in the application. Please reload the page to restart the app session.
            </p>
            {this.state.error && (
              <pre className="text-left bg-slate-50 p-3 rounded-lg text-[10px] text-slate-400 font-mono overflow-auto max-h-32 border border-slate-100">
                {this.state.error.toString()}
              </pre>
            )}
            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
                className="w-full justify-center"
              >
                <RotateCw size={14} className="mr-2" />
                Reload Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
