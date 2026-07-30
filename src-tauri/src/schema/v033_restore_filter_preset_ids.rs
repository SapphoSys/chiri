use tauri_plugin_sql::{Migration, MigrationKind};

/// restores preset identities lost when predefined filters were edited
pub fn migration() -> Migration {
    Migration {
        version: 33,
        description: "restore_filter_preset_ids",
        sql: r#"
            UPDATE filters
            SET preset_id = 'today'
            WHERE preset_id IS NULL
              AND name = 'Today'
              AND icon = 'calendar-check'
              AND combinator = 'all'
              AND criteria_json = '[{"field":"dueDate","op":"today"},{"field":"status","op":"notIn","value":["completed","cancelled"]}]';

            UPDATE filters
            SET preset_id = 'overdue'
            WHERE preset_id IS NULL
              AND name = 'Overdue'
              AND icon = 'clock'
              AND combinator = 'all'
              AND criteria_json = '[{"field":"dueDate","op":"beforeToday"},{"field":"status","op":"notIn","value":["completed","cancelled"]}]';

            UPDATE filters
            SET preset_id = 'scheduled'
            WHERE preset_id IS NULL
              AND name = 'Scheduled'
              AND icon = 'calendar-clock'
              AND combinator = 'all'
              AND criteria_json = '[{"field":"dueDate","op":"exists"},{"field":"status","op":"notIn","value":["completed","cancelled"]}]';

            UPDATE filters
            SET preset_id = 'this-week'
            WHERE preset_id IS NULL
              AND name = 'This Week'
              AND icon = 'calendar-days'
              AND combinator = 'all'
              AND criteria_json = '[{"field":"dueDate","op":"withinDays","value":7},{"field":"status","op":"notIn","value":["completed","cancelled"]}]';

            UPDATE filters
            SET preset_id = 'recently-modified'
            WHERE preset_id IS NULL
              AND name = 'Recently Modified'
              AND icon = 'sparkles'
              AND combinator = 'all'
              AND criteria_json = '[{"field":"modifiedAt","op":"withinDays","value":7}]';

            UPDATE filters
            SET preset_id = 'tomorrow'
            WHERE preset_id IS NULL
              AND name = 'Tomorrow'
              AND icon = 'calendar'
              AND combinator = 'all'
              AND criteria_json = '[{"field":"dueDate","op":"tomorrow"},{"field":"status","op":"notIn","value":["completed","cancelled"]}]';

            UPDATE filters
            SET preset_id = 'no-due-date'
            WHERE preset_id IS NULL
              AND name = 'No Due Date'
              AND icon = 'list-todo'
              AND combinator = 'all'
              AND criteria_json = '[{"field":"dueDate","op":"empty"},{"field":"status","op":"notIn","value":["completed","cancelled"]}]';

            UPDATE filters
            SET preset_id = 'high-priority'
            WHERE preset_id IS NULL
              AND name = 'High Priority'
              AND icon = 'flag'
              AND combinator = 'all'
              AND criteria_json = '[{"field":"priority","op":"is","value":"high"},{"field":"status","op":"notIn","value":["completed","cancelled"]}]';

            UPDATE filters
            SET preset_id = 'untagged'
            WHERE preset_id IS NULL
              AND name = 'Untagged'
              AND icon = 'tag'
              AND combinator = 'all'
              AND criteria_json = '[{"field":"tags","op":"empty"},{"field":"status","op":"notIn","value":["completed","cancelled"]}]';

            UPDATE filters
            SET preset_id = 'recently-completed'
            WHERE preset_id IS NULL
              AND name = 'Recently Completed'
              AND icon = 'check-square'
              AND combinator = 'all'
              AND criteria_json = '[{"field":"completedAt","op":"withinDays","value":7},{"field":"status","op":"is","value":"completed"}]';
        "#,
        kind: MigrationKind::Up,
    }
}
