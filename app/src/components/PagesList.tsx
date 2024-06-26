import GripLinesIcon from '~icons/fa6-solid/grip-lines';
import MenuEllipsisVIcon from '~icons/fa6-solid/ellipsis-vertical';
import { useRef, useState } from 'preact/hooks';
import { cx } from '@shared/utils';
import FloatingMenu from './ui/FloatingMenu';
import useStore from '../lib/useEditorStore';
import { EmojiPicker, Button } from './ui';

export default function PagesList() {
  const { store, navPages, hiddenPages, actions: A } = useStore();
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);

  function handleMovePage(pageUuid: string, target: { uuid?: string; nav: boolean }) {
    setDraggedOverId(null);
    A.pages.move(pageUuid, target);
  }

  function isLastNavPage(uuid: string) {
    return navPages.length === 1 && navPages[0].uuid === uuid;
  }

  const pageWidget = (page: PageConfig) => (
    <PageWidget
      page={page}
      dragEnabled={!isLastNavPage(page.uuid)}
      onChange={(patch) => A.pages.patch(page.uuid, patch)}
      onDragDrop={(pageUuid) => handleMovePage(pageUuid, { uuid: page.uuid, nav: page.onNav })}
      onDragOver={() => setDraggedOverId(page.uuid)}
      onDragEnd={() => setDraggedOverId(null)}
      isDraggedOver={draggedOverId === page.uuid}
      onDelete={() => A.pages.remove(page.uuid)}
      onSelect={() => A.navigateTo(page.path)}
    />
  );

  return (
    <div class="flex flex-col -mx4">
      <PagesDroppableWrapper
        key="nav"
        onDragDrop={(pageUuid) => handleMovePage(pageUuid, { nav: true })}
        isDraggedOver={draggedOverId === 'nav'}
        onDragOver={() => setDraggedOverId('nav')}
      >
        <div class="text-center mb2">Navegación</div>
      </PagesDroppableWrapper>
      {navPages.map(pageWidget)}
      <PagesDroppableWrapper
        key="other"
        onDragDrop={(pageUuid) => handleMovePage(pageUuid, { nav: false })}
        isDraggedOver={draggedOverId === 'no-nav'}
        onDragOver={() => setDraggedOverId('no-nav')}
      >
        <div class="text-center mb2">Otras</div>
      </PagesDroppableWrapper>
      {hiddenPages.map(pageWidget)}
      <div class="flexcc mt-2" key="add">
        <Button onClick={() => A.pages.add()}>Agregar</Button>
      </div>
    </div>
  );
}

function PagesDroppableWrapper(p: {
  children: any;
  onDragDrop: (droppedPageUuid: string) => void;
  onDragOver: () => void;
  isDraggedOver: boolean;
}) {
  return (
    <div
      class="relative"
      onDragOver={(ev) => {
        ev.preventDefault();
        p.onDragOver();
      }}
      onDrop={(ev) => {
        const targetUuid = ev.dataTransfer!.getData('text/plain');
        if (targetUuid) {
          p.onDragDrop(targetUuid);
        }
      }}
    >
      {p.children}
      {p.isDraggedOver ? (
        <div class="absolute z-40 h-1.5 b b-black shadow-md bg-white/70 rounded-full top-full left-0 w-full -mt1"></div>
      ) : null}
    </div>
  );
}

function PageWidget(p: {
  page: PageConfig;
  onChange: (patch: Partial<PageConfig>) => void;
  onDragDrop: (droppedPageUuid: string) => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  dragEnabled: boolean;
  isDraggedOver: boolean;
  onDelete: () => void;
  onSelect: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const menuRelativeToRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);

  const menuOptions = {
    Eliminar: () => p.onDelete(),
  };

  return (
    <div
      key={p.page.uuid}
      class={cx('relative hover:bg-white/10 mb-2 h8')}
      // draggable={true}
      onDragOver={(ev) => {
        ev.preventDefault();
        p.onDragOver();
      }}
      onDragStart={(ev) => {
        console.log(ev);
        if (!p.dragEnabled) ev.preventDefault();
        ev.dataTransfer!.setData('text/plain', p.page.uuid);
      }}
      onDragEnd={(ev) => {
        p.onDragEnd();
      }}
      onDrop={(ev) => {
        const targetUuid = ev.dataTransfer!.getData('text/plain');
        if (targetUuid) {
          p.onDragDrop(targetUuid);
        }
      }}
    >
      <div
        class={cx('flexcc h-8', {
          '-translate-y-[2px]': p.isDraggedOver,
        })}
      >
        <div
          class={cx('relative z-20 h-full px-2 hover:bg-white/20 rounded-md text-white/50 flexcc', {
            'opacity-25 ': !p.dragEnabled,
            'cursor-move': p.dragEnabled,
            'cursor-not-allowed': !p.dragEnabled,
          })}
          draggable={true}
        >
          <GripLinesIcon />
        </div>
        <Button
          reff={iconRef}
          onClick={() => setEmojiPickerOpen(true)}
          customSize
          class="relative z-20 mr-2 flexcc w-8 h-full p1"
        >
          {p.page.icon}
        </Button>
        <input
          type="text"
          class="relative z-20 w-full h-full text-black/60 rounded-md px-2 py-1 mr-2"
          value={p.page.title}
          onInput={(e) => p.onChange({ title: e.currentTarget.value })}
          onFocus={() => p.onSelect()}
        />
        <Button
          reff={menuRelativeToRef}
          customSize
          class="relative z-20 h-full p1 mr2"
          onClick={() => setMenuOpen(true)}
        >
          <MenuEllipsisVIcon class="-mx-1" />
        </Button>
      </div>
      {/* <div
        class={cx('absolute z-10 top-0 left-0 w-full h-full', {
          'cursor-move': p.dragEnabled,
          'cursor-not-allowed': !p.dragEnabled,
        })}
      ></div> */}
      {menuOpen && (
        <FloatingMenu
          target={menuRelativeToRef.current!}
          items={menuOptions}
          position="left"
          side="left"
          spacing={8}
          onClose={() => setMenuOpen(false)}
        />
      )}
      {emojiPickerOpen && (
        <EmojiPicker
          target={iconRef.current!}
          onClose={() => {
            setEmojiPickerOpen(false);
            console.log('Closing emoji picker');
          }}
          onSelect={(val) => {
            setEmojiPickerOpen(false);
            p.onChange({ icon: val });
          }}
        />
      )}
      {p.isDraggedOver && (
        <div class="absolute z-40 h-1.5 b b-black shadow-md bg-white/70 rounded-full top-full left-0 w-full -mt1"></div>
      )}
    </div>
  );
}
