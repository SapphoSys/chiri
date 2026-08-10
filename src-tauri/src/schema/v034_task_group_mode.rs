use tauri_plugin_sql::{Migration, MigrationKind};

/// stores the task-list grouping preferences independently from task data
pub fn migration() -> Migration {
    Migration {
        version: 34,
        description: "add_task_group_config",
        sql: r#"
            ALTER TABLE ui_state ADD COLUMN task_group_mode TEXT NOT NULL DEFAULT 'none';
            ALTER TABLE ui_state ADD COLUMN task_group_direction TEXT NOT NULL DEFAULT 'asc';
        "#,
        kind: MigrationKind::Up,
    }
}
