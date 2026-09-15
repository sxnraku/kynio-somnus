import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DotMatrixClock } from '@/components/ui/dot-matrix-clock';
import { useSleepPlannerStore } from '@/store/use-sleep-planner-store';
import { useAppPreferencesStore } from '@/store/app-preferences-store';
import { useCircadianStore } from '@/store/use-circadian-store';

export default function SleepScreen() {
  const {
    plannerMode,
    targetWakeHour,
    targetWakeMinute,
    selectedCycles,
    latencyMin,
    bedtimeOptions,
    twilightSchedule,
    setPlannerMode,
    setTargetWakeTime,
    setSelectedCycles,
    logTonightPlan,
  } = useSleepPlannerStore();

  const { themeMode } = useAppPreferencesStore();
  const { currentElevationDeg } = useCircadianStore();
  const isNight = themeMode === 'dark' || (themeMode === 'auto_circadian' && currentElevationDeg < 0);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePlan = async () => {
    await logTonightPlan();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const adjustWakeHour = (delta: number) => {
    let newHour = (targetWakeHour + delta + 24) % 24;
    setTargetWakeTime(newHour, targetWakeMinute);
  };

  const adjustWakeMinute = (delta: number) => {
    let newMinute = (targetWakeMinute + delta + 60) % 60;
    setTargetWakeTime(targetWakeHour, newMinute);
  };

  const dlmoFormatted = twilightSchedule
    ? `${String(twilightSchedule.dlmoStartTime.getHours()).padStart(2, '0')}:${String(
        twilightSchedule.dlmoStartTime.getMinutes()
      ).padStart(2, '0')}`
    : '21:45';

  return (
    <SafeAreaView className={`flex-1 ${isNight ? 'bg-[#161412]' : 'bg-[#EDE6D3]'}`}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Cabeçalho Editorial */}
        <View className="mb-4">
          <Text
            className={`font-label text-[10px] uppercase tracking-widest ${
              isNight ? 'text-[#E8A83E]' : 'text-[#D9922E]'
            } font-bold`}
          >
            Ciclos Ultradianos de 90 Minutos
          </Text>
          <Text
            className={`font-headline text-2xl font-extrabold ${
              isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
            }`}
          >
            Calculadora de Sono
          </Text>
        </View>

        {/* 1. Comutador de Intenção */}
        <View
          className={`flex-row p-1 rounded-xl border mb-4 ${
            isNight ? 'border-[#332D26] bg-[#221E1A]' : 'border-[#DDD6C1] bg-[#F4EFE2]'
          }`}
        >
          <Pressable
            onPress={() => setPlannerMode('wake_target')}
            className={`flex-1 py-3 rounded-lg items-center ${
              plannerMode === 'wake_target'
                ? isNight
                  ? 'bg-[#E8A83E] shadow-sm'
                  : 'bg-[#3A3A38] shadow-sm'
                : ''
            }`}
          >
            <Text
              className={`font-headline text-xs font-bold uppercase tracking-wider ${
                plannerMode === 'wake_target'
                  ? isNight
                    ? 'text-[#161412]'
                    : 'text-[#EDE6D3]'
                  : isNight
                  ? 'text-[#9E9789]'
                  : 'text-[#7A7875]'
              }`}
            >
              [ QUERO ACORDAR ÀS... ]
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPlannerMode('bed_now')}
            className={`flex-1 py-3 rounded-lg items-center ${
              plannerMode === 'bed_now'
                ? isNight
                  ? 'bg-[#E8A83E] shadow-sm'
                  : 'bg-[#3A3A38] shadow-sm'
                : ''
            }`}
          >
            <Text
              className={`font-headline text-xs font-bold uppercase tracking-wider ${
                plannerMode === 'bed_now'
                  ? isNight
                    ? 'text-[#161412]'
                    : 'text-[#EDE6D3]'
                  : isNight
                  ? 'text-[#9E9789]'
                  : 'text-[#7A7875]'
              }`}
            >
              [ VOU DORMIR AGORA ]
            </Text>
          </Pressable>
        </View>

        {/* 2. Seletor de Hora com Relógio Matricial Dot-Clock */}
        {plannerMode === 'wake_target' && (
          <View
            className={`rounded-2xl border p-5 mb-4 items-center ${
              isNight ? 'border-[#332D26] bg-[#221E1A]' : 'border-[#DDD6C1] bg-[#F4EFE2]'
            }`}
          >
            <Text
              className={`font-label text-xs uppercase tracking-widest mb-1 ${
                isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
              }`}
            >
              HORÁRIO ALVO DE DESPERTAR (DOT-CLOCK)
            </Text>

            <DotMatrixClock
              hours={targetWakeHour}
              minutes={targetWakeMinute}
              onAdjustHours={adjustWakeHour}
              onAdjustMinutes={adjustWakeMinute}
              isDark={isNight}
            />

            <Text
              className={`font-label text-[10px] uppercase tracking-wider mt-1 ${
                isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
              }`}
            >
              (Calculado com {latencyMin} min de latência média de adormecimento)
            </Text>
          </View>
        )}

        {/* 3. Os 3 Cartões de Ciclos Ultradianos */}
        <View className="mb-4">
          <Text
            className={`font-label text-xs uppercase tracking-widest mb-2 font-bold ${
              isNight ? 'text-[#E8A83E]' : 'text-[#D9922E]'
            }`}
          >
            Ciclos Ultradianos Disponíveis
          </Text>

          <View className="gap-3">
            {bedtimeOptions.map((opt) => {
              const isSelected = selectedCycles === opt.cycles;
              const isRecommended = opt.cycles === 5;

              let badgeLabel = 'CURTO';
              let badgeBg = isNight ? 'bg-[#332D26]' : 'bg-[#DDD6C1]';
              let badgeTextColor = isNight ? 'text-[#9E9789]' : 'text-[#7A7875]';

              if (opt.cycles === 5) {
                badgeLabel = 'RECOMENDADO';
                badgeBg = isNight ? 'bg-[#E8A83E]/20' : 'bg-[#D9922E]/20';
                badgeTextColor = isNight ? 'text-[#E8A83E]' : 'text-[#D9922E]';
              } else if (opt.cycles === 6) {
                badgeLabel = 'RECUPERAÇÃO';
                badgeBg = 'bg-[#3A6B4C]/20';
                badgeTextColor = 'text-[#3A6B4C]';
              }

              return (
                <Pressable
                  key={opt.cycles}
                  onPress={() => setSelectedCycles(opt.cycles)}
                  className={`rounded-2xl border p-4 transition-all ${
                    isRecommended
                      ? isNight
                        ? 'border-[#E8A83E] bg-[#221E1A]'
                        : 'border-[#D9922E] bg-[#F4EFE2]'
                      : isNight
                      ? 'border-[#332D26] bg-[#161412]'
                      : 'border-[#DDD6C1] bg-[#F4EFE2]/70'
                  } ${isSelected ? 'shadow-sm' : ''}`}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      <View className={`px-2.5 py-0.5 rounded-full ${badgeBg}`}>
                        <Text className={`font-label text-[10px] uppercase font-bold tracking-wider ${badgeTextColor}`}>
                          {badgeLabel}
                        </Text>
                      </View>
                      <Text
                        className={`font-headline text-base font-bold ${
                          isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
                        }`}
                      >
                        {opt.cycles} Ciclos ({opt.totalSleepHours}h00)
                      </Text>
                    </View>

                    <Text
                      className={`font-label text-xl font-black ${
                        isRecommended
                          ? isNight
                            ? 'text-[#E8A83E]'
                            : 'text-[#D9922E]'
                          : isNight
                          ? 'text-[#EDE6D3]'
                          : 'text-[#3A3A38]'
                      }`}
                    >
                      {plannerMode === 'wake_target' ? opt.bedtimeFormatted : opt.wakeTimeFormatted}
                    </Text>
                  </View>

                  <Text
                    className={`font-body text-xs leading-relaxed ${
                      isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
                    }`}
                  >
                    {plannerMode === 'wake_target'
                      ? `Deitar às ${opt.bedtimeFormatted} (com 14 min de latência) para despertar limpo no fim da fase REM.`
                      : `Acordar às ${opt.wakeTimeFormatted} sem acordar em sono profundo de ondas lentas N3.`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Botão de Fixar Horário */}
        <Pressable
          onPress={handleSavePlan}
          className={`py-4 rounded-xl items-center mb-4 ${
            isNight ? 'bg-[#E8A83E]' : 'bg-[#3A3A38]'
          } active:opacity-90`}
        >
          <Text
            className={`font-headline text-xs font-bold uppercase tracking-wider ${
              isNight ? 'text-[#161412]' : 'text-[#EDE6D3]'
            }`}
          >
            {savedSuccess ? '✓ Horário de Sono Fixado' : 'Fixar Horário Selecionado'}
          </Text>
        </Pressable>

        {/* 4. Aviso de Crepúsculo (Modo DLMO) */}
        <View
          className={`rounded-2xl border p-5 ${
            isNight ? 'border-[#332D26] bg-[#221E1A]' : 'border-[#DDD6C1] bg-[#F4EFE2]'
          }`}
        >
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-[#D9922E] font-bold">🟡</Text>
            <Text
              className={`font-label text-xs uppercase tracking-wider font-bold ${
                isNight ? 'text-[#E8A83E]' : 'text-[#D9922E]'
              }`}
            >
              Aviso de Crepúsculo (Modo DLMO)
            </Text>
          </View>

          <Text
            className={`font-body text-xs leading-relaxed ${
              isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
            }`}
          >
            A tua secreção de melatonina inicia-se às <Text className="font-bold">{dlmoFormatted}</Text>. Reduz luzes de teto e ecrãs azuis a partir desta hora para permitir o início natural da sonolência.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
