import GripLinesIcon from '~icons/fa6-solid/grip-lines';
import MenuEllipsisVIcon from '~icons/fa6-solid/ellipsis-vertical';
import useStore from '../lib/useStore';
import App, { toHtml } from './App';
import TextInput from './TextInput';
import TextAreaInput from './TextAreaInput';

export default function AppWithEditor() {
  const { store, configChanged, navPages, hiddenPages, subdomainChanged, actions: A } = useStore();

  function saveConfig() {
    A.saveConfig();
    console.log(toHtml(store.config));
  }

  const C = store.config;

  return (
    <div class="h-screen w-screen flex">
      <div class="w-60 bg-gray-800 text-white flex-shrink-0 flex flex-col pb4">
        <Separator>Sitio</Separator>
        <div class="flexcc mb4 px-4">
          <TextInput
            label="Titulo"
            value={C.title}
            onChange={(val) => A.setConfigVal('title', val)}
          />
        </div>
        <div class="px4 mb4">
          <TextAreaInput
            label="Descripción"
            value={C.description}
            onChange={(val) => A.setConfigVal('description', val)}
          />
        </div>
        <Separator>Diseño</Separator>
        <div class="flexcc mb2 px-4">
          Color principal <input type="color" value={C.themeColor} />
        </div>

        <Separator>Páginas</Separator>
        <div class="flex flex-col">
          <div class="text-center">Navegación</div>
          {navPages.map((page) => (
            <PageWidget page={page} onChange={(patch) => A.patchPage(page.path, patch)} />
          ))}
          <div class="text-center">Otras</div>
          {hiddenPages.map((page) => (
            <PageWidget page={page} onChange={(patch) => A.patchPage(page.path, patch)} />
          ))}
          <div class="flexcc mt-2">
            <button
              class="bg-white/20 hover:bg-white/30 rounded-md py1 px2"
              onClick={() => A.addPage()}
            >
              Agregar
            </button>
          </div>
        </div>
        {/* <button
          class="bg-slate-400 rounded-md px-2 py-1 mb4"
          onClick={() => A.setConfigVal('foo', !store.config.foo)}
        >
          Foo: {store.config.foo ? 'TRUE' : 'FALSE'}
        </button> */}

        <Separator>Links Redes</Separator>
        <div class="flexcc mb2 px-4">
          Instagram Facebook Whatsapp YouTube Telegram Twitter LinkedIn
        </div>

        <div class="flex-grow"></div>

        <Separator>Dirección</Separator>
        <div class="flexcc mb2 px-4">
          <TextInput
            label="Subdominio"
            value={C.subdomain}
            onChange={(val) => A.setConfigVal('subdomain', val)}
          />
        </div>
        <div class="flexcc mb2 px-4">
          <select
            disabled={true}
            onChange={(val) => A.setConfigVal('domain', val)}
            class="w-full text-black/70 rounded-md py2 px2"
          >
            <option value="hoja.ar">.{C.domain}</option>
          </select>
        </div>
        <div class="px4">
          {store.subdomainAvailabilityStatus === 'unknown' && (
            <div class="mb2">Checkeando disponibilidad...</div>
          )}
          {store.subdomainAvailabilityStatus === 'available' && subdomainChanged && (
            <div class="mb2">Subdominio disponible</div>
          )}
          {store.subdomainAvailabilityStatus === 'taken' && (
            <div class="text-center text-red-500 mb2">Subdominio no disponible</div>
          )}
        </div>
        <div class="px4">
          <button
            class="bg-white/20 hover:bg-white/30 rounded-md w-full px-2 py-1 disabled:text-white/20 disabled:bg-white/10"
            onClick={saveConfig}
            disabled={!configChanged || store.subdomainAvailabilityStatus !== 'available'}
          >
            Guardar cambios
          </button>
        </div>
      </div>
      <App />
    </div>
  );
}

const Separator = (p: { children: any }) => (
  <div class="text-center text-xl py-2 px-4">{p.children}</div>
);

function PageWidget(p: { page: Page; onChange: (patch: Partial<Page>) => void }) {
  return (
    <div class="relative flexcc px-2 py-1 hover:bg-white/10">
      <div class="pointer-events-none text-white/50 mr-2">
        <GripLinesIcon />
      </div>
      <button class="relative z-20 mr-2 flexcc w-12 h-full bg-white/20 hover:bg-white/30 rounded-md p1">
        {p.page.icon}
      </button>
      <input
        type="text"
        class="relative z-20 w-full text-black/60 rounded-md px-2 py-1 mr-2"
        value={p.page.title}
        onInput={(e) => p.onChange({ title: e.currentTarget.value })}
      />
      <button class="relative z-20 h-full bg-white/20 hover:bg-white/30 rounded-md p1">
        <MenuEllipsisVIcon class="-mx-1" />
      </button>
      <div class="absolute z-10 w-full h-full  cursor-move"></div>
    </div>
  );
}
