import { TaskDefaultsSettingsCalendarSection } from '$components/settings/TaskDefaultsSettings/TaskDefaultsSettingsCalendarSection';
import { TaskDefaultsSettingsDateSection } from '$components/settings/TaskDefaultsSettings/TaskDefaultsSettingsDateSection';
import { TaskDefaultsSettingsPrioritySection } from '$components/settings/TaskDefaultsSettings/TaskDefaultsSettingsPrioritySection';
import { TaskDefaultsSettingsRecurrenceSection } from '$components/settings/TaskDefaultsSettings/TaskDefaultsSettingsRecurrenceSection';
import { TaskDefaultsSettingsRemindersSection } from '$components/settings/TaskDefaultsSettings/TaskDefaultsSettingsRemindersSection';
import { TaskDefaultsSettingsStatusSection } from '$components/settings/TaskDefaultsSettings/TaskDefaultsSettingsStatusSection';
import { TaskDefaultsSettingsTagsSection } from '$components/settings/TaskDefaultsSettings/TaskDefaultsSettingsTagsSection';
import { TaskDefaultsSettingsTimeSection } from '$components/settings/TaskDefaultsSettings/TaskDefaultsSettingsTimeSection';

export const TaskDefaultsSettings = () => {
  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-base text-surface-800 dark:text-surface-200">Defaults</h3>

      <TaskDefaultsSettingsStatusSection />

      <TaskDefaultsSettingsPrioritySection />

      <div className="grid gap-5">
        <TaskDefaultsSettingsDateSection />
        <TaskDefaultsSettingsTimeSection />
      </div>

      <TaskDefaultsSettingsRecurrenceSection />

      <TaskDefaultsSettingsCalendarSection />

      <TaskDefaultsSettingsTagsSection />

      <TaskDefaultsSettingsRemindersSection />
    </div>
  );
};
