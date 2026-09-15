import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  scheduleMorningAnchorNotification,
  scheduleTwilightNotification,
  scheduleCaffeineCutoffNotification,
  cancelAllCircadianNotifications,
} from '../../services/notificationService';

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests permissions successfully', async () => {
    const granted = await requestNotificationPermissions();
    expect(granted).toBe(true);
  });

  it('schedules morning anchor notification', async () => {
    const id = await scheduleMorningAnchorNotification(7, 30);
    expect(id).toBeDefined();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.stringContaining('Âncora Fotónica'),
        }),
      })
    );
  });

  it('schedules twilight DLMO notification', async () => {
    const id = await scheduleTwilightNotification(21, 15);
    expect(id).toBeDefined();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.stringContaining('Modo Crepúsculo'),
        }),
      })
    );
  });

  it('schedules caffeine cutoff notification', async () => {
    const id = await scheduleCaffeineCutoffNotification(14, 0);
    expect(id).toBeDefined();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.stringContaining('Limite Circadiano de Cafeína'),
        }),
      })
    );
  });

  it('cancels all circadian notifications', async () => {
    await cancelAllCircadianNotifications();
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
  });
});
