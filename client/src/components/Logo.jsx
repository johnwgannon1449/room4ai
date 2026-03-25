export default function Logo({ size = 'md', light = false }) {
  const sizeMap = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  };

  const textColor = light ? 'text-white' : 'text-primary';

  return (
    <span className={`font-bold ${sizeMap[size]} ${textColor} tracking-tight`}>
      Room<span className="text-accent">4</span>AI
    </span>
  );
}
