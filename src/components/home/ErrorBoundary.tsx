"use client";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error: error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    console.log("ERROR BOUNDARY CAUGHT:", error);
    console.log("COMPONENT STACK:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{ padding: "20px", border: "1px solid red", margin: "10px" }}
        >
          <h3 style={{ color: "red" }}>⚠️ Component Error Detected</h3>
          <details style={{ cursor: "pointer" }}>
            <summary>Error Details (Click to expand)</summary>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "10px",
                overflow: "auto",
              }}
            >
              {this.state.error?.toString()}
            </pre>
            {this.state.errorInfo && (
              <pre
                style={{
                  background: "#f0f0f0",
                  padding: "10px",
                  overflow: "auto",
                }}
              >
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
