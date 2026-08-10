use tauri_plugin_sql::{Migration, MigrationKind};

/// adds a persisted view preference for placing completed tasks after active tasks
pub fn migration() -> Migration {
    Migration {
        version: 32,
        description: "add_completed_tasks_to_bottom_preference",
        sql: r#"
            ALTER TABLE ui_state ADD COLUMN move_completed_tasks_to_bottom INTEGER NOT NULL DEFAULT 0;
        "#,
        kind: MigrationKind::Up,
    }
}
