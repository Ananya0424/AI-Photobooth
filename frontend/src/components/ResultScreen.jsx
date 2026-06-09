import { QRCodeCanvas } from 'qrcode.react';

export default function ResultScreen({
  imageUrl,
  style,
  onTryAgain,
  onBackToHome,
  jobId
}) {
  const downloadImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'ai-avatar.jpg';
      link.click();
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const downloadQR = () => {
    const canvas = document.querySelector('#qr-code canvas');

    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'avatar-qr-code.png';
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-8">
      <div className="max-w-4xl mx-auto">

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎉 Your Avatar is Ready!
          </h1>
          <p className="text-xl text-gray-100">
            Check out your amazing AI transformation
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">

          {/* IMAGE SECTION */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="aspect-square bg-gray-200 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Generated Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">⏳</div>
                  <p>Loading image...</p>
                </div>
              )}
            </div>

            <div className="p-6">
              <button
                onClick={downloadImage}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg mb-3"
              >
                ⬇️ Download Avatar
              </button>

              <button
                onClick={onTryAgain}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg"
              >
                🔄 Try Another Style
              </button>
            </div>
          </div>

          {/* QR SECTION */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center">

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Share with QR Code
            </h2>

            <div
              id="qr-code"
              className="bg-white p-6 rounded-xl border-2 border-gray-200 mb-6"
            >
              <QRCodeCanvas
                value={imageUrl || 'https://example.com'}
                size={256}
                level="H"
                includeMargin={true}
                fgColor="#000000"
                bgColor="#FFFFFF"
              />
            </div>

            <p className="text-center text-gray-600 text-sm mb-4">
              Scan this QR code to download your avatar
            </p>

            <button
              onClick={downloadQR}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mb-4"
            >
              📥 Download QR Code
            </button>

            <button
              onClick={onBackToHome}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg"
            >
              🏠 Back to Home
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center bg-white bg-opacity-10 backdrop-blur rounded-2xl p-6 text-white">
          <p className="text-sm">
            Your avatar was created using <b>{style?.name || 'AI Style'}</b>
          </p>
        </div>

      </div>
    </div>
  );
}