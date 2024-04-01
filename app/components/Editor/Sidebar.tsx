import AnglesLeft from '~icons/fa6-solid/angles-left';
import Thumbtack from '~icons/fa6-solid/thumbtack';
import Bars from '~icons/fa6-solid/bars';
import { signal, effect } from '@preact/signals';
import { cx } from '@app/lib/utils';

const LS_KEY = 'SIDEBAR_COLLAPSED_MODE';

function getInitialCollapsedMode() {
  const stored = localStorage.getItem(LS_KEY) === 'true';
  return window.innerWidth < 768 ? true : stored;
}

const MOBILE_MODE = 'ontouchstart' in window;

const collapsedMode = signal(getInitialCollapsedMode());
const sidebarPoppingIn = signal(false);

effect(() => {
  localStorage.setItem(LS_KEY, JSON.stringify(collapsedMode.value));
});

let popOutTimeout: ReturnType<typeof setTimeout> | null = null;
function startPopOutTimeout() {
  if (popOutTimeout) {
    clearTimeout(popOutTimeout);
  }
  popOutTimeout = setTimeout(() => {
    sidebarPoppingIn.value = false;
    popOutTimeout = null;
  }, 1000);
}

function popOut() {
  sidebarPoppingIn.value = false;
}

function popIn() {
  if (popOutTimeout) {
    clearTimeout(popOutTimeout);
  } else {
    sidebarPoppingIn.value = true;
  }
}

function popInToggle() {
  sidebarPoppingIn.value = !sidebarPoppingIn.value;
}

const Sidebar = ({ children }: { children: any }) => {
  return (
    <>
      <div
        class={cx('relative flex-shrink-0 z-100', {
          'w-0': collapsedMode.value,
          'w-54': !collapsedMode.value,
        })}
      >
        <div
          class={cx('relative flex flex-col w-54 h-full z-80 bg-gray-500', {
            'translate-x-[-100%]': collapsedMode.value && !sidebarPoppingIn.value,
          })}
          onMouseOver={!MOBILE_MODE ? popIn : () => {}}
          onMouseOut={!MOBILE_MODE ? startPopOutTimeout : () => {}}
        >
          {collapsedMode.value ? (
            <>
              <div
                class={cx(
                  'absolute flex h-12 items-center justify-center left-[100%] top-2/3 z-20 text-black/50 rounded-r-md bg-gray-300 px-2 transform-origin-tl',
                  {
                    'w-12': MOBILE_MODE,
                    'w-8': !MOBILE_MODE,
                  },
                )}
                onClick={MOBILE_MODE ? popInToggle : () => {}}
              >
                <Bars />
              </div>
              {!MOBILE_MODE ? (
                <div class="absolute bg-red/30 inset-y-0 z-10 w-12 left-[100%]"></div>
              ) : null}
            </>
          ) : null}
          <div class="flex justify-end  bg-black/10 border-b border-black/10">
            <button
              class={cx('w-10 h-10  border flex items-center justify-center', {
                'shadow-inset shadow-md border-black/10 bg-black/10 text-white/40':
                  !collapsedMode.value,
                'text-white/70 border-transparent hover:bg-white/10 ': collapsedMode.value,
              })}
              onClick={() => (collapsedMode.value = !collapsedMode.value)}
            >
              <Thumbtack class="h-full" />
            </button>
          </div>
          {children}
        </div>
      </div>
      {MOBILE_MODE && collapsedMode.value && sidebarPoppingIn.value ? (
        <div class="bg-green-300/20 fixed inset-0 z-70" onClick={popOut}></div>
      ) : null}
    </>
  );
};

export default Sidebar;
