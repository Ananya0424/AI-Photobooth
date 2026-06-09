import { useRef, useState } from 'react';

export default function CameraScreen({ onCapture, onBack }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [captureMode, setCaptureMode] = useState('camera');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
    } catch (error) {
      alert('Camera access denied. Please allow camera access.');
      console.error('Camera error:', error);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      onCapture(blob);
    }, 'image/jpeg', 0.95);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      onCapture(file);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mb-8">
        <button
          onClick={onBack}
          className="text-white text-lg hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition"
        >
          ← Back
        </button>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex bg-gray-100">
          <button
            onClick={() => {
              setCaptureMode('camera');
              startCamera();
            }}
            className="flex-1 py-3 font-semibold transition"
          >
            📷 Camera
          </button>
          <button
            onClick={() => {
              setCaptureMode('upload');
              stopCamera();
            }}
            className="flex-1 py-3 font-semibold transition"
          >
            🖼️ Upload
          </button>
        </div>

        {captureMode === 'camera' && (
          <div className="p-6 bg-black">
            {!isCameraActive ? (
              <div className="h-96 flex flex-col items-center justify-center text-white">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-lg mb-6">Click below to start camera</p>
                <button
                  onClick={startCamera}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition"
                >
                  Start Camera
                </button>
              </div>
            ) : (
              <div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-96 rounded-lg object-cover bg-black"
                />
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg text-lg transition"
                  >
                    ✓ Capture Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg text-lg transition"
                  >
                    ✕ Close Camera
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {captureMode === 'upload' && (
          <div className="p-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-purple-300 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-600 hover:bg-purple-50 transition"
            >
              <div className="text-5xl mb-4">📁</div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-gray-500">PNG, JPG, GIF up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}