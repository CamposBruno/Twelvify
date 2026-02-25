import { useState, useCallback } from 'react';
import Icon from './Icon';

export default function Playground() {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'typing' | 'done'>('idle');
  const [displayText, setDisplayText] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });
  const [showCursor, setShowCursor] = useState(false);

  function showToast(message: string) {
    setToast({ message, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 5000);
  }

  const handleClick = useCallback(async () => {
    setPhase('loading');
    setDisplayText('');
    setShowCursor(true);

    try {
      const res = await fetch('/api/playground', { method: 'POST' });

      if (res.status === 429) {
        const data = await res.json();
        showToast(data.message || 'Whoa, slow down! The AI needs a breather.');
        setPhase('idle');
        setShowCursor(false);
        return;
      }

      if (!res.ok) {
        showToast('Something went sideways. Give it another shot.');
        setPhase('idle');
        setShowCursor(false);
        return;
      }

      // SSE stream parsing
      setPhase('typing');
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const json = JSON.parse(line.slice(6));

          if (json.error) {
            // Mid-stream error — preserve what was typed
            showToast(json.message || 'Something went wrong mid-stream.');
            setShowCursor(false);
            setPhase('done');
            setDisabled(true);
            return;
          }

          if (json.done) {
            // Typing complete — blink cursor 3 times then fade
            setTimeout(() => setShowCursor(false), 1200);
            setPhase('done');
            setDisabled(true);
            return;
          }

          if (json.chunk) {
            // Typing animation: add chars one by one at 35ms per char
            for (const char of json.chunk as string) {
              accumulated += char;
              const snapshot = accumulated;
              await new Promise<void>((resolve) =>
                setTimeout(() => {
                  setDisplayText(snapshot);
                  resolve();
                }, 35)
              );
            }
          }
        }
      }
    } catch {
      showToast('Network hiccup. Check your connection and try again.');
      setPhase('idle');
      setShowCursor(false);
    }
  }, []);

  return (
    <section id="try-it" className="py-32 bg-slate-100">
      <div className="max-w-4xl mx-auto px-6">
        <div className="zine-box bg-white p-12 relative overflow-hidden">
          {/* Toast notification */}
          {toast.visible && (
            <div className="absolute top-0 left-0 right-0 bg-slate-900 text-white font-punk px-6 py-4 text-sm flex items-center justify-between z-10 border-b-4 border-primary transition-all">
              <span>{toast.message}</span>
              <button
                onClick={() => setToast((t) => ({ ...t, visible: false }))}
                className="ml-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="relative">
              <h2 className="text-4xl mb-4 -rotate-3">Is this even English?</h2>
              <p className="font-punk text-slate-500 italic uppercase">
                Click the button and watch the magic happen.
              </p>
            </div>

            {/* FIX THIS MESS button */}
            <button
              onClick={handleClick}
              disabled={disabled || phase === 'loading' || phase === 'typing'}
              className={`${
                disabled
                  ? 'bg-slate-400 cursor-not-allowed rotate-0'
                  : 'bg-primary hover:bg-slate-900 rotate-2'
              } border-2 border-slate-900 px-8 py-4 font-display text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-white`}
            >
              <Icon
                name={phase === 'loading' ? 'hourglass_empty' : 'auto_fix_high'}
                className="inline-block align-middle mr-2 w-5 h-5"
              />
              {phase === 'loading'
                ? 'FIXING...'
                : phase === 'done' || disabled
                ? 'FIXED!'
                : 'FIX THIS MESS'}
            </button>
          </div>

          {/* Text display area */}
          <div className="p-10 border-4 border-dashed border-slate-300 bg-background-light rotate-1 min-h-[120px]">
            {phase === 'idle' ? (
              <p className="text-2xl lg:text-3xl font-punk leading-loose text-slate-800">
                The{' '}
                <span className="bg-primary/20 px-1 border-b-4 border-primary">superfluous</span>{' '}
                utilization of{' '}
                <span className="bg-primary/20 px-1 border-b-4 border-primary">
                  sesquipedalian
                </span>{' '}
                verbiage inevitably precipitates a profound state of{' '}
                <span className="bg-primary/20 px-1 border-b-4 border-primary">
                  intellectual vertigo
                </span>{' '}
                for the uninitiated observer.
              </p>
            ) : (
              <p className="text-2xl lg:text-3xl font-punk leading-loose text-slate-800">
                {displayText}
                {showCursor && <span className="animate-pulse ml-0.5 text-primary">|</span>}
              </p>
            )}
          </div>

          {/* Legend */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-10 font-punk font-bold uppercase text-sm">
            <div
              className={`flex items-center gap-3 border-2 px-4 py-1 rotate-[-2deg] ${
                phase === 'done'
                  ? 'line-through text-slate-300 border-slate-200'
                  : 'text-primary border-primary font-black'
              }`}
            >
              <div className={`size-3 ${phase === 'done' ? 'bg-slate-300' : 'bg-primary'}`} /> COMPLEX ORIGINAL
            </div>
            <Icon name="trending_flat" className="text-slate-300 w-9 h-9" />
            <div
              className={`flex items-center gap-3 border-2 px-4 py-1 rotate-[2deg] ${
                phase === 'done'
                  ? 'text-primary border-primary font-black'
                  : 'text-slate-400 border-slate-200'
              }`}
            >
              <div className={`size-3 ${phase === 'done' ? 'bg-primary' : 'bg-slate-300'}`} /> SIMPLIFIED VERSION
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
