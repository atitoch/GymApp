interface CooldownProps {
  cooldown: string[];
}

export const Cooldown: React.FC<CooldownProps> = ({ cooldown }) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full" />
        Enfriamiento
      </h2>
      <div className="bg-stone-800/50 rounded-xl p-6 space-y-2">
        {cooldown.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 text-stone-300">
            <span className="text-stone-600 text-sm mt-1">•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
