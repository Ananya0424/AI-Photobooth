// src/components/StyleSelector.jsx
const STYLES = [
  { id: 'astronaut', name: 'Astronaut', emoji: '🚀', color: 'from-blue-400 to-blue-600' },
  { id: 'ceo', name: 'CEO', emoji: '💼', color: 'from-slate-400 to-slate-600' },
  { id: 'anime', name: 'Anime', emoji: '✨', color: 'from-pink-400 to-pink-600' },
  { id: 'superhero', name: 'Superhero', emoji: '🦸', color: 'from-red-400 to-red-600' },
  { id: 'cyberpunk', name: 'Cyberpunk', emoji: '🌆', color: 'from-cyan-400 to-cyan-600' },
  { id: 'warrior', name: 'Warrior', emoji: '⚔️', color: 'from-amber-400 to-amber-600' },
  { id: 'business_leader', name: 'Business Leader', emoji: '🎯', color: 'from-green-400 to-green-600' },
  { id: 'royalty', name: 'Royalty', emoji: '👑', color: 'from-yellow-400 to-yellow-600' },
];

export default function StyleSelector({ onSelect, onGenerate, onBack }) {
  const handleGenerate = (style) => {
    onSelect(style);
    onGenerate(style.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white">Choose Your Style</h1>
          <button
            onClick={onBack}
            className="text-white text-lg hover:bg-white hover:bg-opacity-20 px-6 py-2 rounded-lg transition"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => handleGenerate(style)}
              className={`bg-gradient-to-br ${style.color} p-8 rounded-2xl text-white font-bold text-center transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer group`}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition">{style.emoji}</div>
              <h3 className="text-xl font-bold mb-2">{style.name}</h3>
              <p className="text-sm text-white text-opacity-90">Click to generate</p>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center text-white">
          <p className="text-lg">Select a style to transform your photo with AI magic ✨</p>
        </div>
      </div>
    </div>
  );
}