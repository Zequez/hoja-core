import { createContext } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import * as pipes from './pipes';
import configDefault from '../config-default';
import createValidator, { ValidationError } from '../config-validator';
import * as storage from './storage';
import prerender from '../prerender';
import { slugify, wait } from '@shared/utils';
import * as urlHelpers from './url-helpers';
import { usePatchableStore } from './usePatchableStore';

type Store = {
  editing: boolean;
  previewing: boolean;
  settingsMenuOpen: boolean;
  selectedPageId: null | string;
  siteId: null | string;
  attemptAccessLoading: boolean;
  accessToken: string | null;
  siteNeedsToBeCreated: boolean;

  deploySiteInProgress: boolean;

  // CONFIG STUFF
  config: Config;
  savedConfig: Config;
  publishedConfig: Config;
  configNeedsToLoadFromServer: boolean;
  invalidConfig: null | Record<string, any>;
  remoteSetConfigErrors: ValidationError[];
  configIsSaving: boolean;

  //
  subdomainAvailabilityStatus: 'unknown' | 'available' | 'taken';
};

type StoreInit = {
  config: Config | null;
  siteId: string | null;
  initialPath: string;
  editing: boolean;
};

export function useStoreBase(init: StoreInit) {
  const initialConfig = init.config ?? configDefault;

  const INITIAL_STATE: Store = {
    editing: init.editing,
    previewing: false,

    selectedPageId:
      initialConfig.pages.find((page) => page.path === init.initialPath)?.uuid || null,
    siteId: init.siteId,
    attemptAccessLoading: false,
    accessToken: storage.getMemberToken() || storage.getAccessKeyToken(init.siteId) || null,
    //
    siteNeedsToBeCreated: !init.siteId,
    configNeedsToLoadFromServer: !init.config,

    //
    configIsSaving: false,
    savedConfig: { ...initialConfig },
    config: { ...initialConfig },
    publishedConfig: { ...initialConfig },
    invalidConfig: null,
    remoteSetConfigErrors: [],

    //
    deploySiteInProgress: false,

    //
    subdomainAvailabilityStatus: 'available',

    //
    settingsMenuOpen: false,
  };

  const { store, patchStore } = usePatchableStore<Store>(INITIAL_STATE);

  function patchConfig(patch: Partial<Config> | ((config: Config) => Partial<Config>)) {
    return patchStore(({ config }) => ({
      config: { ...config, ...(typeof patch === 'function' ? patch(config) : patch) },
    }));
  }

  //  ██████╗ ██████╗ ███╗   ███╗██████╗ ██╗   ██╗████████╗███████╗██████╗
  // ██╔════╝██╔═══██╗████╗ ████║██╔══██╗██║   ██║╚══██╔══╝██╔════╝██╔══██╗
  // ██║     ██║   ██║██╔████╔██║██████╔╝██║   ██║   ██║   █████╗  ██║  ██║
  // ██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██║   ██║   ██║   ██╔══╝  ██║  ██║
  // ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ╚██████╔╝   ██║   ███████╗██████╔╝
  //  ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝      ╚═════╝    ╚═╝   ╚══════╝╚═════╝

  const computed = new (class {
    configChanged = useMemo(() => {
      return JSON.stringify(store.config) !== JSON.stringify(store.savedConfig);
    }, [store]);

    publishedConfigIsDifferent = useMemo(() => {
      return JSON.stringify(store.config) !== JSON.stringify(store.publishedConfig);
    }, [store.savedConfig, store.publishedConfig]);

    navPages = useMemo(() => {
      return store.config.pages.filter((page) => page.onNav);
    }, [store.config.pages]);

    hiddenPages = useMemo(() => {
      return store.config.pages.filter((page) => !page.onNav);
    }, [store.config.pages]);

    subdomainChanged = useMemo(() => {
      return store.config.subdomain !== store.savedConfig.subdomain;
    }, [store.config.subdomain, store.savedConfig.subdomain]);

    selectedPage = useMemo(() => {
      return store.config.pages.find((page) => page.uuid === store.selectedPageId);
    }, [store.selectedPageId, store.config.pages]);

    documentTitle = useMemo(() => {
      const rest = this.selectedPage ? this.selectedPage.title : 'Page not found';
      return `${rest} ← ${store.config.title}`;
    }, [this.selectedPage, store.config.title]);

    showPreScreen = useMemo(() => {
      return store.configNeedsToLoadFromServer;
    }, [store.configNeedsToLoadFromServer]);

    pathname = useMemo(() => {
      return this.selectedPage ? this.selectedPage.path : window.location.pathname;
    }, [this.selectedPage]);

    editorUrl = useMemo(() => {
      return urlHelpers.editorUrl(store.siteId!, this.pathname);
    }, [store.siteId, this.pathname]);
  })();

  // ███████╗███████╗███████╗███████╗ ██████╗████████╗███████╗
  // ██╔════╝██╔════╝██╔════╝██╔════╝██╔════╝╚══██╔══╝██╔════╝
  // █████╗  █████╗  █████╗  █████╗  ██║        ██║   ███████╗
  // ██╔══╝  ██╔══╝  ██╔══╝  ██╔══╝  ██║        ██║   ╚════██║
  // ███████╗██║     ██║     ███████╗╚██████╗   ██║   ███████║
  // ╚══════╝╚═╝     ╚═╝     ╚══════╝ ╚═════╝   ╚═╝   ╚══════╝

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!store.editing) {
      window.document.title = computed.documentTitle;
    }
  }, [computed.documentTitle, store.editing]);

  useEffect(() => {
    // Let's disable this for now, the server checks on saving
    // if (store.siteId) {
    //   if (store.config.subdomain !== store.savedConfig.subdomain) {
    //     patchStore({ subdomainAvailabilityStatus: 'unknown' });
    //     pipes
    //       .checkSubdomainAvailability({ subdomain: store.config.subdomain, siteId: store.siteId })
    //       .then((status) => {
    //         patchStore({ subdomainAvailabilityStatus: status ? 'available' : 'taken' });
    //       });
    //   }
    // }
  }, [store.config.subdomain, store.savedConfig.subdomain, store.siteId]);

  // Load Configuration
  useEffect(() => {
    (async () => {
      if (store.accessToken && store.siteId && store.configNeedsToLoadFromServer) {
        const { config } = (await pipes.tsite({ siteId: store.siteId, props: ['config'] }))!;
        const validator = createValidator();
        if (validator(config)) {
          const validConfig = config as Config;
          const initialPage = validConfig.pages.find((page) => page.path === init.initialPath);
          patchStore({
            config: validConfig,
            savedConfig: { ...validConfig },
            publishedConfig: { ...validConfig },
            configNeedsToLoadFromServer: false,
            selectedPageId: initialPage?.uuid || null,
          });
        } else {
          console.error('Invalid configuration', config);
          patchStore({
            invalidConfig: config,
          });
        }
      }
    })();
  }, [store.accessToken, store.siteId, store.configNeedsToLoadFromServer]);

  //  █████╗  ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
  // ██╔══██╗██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
  // ███████║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
  // ██╔══██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
  // ██║  ██║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
  // ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

  async function initialize() {
    console.log('Store initialized with', init, store);
  }

  function setConfigVal(key: string, val: any) {
    patchStore({ config: { ...store.config, [key]: val } });
  }

  function setThemeVal(key: keyof Config['theme'], val: any) {
    setConfigVal('theme', { ...store.config.theme, [key]: val });
  }

  async function saveConfig() {
    patchStore({ configIsSaving: true });
    const { errors } = await pipes.tsiteSetConfig({
      siteId: store.siteId!,
      config: store.config,
      token: store.accessToken!,
    });
    if (errors.length === 0) {
      patchStore({ savedConfig: store.config, configIsSaving: false, remoteSetConfigErrors: [] });
    } else {
      patchStore({ remoteSetConfigErrors: errors, configIsSaving: false });
    }
  }

  async function deploySite() {
    let result = false;
    if (store.siteId) {
      patchStore({ deploySiteInProgress: true });
      const prerenderedPages = await prerender(store.siteId, store.config);
      if (prerenderedPages) {
        result = await pipes.deploySite({
          siteId: store.siteId,
          deployConfig: store.config,
          prerenderedPages,
          token: store.accessToken!,
        });
      }
      patchStore({ deploySiteInProgress: false, publishedConfig: store.config });
    }
    return result;
  }

  async function attemptAccess(accessKey: string, saveKey: boolean) {
    patchStore({ attemptAccessLoading: true });
    const token = await pipes.tokenFromAccessKey({
      siteId: store.siteId!,
      plainAccessKey: accessKey,
    });
    if (token) {
      if (saveKey) {
        storage.setAccessKeyToken(store.siteId!, token);
      }
      patchStore({ accessToken: token, attemptAccessLoading: false });
      return true;
    } else {
      patchStore({ attemptAccessLoading: false });
      return false;
    }
  }

  //  +-+-+-+-+-+
  //  |P|A|G|E|S|
  //  +-+-+-+-+-+

  function setPagesPaths(pages: PageConfig[]): PageConfig[] {
    return pages.map((page, i) => {
      const newPath = i === 0 ? '/' : '/' + (page.title ? slugify(page.title) : page.uuid);
      if (newPath !== page.path) {
        return { ...page, path: newPath };
      } else {
        return page;
      }
    });
  }

  function setPages(
    pages: PageConfig[] | ((pages: PageConfig[]) => PageConfig[]),
    regenerateUrls: boolean = true,
  ) {
    patchConfig((config) => {
      const resolvedPages = typeof pages === 'function' ? pages(config.pages) : pages;
      const finalPages = regenerateUrls ? setPagesPaths(resolvedPages) : resolvedPages;
      return { pages: finalPages };
    });
  }

  const pages = new (class {
    patch(uuid: string, patch: Partial<PageConfig>) {
      setPages(
        (pages) =>
          pages.map((page) => {
            if (page.uuid === uuid) {
              return { ...page, ...patch };
            } else {
              return page;
            }
          }),
        patch.title ? true : false,
      );
    }

    add() {
      const uuid = crypto.randomUUID();
      setPages(
        store.config.pages.concat({
          uuid,
          path: '/' + uuid,
          title: '',
          icon: '',
          onNav: false,
          elements: [],
        }),
        false,
      );
    }

    move(uuid: string, target: { uuid?: string; nav: boolean }) {
      let page = store.config.pages.find((page) => page.uuid === uuid)!;
      page = { ...page, onNav: target.nav };
      let pages = store.config.pages.filter((page) => page.uuid !== uuid);

      if (target.uuid) {
        const targetIndex = pages.findIndex((page) => page.uuid === target.uuid);
        pages.splice(targetIndex + 1, 0, page);
      } else {
        pages.unshift(page);
      }
      setPages(pages, true);
    }

    remove(uuid: string) {
      setPages(
        store.config.pages.filter((page) => page.uuid !== uuid),
        true,
      );
    }
  })();

  //  +-+-+
  //  |U|I|
  //  +-+-+

  function navigateTo(path: string) {
    const page = store.config.pages.find((page) => page.path === path);
    if (page) {
      patchStore({ selectedPageId: page.uuid });
      if (import.meta.env.DEV || store.editing) {
        const { siteId } = urlHelpers.hash.getData();
        const newPath =
          window.location.pathname + '#!' + urlHelpers.hash.generate({ siteId, path });
        history.pushState({}, '', newPath);
      } else {
        history.pushState({}, '', path);
      }
    } else {
      patchStore({ selectedPageId: null });
    }
  }

  function toggleEditing() {
    patchStore({ editing: !store.editing });
  }

  function togglePreviewing() {
    patchStore({ previewing: !store.previewing });
  }

  return {
    store,
    ...computed,
    actions: {
      setConfigVal,
      saveConfig,
      setThemeVal,
      deploySite,
      attemptAccess,
      pages,
      navigateTo,
      toggleEditing,
      togglePreviewing,
    },
  };
}

//  ██████╗ ██████╗ ███╗   ██╗████████╗███████╗██╗  ██╗████████╗
// ██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝
// ██║     ██║   ██║██╔██╗ ██║   ██║   █████╗   ╚███╔╝    ██║
// ██║     ██║   ██║██║╚██╗██║   ██║   ██╔══╝   ██╔██╗    ██║
// ╚██████╗╚██████╔╝██║ ╚████║   ██║   ███████╗██╔╝ ██╗   ██║
//  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝

const StoreContext = createContext<ReturnType<typeof useStoreBase>>(undefined!);

export const StoreContextWrapper = ({ init, children }: { init: StoreInit; children: any }) => {
  const store = useStoreBase(init);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export default function useStore() {
  return useContext(StoreContext);
}