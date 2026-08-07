import RotateCcw from 'lucide-react/icons/rotate-ccw';
import { useState } from 'react';
import { RepeatModal } from '$components/modals/RepeatModal/RepeatModal';
import { AddRepeatRuleButton } from '$components/repeat/AddRepeatRuleButton';
import { RepeatRulePreview } from '$components/repeat/RepeatRulePreview';
import { useSettingsStore } from '$context/settingsContext';
import { defaultState } from '$context/settingsDefaults';
import { getRepeatPresets } from '$lib/task/recurrence';

export const TaskDefaultsSettingsRecurrenceSection = () => {
  const { defaultRrule, setDefaultRrule, defaultRepeatFrom, setDefaultRepeatFrom, workingDays } =
    useSettingsStore();
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const presets = getRepeatPresets(undefined, workingDays);

  const handleReset = () => {
    setDefaultRrule(defaultState.defaultRrule);
    setDefaultRepeatFrom(defaultState.defaultRepeatFrom);
  };

  const hasChanged =
    defaultRrule !== defaultState.defaultRrule ||
    defaultRepeatFrom !== defaultState.defaultRepeatFrom;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-surface-700 dark:text-surface-300">Repeat</h4>
        {hasChanged && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-surface-500 text-xs outline-hidden transition-colors hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="p-4">
          <p className="mb-2 font-medium text-surface-500 text-xs dark:text-surface-400">
            Default repeat rule
          </p>
          {defaultRrule ? (
            <RepeatRulePreview
              rrule={defaultRrule}
              repeatFrom={defaultRepeatFrom}
              onOpen={() => setShowRepeatModal(true)}
              surface="nested"
            />
          ) : (
            <AddRepeatRuleButton
              presets={presets}
              onSelect={setDefaultRrule}
              onCustom={() => setShowRepeatModal(true)}
            />
          )}
        </div>
      </div>

      {showRepeatModal && (
        <RepeatModal
          isOpen={showRepeatModal}
          onClose={() => setShowRepeatModal(false)}
          rrule={defaultRrule}
          repeatFrom={defaultRepeatFrom}
          dueDate={undefined}
          onSave={(rrule, repeatFrom) => {
            setDefaultRrule(rrule);
            setDefaultRepeatFrom(repeatFrom);
          }}
        />
      )}
    </div>
  );
};
