export default function WelcomeScreen({ onStart }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-hidden">

      {/* Animated background blobs */}
      <div className="absolute w-[500px] h-[500px] bg-pink-500 rounded-full blur-3xl opacity-20 top-[-100px] left-[-100px] animate-pulse"></div>
      <div className="absolute w-[500px] h-[500px] bg-blue-500 rounded-full blur-3xl opacity-20 bottom-[-100px] right-[-100px] animate-pulse"></div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-3xl mx-4">

        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 shadow-2xl text-center">

          {/* Icon */}
          <div className="text-7xl mb-4 animate-bounce">📸</div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            AI PhotoBooth
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-200 mb-8">
            Turn your selfies into viral AI avatars in seconds ⚡
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <span className="px-4 py-2 bg-white/10 rounded-full text-sm">⚡ Instant AI</span>
            <span className="px-4 py-2 bg-white/10 rounded-full text-sm">🎨 8+ Styles</span>
            <span className="px-4 py-2 bg-white/10 rounded-full text-sm">📱 Mobile Ready</span>
            <span className="px-4 py-2 bg-white/10 rounded-full text-sm">🔥 High Quality</span>
          </div>

          {/* CTA Button */}
          <button
            onClick={onStart}
            className="px-10 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:scale-105 transition transform shadow-xl"
          >
            Start Creating ✨
          </button>

          {/* Footer */}
          <p className="mt-6 text-xs text-gray-300">
            No signup • Free demo • AI powered magic
          </p>

        </div>
      </div>
    </div>
  );
}