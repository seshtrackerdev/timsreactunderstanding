// src/App.tsx

import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import cloudflareLogo from "./assets/Cloudflare_Logo.svg";
import honoLogo from "./assets/hono.svg";
import "./App.css";

interface ApiResponse {
  data: Record<string, unknown>;
  status: number;
  error?: string;
}

interface TokenStatus {
  isValid: boolean;
  isChecking: boolean;
  message: string;
}

function App() {
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({});
  const [echoInput, setEchoInput] = useState('{"message": "Hello API!"}');
  const [statusCode, setStatusCode] = useState("200");
  const [apiToken, setApiToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    isValid: false,
    isChecking: false,
    message: "Token not set ❌"
  });
  const [protectedData, setProtectedData] = useState('{"secretMessage": "Top Secret"}');

  const validateToken = async (token: string) => {
    if (!token.trim()) {
      setTokenStatus({
        isValid: false,
        isChecking: false,
        message: "Token not set ❌"
      });
      return;
    }

    setTokenStatus(prev => ({ ...prev, isChecking: true, message: "Checking token..." }));

    try {
      const response = await fetch("/api/protected/secret", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTokenStatus({
          isValid: true,
          isChecking: false,
          message: "Token valid ✅"
        });
      } else {
        const data = await response.json();
        setTokenStatus({
          isValid: false,
          isChecking: false,
          message: `Invalid token: ${data.error} ❌`
        });
      }
    } catch (error) {
      setTokenStatus({
        isValid: false,
        isChecking: false,
        message: "Error validating token ❌"
      });
    }
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newToken = e.target.value;
    setApiToken(newToken);
    if (newToken.trim()) {
      validateToken(newToken);
    } else {
      setTokenStatus({
        isValid: false,
        isChecking: false,
        message: "Token not set ❌"
      });
    }
  };

  const testEndpoint = async (endpoint: string, method: string = "GET", body?: Record<string, unknown>, useAuth = false) => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (useAuth) {
        if (!tokenStatus.isValid) {
          setResponses(prev => ({
            ...prev,
            [endpoint]: {
              data: { error: "Please set a valid API token first" },
              status: 401,
            },
          }));
          return;
        }
        headers["Authorization"] = `Bearer ${apiToken}`;
      }

      const response = await fetch(`/api${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const data = await response.json();
      setResponses(prev => ({
        ...prev,
        [endpoint]: {
          data,
          status: response.status,
        },
      }));
    } catch (error) {
      setResponses(prev => ({
        ...prev,
        [endpoint]: {
          data: {},
          status: 500,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        },
      }));
    }
  };

  const formatResponse = (response?: ApiResponse) => {
    if (!response) return "No response yet";
    if (response.error) return `Error: ${response.error}`;
    return JSON.stringify(response.data, null, 2);
  };

  return (
    <>
      <div className="header">
        <div className="logo-container">
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
          <a href="https://hono.dev/" target="_blank">
            <img src={honoLogo} className="logo cloudflare" alt="Hono logo" />
          </a>
          <a href="https://workers.cloudflare.com/" target="_blank">
            <img src={cloudflareLogo} className="logo cloudflare" alt="Cloudflare logo" />
          </a>
        </div>
        <h1>TimmyAPI Tester</h1>
      </div>

      <div className="api-container">
        <section className={`endpoint-section auth-section ${tokenStatus.isValid ? 'auth-valid' : 'auth-invalid'}`}>
          <h2 className="endpoint-title">Authentication</h2>
          <p className="endpoint-description">Set your API token for protected endpoints</p>
          <input
            type="password"
            value={apiToken}
            onChange={handleTokenChange}
            placeholder="Enter your API token"
            className="input-field"
          />
          <p className={`endpoint-note ${tokenStatus.isValid ? 'status-success' : 'status-error'}`}>
            {tokenStatus.isChecking ? (
              <span className="loading">Validating token...</span>
            ) : (
              tokenStatus.message
            )}
          </p>
        </section>

        <section className="endpoint-section">
          <h2 className="endpoint-title">Basic GET Endpoint</h2>
          <p className="endpoint-description">Simple endpoint that returns a name</p>
          <button onClick={() => testEndpoint("/")}>
            Test GET /api/
          </button>
          <div className="response-display">
            <span className="response-label">Response:</span>
            {formatResponse(responses["/"])}
          </div>
        </section>

        <section className="endpoint-section">
          <h2 className="endpoint-title">Echo Endpoint</h2>
          <p className="endpoint-description">POST endpoint that returns the sent data</p>
          <input
            type="text"
            value={echoInput}
            onChange={(e) => setEchoInput(e.target.value)}
            className="input-field"
          />
          <button onClick={() => testEndpoint("/echo", "POST", JSON.parse(echoInput))}>
            Test POST /api/echo
          </button>
          <div className="response-display">
            <span className="response-label">Response:</span>
            {formatResponse(responses["/echo"])}
          </div>
        </section>

        <section className="endpoint-section">
          <h2 className="endpoint-title">Status Code Tester</h2>
          <p className="endpoint-description">Test different HTTP status codes</p>
          <input
            type="number"
            value={statusCode}
            onChange={(e) => setStatusCode(e.target.value)}
            className="input-field"
            min="200"
            max="500"
          />
          <button onClick={() => testEndpoint(`/status/${statusCode}`)}>
            Test GET /api/status/{statusCode}
          </button>
          <div className="response-display">
            <span className="response-label">Response:</span>
            {formatResponse(responses[`/status/${statusCode}`])}
          </div>
        </section>

        <section className="endpoint-section">
          <h2 className="endpoint-title">Request Info</h2>
          <p className="endpoint-description">Get detailed information about the request</p>
          <button onClick={() => testEndpoint("/request-info")}>
            Test GET /api/request-info
          </button>
          <div className="response-display">
            <span className="response-label">Response:</span>
            {formatResponse(responses["/request-info"])}
          </div>
        </section>

        <section className={`endpoint-section protected-section ${!tokenStatus.isValid ? 'protected-locked' : ''}`}>
          <h2 className="endpoint-title">Protected Secret (Requires Token)</h2>
          <p className="endpoint-description">Access protected endpoint with your API token</p>
          <button 
            onClick={() => testEndpoint("/protected/secret", "GET", undefined, true)}
            disabled={!tokenStatus.isValid}
          >
            Test GET /api/protected/secret
          </button>
          <div className="response-display">
            <span className="response-label">Response:</span>
            {formatResponse(responses["/protected/secret"])}
          </div>
        </section>

        <section className={`endpoint-section protected-section ${!tokenStatus.isValid ? 'protected-locked' : ''}`}>
          <h2 className="endpoint-title">Protected Data (Requires Token)</h2>
          <p className="endpoint-description">Send data to protected endpoint</p>
          <input
            type="text"
            value={protectedData}
            onChange={(e) => setProtectedData(e.target.value)}
            className="input-field"
            disabled={!tokenStatus.isValid}
          />
          <button 
            onClick={() => testEndpoint("/protected/data", "POST", JSON.parse(protectedData), true)}
            disabled={!tokenStatus.isValid}
          >
            Test POST /api/protected/data
          </button>
          <div className="response-display">
            <span className="response-label">Response:</span>
            {formatResponse(responses["/protected/data"])}
          </div>
        </section>
      </div>
    </>
  );
}

export default App;
