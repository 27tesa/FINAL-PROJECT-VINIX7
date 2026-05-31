import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 lg:p-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-red-200 p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-gray-900 font-medium mb-2">Terjadi Kesalahan</h3>
              <p className="text-gray-500 text-sm mb-4">{this.state.error?.message || "Halaman tidak dapat dimuat. Silakan coba lagi."}</p>
              <button
                onClick={this.reset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export function LoadingFallback() {
  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-40 bg-gray-200 rounded mt-4"></div>
        </div>
      </div>
    </div>
  );
}
