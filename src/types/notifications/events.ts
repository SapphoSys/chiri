export type NotificationType = 'overdue' | 'reminder';

export interface SendNotificationOptions {
  title: string;
  body: string;
  taskId: string;
  notificationType: NotificationType;
}

export interface SimpleNotificationOptions {
  title: string;
  body: string;
}

export interface NotificationActionEvent {
  action: string;
  taskId: string;
  notificationType: string;
}
