import { EmojiPicker } from 'frimousse';
import Search from 'lucide-react/icons/search';
import { useRef, useState } from 'react';
import { FloatingDropdownFrame } from '$components/FloatingDropdownFrame';
import { CALENDAR_ICONS, getIconByName } from '$constants/icons';

interface IconEmojiPickerProps {
  iconValue: string;
  emojiValue?: string;
  onIconChange: (iconName: string) => void;
  onEmojiChange: (emoji: string) => void;
  color?: string;
}

const PICKER_GAP = 6;
const FALLBACK_PICKER_WIDTH = 352;
const FALLBACK_PICKER_HEIGHT = 380;

export const IconEmojiPicker = ({
  iconValue,
  emojiValue = '',
  onIconChange,
  onEmojiChange,
  color,
}: IconEmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'icon' | 'emoji'>('icon');
  const [iconSearch, setIconSearch] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);

  const SelectedIcon = getIconByName(iconValue);

  const filteredIcons = iconSearch.trim()
    ? CALENDAR_ICONS.filter(({ name }) => name.toLowerCase().includes(iconSearch.toLowerCase()))
    : CALENDAR_ICONS;

  const dropdown = (
    <FloatingDropdownFrame
      anchorRef={triggerRef}
      onClose={() => setIsOpen(false)}
      align="start"
      gap={PICKER_GAP}
      fallbackWidth={FALLBACK_PICKER_WIDTH}
      fallbackHeight={FALLBACK_PICKER_HEIGHT}
      backdropClassName="fixed inset-0 z-70"
      dropdownClassName="z-80 w-88"
      dataAttribute="data-icon-emoji-picker-dropdown"
    >
      <div className="flex border-surface-200 border-b dark:border-surface-700">
        <button
          type="button"
          onClick={() => setActiveTab('icon')}
          className={`flex-1 px-4 py-2 font-medium text-sm outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset ${
            activeTab === 'icon'
              ? 'border-primary-ink border-b-2 text-primary-ink'
              : 'text-surface-600 hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-200'
          }`}
        >
          Icon
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('emoji')}
          className={`flex-1 px-4 py-2 font-medium text-sm outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset ${
            activeTab === 'emoji'
              ? 'border-primary-ink border-b-2 text-primary-ink'
              : 'text-surface-600 hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-200'
          }`}
        >
          Emoji
        </button>
      </div>

      <div className="relative">
        <div
          className={
            activeTab === 'icon'
              ? 'relative z-10'
              : 'pointer-events-none invisible absolute inset-x-0 top-0 z-0 opacity-0'
          }
        >
          <div className="px-2 pt-2">
            <div className="relative z-10">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Search..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                className="w-full appearance-none rounded-md border border-transparent bg-surface-100 py-2 pr-2.5 pl-8 text-sm text-surface-800 transition-colors placeholder:text-surface-400 focus:border-primary-ink focus:bg-white focus:outline-hidden dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
              />
            </div>
          </div>
          <div className="h-71.5 overflow-y-auto">
            {filteredIcons.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-surface-400 dark:text-surface-500">
                No icons found
              </div>
            ) : (
              <>
                <div className="px-3 pt-3 pb-1.5 font-medium text-surface-600 text-xs dark:text-surface-400">
                  All
                </div>
                <div className="grid grid-cols-9 px-2 pb-1.5">
                  {filteredIcons.map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        onIconChange(name);
                        onEmojiChange(''); // Clear emoji when selecting icon
                        setIsOpen(false);
                      }}
                      className="flex h-8 w-full cursor-pointer items-center justify-center rounded-lg text-surface-600 outline-hidden transition-colors hover:bg-surface-100 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:text-surface-400 dark:hover:bg-surface-700"
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div
          className={
            activeTab === 'emoji'
              ? 'relative z-10'
              : 'pointer-events-none invisible absolute inset-x-0 top-0 z-0 opacity-0'
          }
        >
          <EmojiPicker.Root
            className="w-full"
            onEmojiSelect={(emoji) => {
              onEmojiChange(emoji.emoji);
              setIsOpen(false);
            }}
            columns={9}
          >
            <div className="px-2 pt-2">
              <div className="relative z-10">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-surface-400" />
                <EmojiPicker.Search
                  placeholder="Search..."
                  className="w-full appearance-none rounded-md border border-transparent bg-surface-100 py-2 pr-2.5 pl-8 text-sm text-surface-800 transition-colors placeholder:text-surface-400 focus:border-primary-ink focus:bg-white focus:outline-hidden dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
                />
              </div>
            </div>

            <EmojiPicker.Viewport className="h-63 outline-hidden">
              <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-sm text-surface-400 dark:text-surface-500">
                Loading…
              </EmojiPicker.Loading>
              <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-sm text-surface-400 dark:text-surface-500">
                No emoji found
              </EmojiPicker.Empty>
              <EmojiPicker.List
                className="select-none pb-1.5"
                components={{
                  CategoryHeader: ({ category, ...props }) => (
                    <div
                      className="sticky top-0 bg-white px-3 pt-3 pb-1.5 font-medium text-surface-600 text-xs dark:bg-surface-800 dark:text-surface-400"
                      {...props}
                    >
                      {category.label}
                    </div>
                  ),
                  Row: ({ children, ...props }) => (
                    <div className="scroll-my-1.5 px-2" {...props}>
                      {children}
                    </div>
                  ),
                  Emoji: ({ emoji, ...props }) => (
                    <button
                      type="button"
                      className="flex h-8 max-w-1/9 flex-1 items-center justify-center rounded-lg text-lg outline-hidden hover:bg-surface-100 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:hover:bg-surface-700"
                      {...props}
                    >
                      {emoji.emoji}
                    </button>
                  ),
                }}
              />
            </EmojiPicker.Viewport>

            <div className="flex min-h-8.5 items-center gap-2 border-surface-200 border-t px-3 py-2 dark:border-surface-700">
              <EmojiPicker.ActiveEmoji>
                {({ emoji }) =>
                  emoji ? (
                    <>
                      <span className="text-base leading-none">{emoji.emoji}</span>
                      <span className="truncate text-surface-600 text-xs dark:text-surface-400">
                        {emoji.label}
                      </span>
                    </>
                  ) : (
                    <span className="text-surface-400 text-xs dark:text-surface-500">
                      Hover to preview…
                    </span>
                  )
                }
              </EmojiPicker.ActiveEmoji>
            </div>
          </EmojiPicker.Root>
        </div>
      </div>
    </FloatingDropdownFrame>
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border text-surface-600 outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink dark:text-surface-300 ${
          isOpen
            ? 'border-primary-ink bg-primary-500/10 ring-2 ring-primary-ink/30 dark:bg-primary-500/15'
            : 'border-surface-200 bg-surface-50 hover:border-surface-300 dark:border-surface-600 dark:bg-surface-700 dark:hover:border-surface-500'
        }`}
        style={color ? { color } : undefined}
      >
        {emojiValue ? (
          <span className="text-lg leading-none">{emojiValue}</span>
        ) : (
          <SelectedIcon className="h-5 w-5" />
        )}
      </button>

      {isOpen && dropdown}
    </div>
  );
};
