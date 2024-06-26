import { useState, useRef } from 'preact/hooks';
import useStore from '../lib/useEditorStore';

export function CurrentPageUrlVisualizer() {
  const {
    selectedPage,
    store: {
      savedConfig: { subdomain, domain },
    },
  } = useStore();
  const [justCopied, setJustCopied] = useState(false);
  const copiedTimeout = useRef<any>(null);

  const pageUrl = selectedPage ? `https://${subdomain || ''}${domain}${selectedPage.path}` : '';

  function handleClick() {
    if (pageUrl) {
      clearTimeout(copiedTimeout.current);
      navigator.clipboard.writeText(pageUrl);
      setJustCopied(true);
      copiedTimeout.current = setTimeout(() => {
        setJustCopied(false);
      }, 1500);
    }
  }

  return (
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 z-30 bg-black/50 py-1 px-4 rounded-b-md cursor-copy whitespace-nowrap"
      onClick={handleClick}
    >
      {justCopied ? (
        <div class="absolute inset-0 flexcc">
          <div class="bg-emerald-500 rounded-md text-white px1 py-0.5">Copiado</div>
        </div>
      ) : null}
      {pageUrl ? pageUrl : 'Page not found'}
    </div>
  );
}
