import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SolarDomeClock } from '@/components/ui/solar-dome-clock';
import { LightTimer } from '@/components/ui/light-timer';
import { CaffeineGauge } from '@/components/ui/caffeine-gauge';
import { useCircadianStore } from '@/store/use-circadian-store';
import { useAppPreferencesStore } from '@/store/app-preferences-store';

export default function SolarScreen() {
  const {
    currentElevationDeg,
    solarTimes,
    requestLocationAndCompute,
    refreshSolarElevation,
  } = useCircadianStore();

  const { themeMode } = useAppPreferencesStore();
  const isNight = themeMode === 'dark' || (themeMode === 'auto_circadian' && currentElevationDeg < 0);

  useEffect(() => {
    requestLocationAndCompute();
    const interval = setInterval(() => {
      refreshSolarElevation();
    }, 60000);
    return () => clearInterval(interval);
  }, [requestLocationAndCompute, refreshSolarElevation]);

  const formatTimeStr = (d: Date | undefined) => {
    if (!d) return '--:--';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const sunriseFormatted = formatTimeStr(solarTimes?.sunrise);
  const sunsetFormatted = formatTimeStr(solarTimes?.sunset);
  const solarNoonFormatted = formatTimeStr(solarTimes?.solarNoon);

  const sunColor = isNight ? '#E8A83E' : '#D9922E';
  const cardBorder = isNight ? 'border-[#332D26]' : 'border-[#DDD6C1]';
  const cardBg = isNight ? 'bg-[#221E1A]' : 'bg-[#F4EFE2]';

  return (
    <SafeAreaView className={`flex-1 ${isNight ? 'bg-[#161412]' : 'bg-[#EDE6D3]'}`}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => requestLocationAndCompute()}
            tintColor={sunColor}
          />
        }
      >
        {/* Cabeçalho Editorial */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text
              className={`font-label text-[10px] uppercase tracking-widest ${sunColor} font-bold`}
            >
              Altímetro Celeste Pessoal
            </Text>
            <Text
              className={`font-headline text-2xl font-black ${
                isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
              }`}
            >
              KYNIO SOMNUS
            </Text>
          </View>

          <View
            className={`px-3 py-1 rounded-full border ${cardBorder} ${cardBg}`}
          >
            <Text
              className={`font-label text-xs font-bold ${
                isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
              }`}
            >
              {formatTimeStr(new Date())}
            </Text>
          </View>
        </View>

        {/* 1. A Cúpula Celeste (Solar Dome SVG com anel radiante e sequência semanal) */}
        <View className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 mb-4`}>
          <SolarDomeClock
            elevationDeg={currentElevationDeg}
            sunriseStr={sunriseFormatted}
            sunsetStr={sunsetFormatted}
            solarNoonStr={solarNoonFormatted}
            isDark={isNight}
            weeklyStreak={[true, true, true, true, false, false, false]}
          />
        </View>

        {/* 2. O Cartão "Banho de Luz Matinal" (Tactile Light Card com 4 pontos matriciais) */}
        <View className="mb-4">
          <LightTimer isDark={isNight} />
        </View>

        {/* 3. O Medidor de Depuração Metabólica de Cafeína (Duas Zonas) */}
        <View className="mb-4">
          <CaffeineGauge isDark={isNight} bedtimeHour={23} />
        </View>

        {/* 4. Princípios da Biologia Circadiana */}
        <View
          className={`rounded-xl border ${cardBorder} ${isNight ? 'bg-[#161412]' : 'bg-[#EDE6D3]'} p-4`}
        >
          <Text
            className={`font-label text-xs uppercase tracking-wider mb-1 font-bold ${sunColor}`}
          >
            Sincronização do Núcleo Supraquiasmático (SCN)
          </Text>
          <Text
            className={`font-body text-xs leading-relaxed ${
              isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
            }`}
          >
            A luz solar captada no início do dia é a âncora primária do ritmo biológico. Ela desencadeia o pico de cortisol para a vigília ativa e aciona o temporizador celular para a libertação de melatonina 12 a 14 horas depois.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
