import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppPreferencesStore, type ThemePreference } from '@/store/app-preferences-store';
import { useLegalConsentStore } from '@/store/legal-consent-store';
import { useCircadianStore } from '@/store/use-circadian-store';
import { exportAllUserDataJson, deleteAllUserDataAtomic } from '@/services/dbService';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    themeMode,
    caffeineHalfLifeHours,
    isProUser,
    setThemeMode,
    setCaffeineHalfLifeHours,
    setIsProUser,
  } = useAppPreferencesStore();

  const { resetConsent } = useLegalConsentStore();
  const { currentElevationDeg, latitude, longitude } = useCircadianStore();

  const isNight = themeMode === 'dark' || (themeMode === 'auto_circadian' && currentElevationDeg < 0);

  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const handleExportData = async () => {
    try {
      const json = await exportAllUserDataJson();
      await Share.share({
        title: 'kynio-somnus-export-rgpd.json',
        message: json,
      });
      setExportMessage('✓ Ficheiro JSON gerado segundo o padrão RGPD Artigo 20.');
      setTimeout(() => setExportMessage(null), 5000);
    } catch {
      Alert.alert('Exportação', 'Não foi possível partilhar o ficheiro.');
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Eliminar Todos os Dados',
      'Tem a certeza de que deseja apagar permanentemente todos os registos locais? Esta ação é irreversível e cumpre o Direito ao Esquecimento (RGPD Artigo 17).',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Tudo',
          style: 'destructive',
          onPress: async () => {
            await deleteAllUserDataAtomic();
            Alert.alert('Sucesso', 'Todos os dados locais foram eliminados e o banco SQLite foi compactado.');
          },
        },
      ]
    );
  };

  const handleReviewDisclaimer = async () => {
    await resetConsent();
    router.replace('/onboarding/disclaimer');
  };

  return (
    <SafeAreaView className={`flex-1 ${isNight ? 'bg-[#161412]' : 'bg-[#EDE6D3]'}`}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Cabeçalho */}
        <View className="mb-4">
          <Text
            className={`font-label text-[10px] uppercase tracking-widest ${
              isNight ? 'text-[#E8A83E]' : 'text-[#D9922E]'
            } font-bold`}
          >
            Configurações & Privacidade
          </Text>
          <Text
            className={`font-headline text-2xl font-extrabold ${
              isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
            }`}
          >
            Definições
          </Text>
        </View>

        {/* Cartão Pro / Subscrição */}
        <View
          className={`rounded-2xl border p-5 mb-4 ${
            isNight ? 'border-[#E8A83E]/40 bg-[#221E1A]' : 'border-[#D9922E]/40 bg-[#F4EFE2]'
          }`}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text
                className={`font-headline text-lg font-bold ${
                  isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
                }`}
              >
                KYNIO SOMNUS PRO
              </Text>
              <Text
                className={`font-label text-xs ${
                  isProUser ? 'text-[#3A6B4C]' : isNight ? 'text-[#E8A83E]' : 'text-[#D9922E]'
                } font-bold`}
              >
                {isProUser ? '✓ Subscrição Ativa' : 'Versão Gratuita'}
              </Text>
            </View>

            <Pressable
              onPress={() => router.push('/paywall')}
              className={`px-4 py-2.5 rounded-xl ${
                isNight ? 'bg-[#E8A83E]' : 'bg-[#3A3A38]'
              }`}
            >
              <Text
                className={`font-headline text-xs font-bold uppercase tracking-wider ${
                  isNight ? 'text-[#161412]' : 'text-[#EDE6D3]'
                }`}
              >
                {isProUser ? 'Gerir' : 'Ver Pro'}
              </Text>
            </Pressable>
          </View>

          <Text
            className={`font-body text-xs leading-relaxed ${
              isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
            }`}
          >
            Desbloqueie histórico ilimitado de consistência circadiana, relatórios de Social Jetlag em PDF e sons locais de crepúsculo.
          </Text>
        </View>

        {/* Parâmetros Metabólicos & Circadianos */}
        <View
          className={`rounded-2xl border p-5 mb-4 ${
            isNight ? 'border-[#332D26] bg-[#221E1A]' : 'border-[#DDD6C1] bg-[#F4EFE2]'
          }`}
        >
          <Text
            className={`font-label text-xs uppercase tracking-widest mb-3 font-bold ${
              isNight ? 'text-[#E8A83E]' : 'text-[#D9922E]'
            }`}
          >
            Fisiologia Individual
          </Text>

          {/* Meia-Vida de Cafeína */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 mr-3">
              <Text
                className={`font-headline text-sm font-bold ${
                  isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
                }`}
              >
                Meia-vida da Cafeína
              </Text>
              <Text
                className={`font-body text-xs ${
                  isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
                }`}
              >
                Tempo para o fígado depurar 50% da cafeína ativa. Padrão: 5.5h.
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => setCaffeineHalfLifeHours(Math.max(4.0, caffeineHalfLifeHours - 0.5))}
                className={`w-8 h-8 rounded-lg items-center justify-center ${
                  isNight ? 'bg-[#332D26]' : 'bg-[#DDD6C1]'
                }`}
              >
                <Text className={`font-label font-bold ${isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'}`}>-</Text>
              </Pressable>

              <Text
                className={`font-label text-sm font-bold w-12 text-center ${
                  isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
                }`}
              >
                {caffeineHalfLifeHours.toFixed(1)}h
              </Text>

              <Pressable
                onPress={() => setCaffeineHalfLifeHours(Math.min(8.0, caffeineHalfLifeHours + 0.5))}
                className={`w-8 h-8 rounded-lg items-center justify-center ${
                  isNight ? 'bg-[#332D26]' : 'bg-[#DDD6C1]'
                }`}
              >
                <Text className={`font-label font-bold ${isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'}`}>+</Text>
              </Pressable>
            </View>
          </View>

          {/* Modo de Tema Circadiano */}
          <Text
            className={`font-headline text-sm font-bold mb-2 ${
              isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
            }`}
          >
            Modo de Ecrã
          </Text>
          <View className="flex-row gap-2">
            {[
              { key: 'auto_circadian', label: 'Solar Auto' },
              { key: 'light', label: 'Dia (Papel)' },
              { key: 'dark', label: 'Noite (Âmbar)' },
            ].map((theme) => {
              const isSelected = themeMode === theme.key;
              return (
                <Pressable
                  key={theme.key}
                  onPress={() => setThemeMode(theme.key as ThemePreference)}
                  className={`flex-1 py-2 rounded-lg items-center border ${
                    isSelected
                      ? isNight
                        ? 'border-[#E8A83E] bg-[#E8A83E]/20'
                        : 'border-[#D9922E] bg-[#D9922E]/20'
                      : isNight
                      ? 'border-[#332D26] bg-[#161412]'
                      : 'border-[#DDD6C1] bg-[#EDE6D3]'
                  }`}
                >
                  <Text
                    className={`font-label text-[11px] uppercase tracking-wider ${
                      isSelected
                        ? isNight
                          ? 'text-[#E8A83E] font-bold'
                          : 'text-[#D9922E] font-bold'
                        : isNight
                        ? 'text-[#9E9789]'
                        : 'text-[#7A7875]'
                    }`}
                  >
                    {theme.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Coordenadas Offline Locais */}
        <View
          className={`rounded-xl border p-4 mb-4 ${
            isNight ? 'border-[#332D26] bg-[#221E1A]' : 'border-[#DDD6C1] bg-[#F4EFE2]'
          }`}
        >
          <Text
            className={`font-label text-xs uppercase tracking-widest mb-1 font-bold ${
              isNight ? 'text-[#E8A83E]' : 'text-[#D9922E]'
            }`}
          >
            Coordenadas Astronómicas Locais
          </Text>
          <Text
            className={`font-body text-xs mb-2 ${
              isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
            }`}
          >
            As coordenadas residem unicamente na memória do telemóvel para os cálculos da NOAA e nunca são transmitidas para a Internet.
          </Text>
          <Text className={`font-label text-xs font-bold ${isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'}`}>
            Lat: {latitude.toFixed(4)}° | Lon: {longitude.toFixed(4)}°
          </Text>
        </View>

        {/* Conformidade RGPD & Saúde */}
        <View
          className={`rounded-2xl border p-5 mb-4 ${
            isNight ? 'border-[#332D26] bg-[#221E1A]' : 'border-[#DDD6C1] bg-[#F4EFE2]'
          }`}
        >
          <Text
            className={`font-label text-xs uppercase tracking-widest mb-3 font-bold ${
              isNight ? 'text-[#3A6B4C]' : 'text-[#3A6B4C]'
            }`}
          >
            Conformidade Legal & RGPD
          </Text>

          {exportMessage && (
            <View className="p-3 mb-3 rounded-lg bg-[#3A6B4C]/15 border border-[#3A6B4C]/40">
              <Text className="font-label text-xs text-[#3A6B4C] font-bold">
                {exportMessage}
              </Text>
            </View>
          )}

          {/* Botão Exportar RGPD */}
          <Pressable
            onPress={handleExportData}
            className={`py-3 rounded-xl items-center border mb-2.5 ${
              isNight ? 'border-[#332D26] bg-[#161412]' : 'border-[#DDD6C1] bg-[#EDE6D3]'
            }`}
          >
            <Text
              className={`font-headline text-xs font-bold uppercase tracking-wider ${
                isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
              }`}
            >
              Exportar Todos os Dados (JSON)
            </Text>
          </Pressable>

          {/* Botão Rever Disclaimer de Saúde */}
          <Pressable
            onPress={handleReviewDisclaimer}
            className={`py-3 rounded-xl items-center border mb-2.5 ${
              isNight ? 'border-[#332D26] bg-[#161412]' : 'border-[#DDD6C1] bg-[#EDE6D3]'
            }`}
          >
            <Text
              className={`font-headline text-xs font-bold uppercase tracking-wider ${
                isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
              }`}
            >
              Rever Termo de Responsabilidade de Saúde
            </Text>
          </Pressable>

          {/* Botão Eliminar Tudo (Direito ao Esquecimento) */}
          <Pressable
            onPress={handleDeleteAllData}
            className="py-3 rounded-xl items-center border border-[#943D3D]/40 bg-[#943D3D]/10"
          >
            <Text className="font-headline text-xs font-bold uppercase tracking-wider text-[#943D3D]">
              Eliminar Todos os Dados Locais
            </Text>
          </Pressable>
        </View>

        {/* Versão & Informações Legais */}
        <View className="items-center py-2">
          <Text
            className={`font-label text-[10px] uppercase tracking-widest ${
              isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
            }`}
          >
            KYNIO SOMNUS v1.0.0 • STANDALONE LOCAL-FIRST
          </Text>
          <Text
            className={`font-label text-[10px] uppercase tracking-widest mt-1 ${
              isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
            }`}
          >
            CONFORMIDADE COM RGPD, EU MDR & FDA GUIDANCE
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
