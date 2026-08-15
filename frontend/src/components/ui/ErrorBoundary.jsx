import React, { Component } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
          <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertOctagon className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900">Application Error Encountered</h2>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              An unexpected UI component error occurred. Don't worry, your cloud cover data and profile are completely safe.
            </p>
            <div className="pt-2">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006A4E] text-white text-xs font-bold rounded-lg hover:bg-[#005540] transition-all cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
