export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white tracking-tight mb-3">
          Room<span className="text-accent">4</span>AI
        </h1>
        <p className="text-white/70 text-lg mb-10">Lesson planning, elevated.</p>
        <div className="flex justify-center">
          <div className="w-10 h-10 border-4 border-white/20 border-t-accent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
