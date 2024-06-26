import GlobeIcon from '~icons/fa6-solid/globe';
import ServerIcon from '~icons/fa6-solid/server';
import UsersIcon from '~icons/fa6-solid/users';
import CloudIcon from '~icons/fa6-solid/cloud';
import useAdminStore, { AdminStore, PartialSite } from './useAdminStore';
import { cx } from '@shared/utils';
import Sites from './Sites';
import Domains from './Domains';

export default function Tools() {
  const {
    store: { tab },
    computed: {},
    actions: A,
  } = useAdminStore();

  const tabs: { [key in AdminStore['tab']]: { label: string; icon: any } } = {
    sites: {
      label: 'Sitios',
      icon: <GlobeIcon />,
    },
    domains: {
      label: 'Dominios',
      icon: <ServerIcon />,
    },
    members: {
      label: 'Miembros',
      icon: <UsersIcon />,
    },
    storage: {
      label: 'Almacenam.',
      icon: <CloudIcon />,
    },
  };

  return (
    <div class="max-w-screen-md mx-auto pb16 sm:(pb0 pl24)">
      <nav class="fixed bottom-0 w-full h-16 flex-row shadow-md sm:(flex-col top-0 bottom-auto w-24 h-full) left-0  z-30 bg-emerald-300 flex_c text-emerald-700 font-semibold text-sm">
        {Object.entries(tabs).map(([key, { label, icon }]) => (
          <button
            class={cx('px2 sm:(px0 py2) flexcc flex-col', {
              'bg-white/20': key === tab,
            })}
            onClick={() => A.setTab(key as AdminStore['tab'])}
          >
            <div>{icon}</div>
            <div>{label}</div>
          </button>
        ))}
      </nav>
      {tab === 'sites' && <Sites />}
      {tab === 'domains' && <Domains />}
    </div>
  );
}
