import useStore from '../lib/useEditorStore';
import App from './App';
import { TextInput, TextAreaInput, Button, EmojiPicker } from './ui';
import { cx } from '@shared/utils';
import { prodDomains, devDomains } from '@server/domains';
import PagesList from './PagesList';
import EditorPreScreen from './EditorPreScreen';
import { useRef, useState } from 'preact/hooks';
import ThemePicker from './ThemePicker';
import { HeaderImageEditor } from './HeaderImageEditor';
import { usePatternBackgroundWithOpacity } from '../lib/opacity-background-image';

const domains = import.meta.env.DEV ? devDomains : prodDomains;

const availableDomains = domains
  .filter((d) => d.scope === 'members' || d.scope === 'public')
  .map((d) => d.host);

export default function AppWithEditor() {
  const {
    store,
    configChanged,
    subdomainChanged,
    publishedConfigIsDifferent,
    showPreScreen,
    actions: A,
  } = useStore();

  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const faviconButtonRef = useRef<HTMLButtonElement>(null);
  const [deploySiteResult, setDeploySiteResult] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  usePatternBackgroundWithOpacity(
    store.config.theme.pattern,
    store.config.theme.patternIntensity,
    containerRef,
  );

  async function handleDeploySite() {
    setDeploySiteResult(await A.deploySite());
  }

  const C = store.config;

  if (showPreScreen) return <EditorPreScreen />;

  return (
    <div class="h-screen w-screen">
      <div
        class={cx('sm:hidden z-80 fixed left-0 bottom-0 ', {
          'bg-gray-600 shadow-md w-full': !store.previewing,
        })}
      >
        {store.previewing ? (
          <Button tint="teal" class="ml1 mb1 w7 h7" customSize onClick={A.togglePreviewing}>
            &larr;
          </Button>
        ) : (
          <Button joinL joinR tint="teal" align="right" class="w-full" onClick={A.togglePreviewing}>
            Ver &rarr;
          </Button>
        )}
      </div>
      <div
        class={cx(
          'fixed z-60 left-0 top-0 w-full h-full sm:w-60  text-white flex-shrink-0 flex flex-col',
          { 'hidden!': store.previewing },
        )}
      >
        <div
          ref={containerRef}
          class="relative flex-grow bg-main-200 overflow-auto space-y-2 pb0 sm:pb2  sm:pb2 px4 pt2 pb14 flex flex-col"
        >
          <Separator>Sitio</Separator>
          <div class="flex">
            <Button
              reff={faviconButtonRef}
              onClick={() => setEmojiPickerOpen(true)}
              customSize
              class="relative z-20 mr-2 flexcc w-10 h-full p1"
            >
              {C.icon.value}
            </Button>
            {emojiPickerOpen && (
              <EmojiPicker
                target={faviconButtonRef.current!}
                onClose={() => {
                  setEmojiPickerOpen(false);
                }}
                onSelect={(val) => {
                  setEmojiPickerOpen(false);
                  A.setConfigVal('icon', { type: 'emoji', value: val });
                }}
              />
            )}
            <TextInput
              label="Titulo"
              value={C.title}
              onChange={(val) => A.setConfigVal('title', val)}
            />
          </div>
          <TextAreaInput
            label="Descripción"
            value={C.description}
            onChange={(val) => A.setConfigVal('description', val)}
          />
          <HeaderImageEditor
            imageUrl={C.header.imageUrl}
            onChange={(val) => A.setConfigVal('header', { imageUrl: val })}
          />

          <Separator>Colores</Separator>
          <ThemePicker />

          <Separator>Páginas</Separator>
          <PagesList />

          {/* <Separator>Links Redes</Separator>
        <div class="flexcc mb2 px-4">
          Instagram Facebook Whatsapp YouTube Telegram Twitter LinkedIn Github
        </div> */}

          <div class="flex-grow"></div>

          <Separator>Dirección</Separator>
          <TextInput
            label="Subdominio"
            value={C.subdomain}
            onChange={(val) => A.setConfigVal('subdomain', val)}
          />

          <select
            onChange={({ currentTarget }) => A.setConfigVal('domain', currentTarget.value)}
            value={C.domain}
            class="w-full text-black/70 rounded-md py2 px2 h-10 flex-shrink-0"
          >
            {availableDomains.map((domain) => {
              return <option value={domain}>{domain}</option>;
            })}
            {availableDomains.indexOf(C.domain) === -1 ? (
              <option value={C.domain}>{C.domain}</option>
            ) : null}
          </select>

          {/* <div class="px4">
          {store.subdomainAvailabilityStatus === 'unknown' && (
            <div class="mb2">Checkeando disponibilidad...</div>
          )}
          {store.subdomainAvailabilityStatus === 'available' && subdomainChanged && (
            <div class="mb2">Subdominio disponible</div>
          )}
          {store.subdomainAvailabilityStatus === 'taken' && (
            <div class="text-center text-red-500 mb2">Subdominio no disponible</div>
          )}
        </div> */}

          <Button
            expandH
            onClick={A.saveConfig}
            tint="main"
            disabled={
              !configChanged ||
              store.subdomainAvailabilityStatus !== 'available' ||
              store.configIsSaving
            }
          >
            {store.configIsSaving ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button
            tint="main"
            disabled={configChanged || store.deploySiteInProgress || !publishedConfigIsDifferent}
            expandH
            onClick={handleDeploySite}
          >
            {store.deploySiteInProgress
              ? 'Publicando...'
              : deploySiteResult
                ? 'Publicar'
                : 'Error. Reintentar?'}
          </Button>
        </div>
      </div>
      <div
        class={cx('sm:pl-60  relative overflow-auto h-screen w-full', {
          'pl0!': store.previewing,
          // 'fixed inset-0 block overflow-auto': store.previewing,
          'hidden sm:block ': !store.previewing,
        })}
      >
        <App />
      </div>
    </div>
  );
}

const Separator = (p: { children: any }) => (
  <div class="text-center text-xl px-4">{p.children}</div>
);
