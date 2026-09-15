import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';

const ENTITLEMENT_ID = 'pro';

// Em desenvolvimento ou testes, usa chave de mock se não fornecida
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID ?? 'goog_mock_somnus_key';
const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS ?? 'appl_mock_somnus_key';

export async function initializePurchases(): Promise<void> {
  try {
    const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
    const apiKey = isAndroid ? REVENUECAT_API_KEY_ANDROID : REVENUECAT_API_KEY_IOS;
    Purchases.configure({ apiKey });
  } catch {
    // Modo offline / mock
  }
}

export async function checkProStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
  } catch {
    return false;
  }
}

export async function purchaseProPackage(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
  } catch {
    return false;
  }
}

export async function restoreProPurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
  } catch {
    return false;
  }
}
