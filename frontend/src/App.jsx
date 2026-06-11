import { useState, useCallback, useRef } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import GenderScreen from './components/GenderScreen';
import TemplateScreen from './components/TemplateScreen';
import CameraScreen from './components/CameraScreen';
import LoadingScreen from './components/LoadingScreen';
import ResultScreen from './components/ResultScreen';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [userName, setUserName] = useState('');
  const [gender, setGender] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState('');
  const currentScreenRef = useRef(currentScreen);
  currentScreenRef.current = currentScreen;

  const handleWelcomeSubmit = useCallback(async (name) => {
    try {
      setError('');
      setUserName(name);
      const res = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: name }),
      });
      if (!res.ok) throw new Error('Failed to create session');
      const data = await res.json();
      setSessionId(data.sessionId);
      setCurrentScreen('gender');
    } catch (err) {
      console.error('Session creation error:', err);
      setError('Could not start session. Please try again.');
    }
  }, []);

  const handleGenderSelect = useCallback(async (selectedGender) => {
    try {
      setError('');
      setGender(selectedGender);
      if (sessionId) {
        const res = await fetch(`${API_BASE}/sessions/${sessionId}/gender`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gender: selectedGender }),
        });
        if (!res.ok) throw new Error('Failed to set gender');
      }
      setCurrentScreen('template');
    } catch (err) {
      console.error('Gender update error:', err);
      setError('Something went wrong. Please try again.');
    }
  }, [sessionId]);

  const handleTemplateSelect = useCallback(async (template) => {
    try {
      setError('');
      setSelectedTemplate(template);
      if (sessionId) {
        const res = await fetch(`${API_BASE}/sessions/${sessionId}/template`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId: template.id }),
        });
        if (!res.ok) throw new Error('Failed to set template');
      }
      setCurrentScreen('camera');
    } catch (err) {
      console.error('Template update error:', err);
      setError('Something went wrong. Please try again.');
    }
  }, [sessionId]);

  const handleCapture = useCallback(async (imageBase64) => {
    try {
      setError('');
      setCapturedImage(imageBase64);
      setCurrentScreen('loading');

      if (sessionId) {
        const captureRes = await fetch(`${API_BASE}/sessions/${sessionId}/capture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64 }),
        });
        if (!captureRes.ok) throw new Error('Failed to upload image');

        // Poll for result with a max retry count
        let pollCount = 0;
        const maxPolls = 40; // 40 * 3s = 2 minutes max
        const pollInterval = setInterval(async () => {
          pollCount++;
          try {
            const statusRes = await fetch(`${API_BASE}/sessions/${sessionId}/status`);
            const statusData = await statusRes.json();

            if (statusData.status === 'completed' && statusData.generatedImageUrl) {
              clearInterval(pollInterval);
              setGeneratedImageUrl(statusData.generatedImageUrl);
              setCurrentScreen('result');
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval);
              setError('Image generation failed. Please try again.');
              setCurrentScreen('camera');
            } else if (pollCount >= maxPolls) {
              // Timeout: stop polling and show whatever we have
              clearInterval(pollInterval);
              console.warn('Polling timed out after', maxPolls, 'attempts. Falling back to captured image.');
              if (currentScreenRef.current === 'loading') {
                setGeneratedImageUrl(imageBase64);
                setCurrentScreen('result');
              }
            }
          } catch (pollErr) {
            console.error('Polling error:', pollErr);
            // If polling itself keeps failing, fall back after several errors
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              if (currentScreenRef.current === 'loading') {
                setGeneratedImageUrl(imageBase64);
                setCurrentScreen('result');
              }
            }
          }
        }, 3000);
      } else {
        // Mock mode - no backend
        setTimeout(() => {
          setGeneratedImageUrl(imageBase64);
          setCurrentScreen('result');
        }, 3000);
      }
    } catch (err) {
      console.error('Capture error:', err);
      setError('Failed to process image. Please try again.');
      setCurrentScreen('camera');
    }
  }, [sessionId]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setGeneratedImageUrl('');
    setCurrentScreen('camera');
  }, []);

  const handleGetQR = useCallback(async () => {
    if (!sessionId) return null;
    try {
      const res = await fetch(`${API_BASE}/sessions/${sessionId}/qr`);
      if (!res.ok) throw new Error('Failed to get QR code');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('QR fetch error:', err);
      return null;
    }
  }, [sessionId]);

  const handleRestart = useCallback(() => {
    setCurrentScreen('welcome');
    setUserName('');
    setGender('');
    setSelectedTemplate(null);
    setCapturedImage(null);
    setGeneratedImageUrl('');
    setSessionId(null);
    setError('');
  }, []);

  const goBack = useCallback((screen) => {
    setError('');
    setCurrentScreen(screen);
  }, []);

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="glass-strong px-6 py-3 rounded-xl border border-error/30 text-error flex items-center gap-3 shadow-lg shadow-error/10">
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Screen rendering */}
      <div className="relative z-10">
        {currentScreen === 'welcome' && (
          <WelcomeScreen onSubmit={handleWelcomeSubmit} />
        )}
        {currentScreen === 'gender' && (
          <GenderScreen
            onSelect={handleGenderSelect}
            onBack={() => goBack('welcome')}
            userName={userName}
          />
        )}
        {currentScreen === 'template' && (
          <TemplateScreen
            gender={gender}
            onSelect={handleTemplateSelect}
            onBack={() => goBack('gender')}
            apiBase={API_BASE}
          />
        )}
        {currentScreen === 'camera' && (
          <CameraScreen
            onCapture={handleCapture}
            onBack={() => goBack('template')}
            userName={userName}
          />
        )}
        {currentScreen === 'loading' && (
          <LoadingScreen userName={userName} />
        )}
        {currentScreen === 'result' && (
          <ResultScreen
            generatedImageUrl={generatedImageUrl}
            capturedImage={capturedImage}
            onRetake={handleRetake}
            onRestart={handleRestart}
            onGetQR={handleGetQR}
            userName={userName}
          />
        )}
      </div>
    </div>
  );
}

export default App;
