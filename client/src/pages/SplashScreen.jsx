import Logo from '../components/Logo';

export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-[#1A2E25] flex flex-col items-center justify-center gap-6">
      <Logo size="large" />
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-white">Room</span>
          <span className="text-white">4</span>
          <span style={{ color: '#F59E0B' }}>AI</span>
        </h1>
        <p className="text-white/60 mt-2 text-base">Lesson planning, elevated.</p>
      </div>
      <div className="w-9 h-9 border-4 border-white/15 border-t-[#F59E0B] rounded-full animate-spin" />
    </div>
  );
}
