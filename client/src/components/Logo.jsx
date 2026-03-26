// Reusable Room4AI Logo component
// size: "sm" | "md" | "xl" — lockup (icon + wordmark) at different scales
//       "large"            — standalone app icon (72×72)
//       "favicon"          — standalone icon (28×28)

const LOCKUP_DIMS = {
  sm:  { w: 150, h: 37 },
  md:  { w: 175, h: 43 },
  xl:  { w: 210, h: 52 },
};

function LockupSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox="0 0 210 52" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="2" width="48" height="48" rx="11" fill="#1A7A55"/>
      <text x="4" y="38" fontFamily="system-ui, sans-serif" fontSize="30" fontWeight="800" fill="white">R</text>
      <text x="25" y="38" fontFamily="system-ui, sans-serif" fontSize="30" fontWeight="800" fill="#F59E0B">4</text>
      <text x="62" y="35" fontFamily="system-ui, sans-serif" fontSize="24" fontWeight="600" fill="#1A2E25" letterSpacing="-0.3">Room4</text>
      <text x="150" y="35" fontFamily="system-ui, sans-serif" fontSize="24" fontWeight="600" fill="#F59E0B" letterSpacing="-0.3">AI</text>
    </svg>
  );
}

export default function Logo({ size = 'md' }) {
  if (size === 'large') {
    return (
      <svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="72" height="72" rx="16" fill="#1A7A55"/>
        <text x="4" y="52" fontFamily="system-ui, sans-serif" fontSize="42" fontWeight="800" fill="white">R</text>
        <text x="36" y="52" fontFamily="system-ui, sans-serif" fontSize="42" fontWeight="800" fill="#F59E0B">4</text>
      </svg>
    );
  }

  if (size === 'favicon') {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="28" height="28" rx="7" fill="#1A7A55"/>
        <text x="1" y="21" fontFamily="system-ui, sans-serif" fontSize="17" fontWeight="800" fill="white">R</text>
        <text x="14" y="21" fontFamily="system-ui, sans-serif" fontSize="17" fontWeight="800" fill="#F59E0B">4</text>
      </svg>
    );
  }

  const dims = LOCKUP_DIMS[size] || LOCKUP_DIMS.md;
  return <LockupSVG w={dims.w} h={dims.h} />;
}
