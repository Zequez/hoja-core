import IconGripVertical from '~icons/fa6-solid/grip-lines';
import MenuEllipsisVIcon from '~icons/fa6-solid/ellipsis-vertical';
import EyeIcon from '~icons/fa6-regular/eye';
import PenIcon from '~icons/fa6-solid/pen';
import usePageContentEditorStore, { Wrapper } from './usePageContentEditorStore';
import { cx } from '@shared/utils';
import TextEditor from './TextEditor';
import ElementPicker from './ElementPicker';
import { Button } from '../ui';
import PageElementsRenderer from './PageContentRenderer';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useDragState from './useDragState';
import ImageEditor from './ImageEditor';
import FloatingMenu from '../ui/FloatingMenu';

export default function PageContentEditor(p: {
  config: PageConfig;
  onConfigChange: (newConfig: PageConfig) => void;
}) {
  return (
    <Wrapper init={p.config} onChange={p.onConfigChange}>
      <PageContentEditorBase />
    </Wrapper>
  );
}

function PageContentEditorBase() {
  const { state, computed, actions } = usePageContentEditorStore();

  useEffect(() => {
    return () => {
      actions.finishOnChangeAction();
    };
  }, []);

  return (
    <main class="relative max-w-screen-sm mx-auto bg-main-900 rounded-lg px-4 text-black/80">
      <div
        class={cx('py4', {
          hidden: computed.previewing.value,
        })}
      >
        <PageElementsList />
        <ElementPicker />
      </div>
      {computed.previewing.value && <PageElementsRenderer elements={state.value.config.elements} />}
      <Button
        customSize
        class="absolute -right-1 -top-1 h-8 w-8"
        tint="main"
        onClick={() =>
          actions.patchState({ previewLocked: !state.value.previewLocked, previewPeeking: false })
        }
      >
        {state.value.previewLocked ? <PenIcon /> : <EyeIcon />}
      </Button>
    </main>
  );
}

function PageElementsList() {
  const { state, actions } = usePageContentEditorStore();
  const { dragState, startDrag, containerRef } = useDragState({
    onMoveElement: actions.moveElement,
  });

  const draggedElement = useMemo(() => {
    if (!dragState?.elementId) return null;
    return state.value.config.elements.find((e) => e.uuid === dragState.elementId);
  }, [dragState?.elementId, state.value.config.elements]);

  return state.value.config.elements.length ? (
    <>
      <div class="space-y-0.5 mb-4" ref={containerRef}>
        {state.value.config.elements.map((e, i) => (
          <PageElementEditor
            key={e.uuid}
            dragKey={e.uuid}
            element={e}
            onDragStart={startDrag}
            class={cx({
              'opacity-0': dragState?.elementId === e.uuid,
              // 'bg-red-500!': dragState?.targetIndex === i,
            })}
          ></PageElementEditor>
        ))}
      </div>
      {dragState && draggedElement && (
        <>
          <div
            class="fixed z-100"
            style={{
              top: dragState.elementRect.top,
              left: dragState.elementRect.left,
              transform: `translateX(${(dragState.delta.x, 0)}px) translateY(${dragState.delta.y}px)`,
              width: dragState.elementRect.width,
              height: dragState.elementRect.height,
            }}
          >
            <PageElementEditor element={draggedElement} highlight={true} grabbed={true} />
          </div>
        </>
      )}
    </>
  ) : null;
}

function PageElementEditor(p: {
  element: PageElementConfig;
  onDragStart?: (ev: MouseEvent | TouchEvent) => void;
  class?: string;
  dragKey?: string;
  highlight?: boolean;
  grabbed?: boolean;
}) {
  const {
    state,
    actions: { removeElement },
  } = usePageContentEditorStore();

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div class={cx('flex relative', p.class)} data-drag-key={p.dragKey}>
      <div
        class={cx(
          `peer absolute z-30 flexcc
          w-4 h-8 -ml-6 sm:-ml-8 mr-2
          bg-main-700  b b-black/5 hover:bg-main-800 text-white/40 rounded-sm`,
          {
            'cursor-grabbing!': p.grabbed,
            'cursor-grab': !p.grabbed,
          },
        )}
        onMouseDown={p.onDragStart}
        onTouchStart={p.onDragStart}
      >
        <IconGripVertical />
      </div>
      <button
        ref={menuButtonRef}
        class="absolute peer right-0 z-30 -mr-6 sm:-mr-8 mr-2 bg-main-700 flexcc rounded-sm  b b-black/5 w-4 h-8 hover:bg-main-800 text-white/40"
        onClick={() => setMenuOpen(true)}
      >
        <MenuEllipsisVIcon />
      </button>
      {menuOpen ? (
        <FloatingMenu
          side="left"
          position="left"
          items={{
            Eliminar: () => {
              removeElement(p.element.uuid);
            },
          }}
          target={menuButtonRef.current!}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}
      <div
        class={cx(
          'absolute z-20 peer-hover:bg-white/30 h-full -left-4 -right-4 top-0 z-0 pointer-events-none',
          {
            'bg-white/30': state.value.focusActivation === p.element.uuid || p.highlight,
          },
        )}
      ></div>
      <div class="flexcs relative z-10 flex-grow max-w-full">
        {p.element.type === 'Text' ? (
          <TextEditor element={p.element} />
        ) : (
          <ImageEditor element={p.element} />
        )}
      </div>
    </div>
  );
}
