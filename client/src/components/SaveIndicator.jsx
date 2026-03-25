export default function SaveIndicator({ status }) {
  if (!status) return null;

  if (status === 'saving') {
    return (
      <span className="text-xs text-label flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        Saving...
      </span>
    );
  }

  if (status === 'saved') {
    return (
      <span className="save-indicator text-xs text-progress-green flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
        Saved ✓
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span className="text-xs text-red-400">
        Couldn't save — retrying...
      </span>
    );
  }

  return null;
}
