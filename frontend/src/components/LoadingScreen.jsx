export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex flex-col items-center justify-center text-white">
      <div className="mb-8">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-spin"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl">✨</div>
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-4 text-center">Creating Your Avatar</h1>
      <p className="text-xl text-gray-100 mb-8 text-center max-w-md">
        Our AI is transforming your photo into something magical...
      </p>

      <div className="flex gap-2 mb-8">
        <div
          className="w-3 h-3 bg-white rounded-full animate-bounce"
          style={{ animationDelay: '0s' }}
        ></div>
        <div
          className="w-3 h-3 bg-white rounded-full animate-bounce"
          style={{ animationDelay: '0.2s' }}
        ></div>
        <div
          className="w-3 h-3 bg-white rounded-full animate-bounce"
          style={{ animationDelay: '0.4s' }}
        ></div>
      </div>

      <p className="text-gray-200 text-sm">This usually takes 30-60 seconds</p>
    </div>
  );
}