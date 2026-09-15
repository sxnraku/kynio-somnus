import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set default notification presentation behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationScheduleResult {
  morningNotificationId?: string;
  twilightNotificationId?: string;
  caffeineCutoffNotificationId?: string;
}

/**
 * Requests native system notification permissions for circadian alarms.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Schedules daily Morning Photonic Anchor notification.
 * Triggered at the user's target wake time or sunrise.
 */
export async function scheduleMorningAnchorNotification(
  hour: number,
  minute: number
): Promise<string | null> {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '☀️ Âncora Fotónica: O Sol Está Ativo',
        body: 'Faz o teu banho de luz de 15 minutos para ancorar o teu ritmo circadiano e iniciar a contagem para a melatonina noturna.',
        sound: true,
        data: { type: 'MORNING_LIGHT_ANCHOR' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      } as any,
    });

    return id;
  } catch (err) {
    console.warn('[NotificationService] Failed to schedule morning anchor:', err);
    return null;
  }
}

/**
 * Schedules daily Twilight / DLMO (Dim Light Melatonin Onset) notification.
 * Triggered 2 hours before scheduled bedtime.
 */
export async function scheduleTwilightNotification(
  hour: number,
  minute: number
): Promise<string | null> {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 Modo Crepúsculo: Secreção de Melatonina',
        body: 'A tua janela de escuridão circadiana começou. Reduz as luzes de teto e ativa o filtro quente nos teus ecrãs para proteger o teu sono profundo.',
        sound: true,
        data: { type: 'TWILIGHT_DLMO' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      } as any,
    });

    return id;
  } catch (err) {
    console.warn('[NotificationService] Failed to schedule twilight alert:', err);
    return null;
  }
}

/**
 * Schedules daily Caffeine Cutoff warning.
 */
export async function scheduleCaffeineCutoffNotification(
  hour: number,
  minute: number
): Promise<string | null> {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '☕ Limite Circadiano de Cafeína Atingido',
        body: 'Para assegurar < 25mg de cafeína ativa no cérebro às 23:00, interrompe o consumo de estimulantes por hoje.',
        sound: true,
        data: { type: 'CAFFEINE_CUTOFF' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      } as any,
    });

    return id;
  } catch (err) {
    console.warn('[NotificationService] Failed to schedule caffeine cutoff:', err);
    return null;
  }
}

/**
 * Cancels all scheduled circadian notifications.
 */
export async function cancelAllCircadianNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.warn('[NotificationService] Failed to cancel notifications:', err);
  }
}
