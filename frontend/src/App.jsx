import { useState, useEffect, useRef } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import CameraScreen from './components/CameraScreen';
import StyleSelector from './components/StyleSelector';
import LoadingScreen from './components/LoadingScreen';
import ResultScreen from './components/ResultScreen';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [jobId, setJobId] = useState(null);
  const pollingRef = useRef(null);

  const handleStartExperience = () => {
    setCurrentScreen('camera');
  };

  const handleImageCapture = (imageData) => {
    setCapturedImage(imageData);
    setCurrentScreen('style');
  };

  const handleStyleSelect = (style) => {
    setSelectedStyle(style);
  };

  const handleGenerate = async (styleId) => {
    setCurrentScreen('loading');

    try {
      const formData = new FormData();
      formData.append('image', capturedImage);
      formData.append('style', styleId);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/generate`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.jobId) {
        setJobId(data.jobId);
        pollForResult(data.jobId);
      } else {
        alert('Failed to start generation. Try again.');
        setCurrentScreen('style');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Try again.');
      setCurrentScreen('style');
    }
  };

  const pollForResult = (id) => {
    pollingRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/status/${id}`
        );
        const data = await response.json();

        if (data.status === 'complete') {
          clearInterval(pollingRef.current);
          setGeneratedImage(data.generatedImageUrl);
          setCurrentScreen('result');
        } else if (data.status === 'failed') {
          clearInterval(pollingRef.current);
          alert('Image generation failed. Please try again.');
          setCurrentScreen('style');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);
  };

  // Cleanup interval if component unmounts
  useEffect(() => {
    return () => clearInterval(pollingRef.current);
  }, []);

  const handleTryAgain = () => {
    setCapturedImage(null);
    setSelectedStyle(null);
    setGeneratedImage(null);
    setJobId(null);
    setCurrentScreen('camera');
  };

  const handleBackToHome = () => {
    setCapturedImage(null);
    setSelectedStyle(null);
    setGeneratedImage(null);
    setJobId(null);
    setCurrentScreen('welcome');
  };

  return (
    <div className="app">
      {currentScreen === 'welcome' && (
        <WelcomeScreen onStart={handleStartExperience} />
      )}
      {currentScreen === 'camera' && (
        <CameraScreen
          onCapture={handleImageCapture}
          onBack={handleBackToHome}
        />
      )}
      {currentScreen === 'style' && (
        <StyleSelector
          onSelect={handleStyleSelect}
          onGenerate={handleGenerate}
          onBack={handleBackToHome}
        />
      )}
      {currentScreen === 'loading' && <LoadingScreen />}
      {currentScreen === 'result' && (
        <ResultScreen
          imageUrl={generatedImage}
          style={selectedStyle}
          onTryAgain={handleTryAgain}
          onBackToHome={handleBackToHome}
          jobId={jobId}
        />
      )}
    </div>
  );
}

export default App;