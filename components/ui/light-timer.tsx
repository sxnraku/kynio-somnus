import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useCircadianStore } from '@/store/use-circadian-store';

let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch {
  // Mock / Web fallback
}

interface LightTimerProps {
  isDark?: boolean;
}

export function LightTimer({ isDark = false }: LightTimerProps) {
  const {
    isTimerRunning,
    timerTargetMinutes,
    timerElapsedSeconds,
    timerCompleted,
    skyCondition,
    recommendationRationale,
    startLightTimer,
    tickTimer,
    pauseTimer,
    resetTimer,
    setSkyCondition,
  } = useCircadianStore();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, tickTimer]);

  const triggerHaptic = () => {
    try {
      if (Haptics?.impactAsync) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle?.Medium);
      }
    } catch {
      // Ignora em web
    }
  };

  const totalTargetSeconds = timerTargetMinutes * 60;
  const remainingSeconds = Math.max(0, totalTargetSeconds - timerElapsedSeconds);
  const minutesLeft = Math.floor(remainingSeconds / 60);
  const secondsLeft = remainingSeconds % 60;
  const timeFormatted = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

  const progress = totalTargetSeconds > 0 ? (timerElapsedSeconds / totalTargetSeconds) * 100 : 0;
  const accentColor = isDark ? '#E8A83E' : '#D9922E';

  // 4 Pontos Matriciais de Intensidade Fotónica
  const intensityDots = skyCondition === 'direct_sun' ? 4 : skyCondition === 'cloudy' ? 3 : 1;
  const luxEstimate = skyCondition === 'direct_sun' ? '~50.000 lux' : skyCondition === 'cloudy' ? '~12.000 lux' : '~1.000 lux';

  return (
    <View
      className={`rounded-xl border p-5 ${
        isDark ? 'border-[#332D26] bg-[#221E1A]' : 'border-[#DDD6C1] bg-[#F4EFE2]'
      }`}
    >
      {/* Cabeçalho do Cartão Tátil */}
      <View className="flex-row items-center justify-between mb-2">
        <Text
          className={`font-label text-xs uppercase tracking-widest ${
            isDark ? 'text-[#E8A83E]' : 'text-[#D9922E]'
          } font-bold`}
        >
          Banho de Luz Matinal
        </Text>

        {/* Barra de Intensidade Fotónica: 4 Pontos Matriciais */}
        <View className="flex-row items-center gap-1">
          <Text className="font-label text-[10px] text-[#7A7875] mr-1">LUX:</Text>
          {[1, 2, 3, 4].map((dot) => {
            const isFilled = dot <= intensityDots;
            return (
              <View
                key={dot}
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: isFilled ? accentColor : isDark ? '#332D26' : '#DDD6C1',
                  borderWidth: isFilled ? 0 : 1,
                  borderColor: isDark ? '#473E35' : '#C4BC9E',
                }}
              />
            );
          })}
          <Text className="font-label text-[10px] font-bold ml-1 text-[#7A7875]">{luxEstimate}</Text>
        </View>
      </View>

      {/* Título com Duração Alvo em Destaque */}
      <View className="flex-row items-baseline justify-between mb-3">
        <Text
          className={`font-headline text-3xl font-extrabold ${
            isDark ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
          }`}
        >
          {timerTargetMinutes} min
        </Text>

        <Text
          className={`font-label text-xs uppercase tracking-wider ${
            isDark ? 'text-[#9E9789]' : 'text-[#7A7875]'
          }`}
        >
          {skyCondition === 'direct_sun'
            ? 'Céu Limpo (Sol Direto)'
            : skyCondition === 'cloudy'
            ? 'Céu Nublado (Difuso)'
            : 'Exposição À Janela'}
        </Text>
      </View>

      {/* Seletor de Condição Atmosférica */}
      <View className="flex-row gap-1.5 mb-4">
        {[
          { key: 'direct_sun', label: 'Sol Direto (10m)' },
          { key: 'cloudy', label: 'Nublado (20m)' },
          { key: 'window', label: 'Janela (60m)' },
        ].map((item) => {
          const isSelected = skyCondition === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => {
                triggerHaptic();
                setSkyCondition(item.key as any);
              }}
              className={`flex-1 items-center py-2 rounded-lg border ${
                isSelected
                  ? isDark
                    ? 'border-[#E8A83E] bg-[#E8A83E]/20'
                    : 'border-[#D9922E] bg-[#D9922E]/15'
                  : isDark
                  ? 'border-[#332D26] bg-[#161412]'
                  : 'border-[#DDD6C1] bg-[#EDE6D3]'
              }`}
            >
              <Text
                className={`font-label text-[10px] uppercase tracking-wider ${
                  isSelected
                    ? isDark
                      ? 'text-[#E8A83E] font-bold'
                      : 'text-[#D9922E] font-bold'
                    : isDark
                    ? 'text-[#9E9789]'
                    : 'text-[#7A7875]'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Display do Cronómetro Digital & Barra Hairline */}
      <View className="items-center py-2">
        <Text
          className={`font-label text-5xl font-black tracking-tight ${
            isDark ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
          }`}
        >
          {timeFormatted}
        </Text>

        <View className="w-full bg-[#DDD6C1]/40 h-1.5 rounded-full mt-3 overflow-hidden">
          <View
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              backgroundColor: timerCompleted ? '#3A6B4C' : accentColor,
            }}
          />
        </View>

        <Text
          className={`font-body text-xs mt-2.5 text-center ${
            isDark ? 'text-[#9E9789]' : 'text-[#7A7875]'
          }`}
        >
          {timerCompleted
            ? '✓ Sessão concluída! Pico natural de cortisol ativado com sucesso.'
            : recommendationRationale}
        </Text>
      </View>

      {/* Botão de Ação Principal Táctil */}
      <View className="flex-row gap-2.5 mt-3">
        {!isTimerRunning ? (
          <Pressable
            onPress={() => {
              triggerHaptic();
              startLightTimer();
            }}
            className="flex-1 items-center justify-center rounded-xl bg-[#D9922E] py-4 shadow-sm active:bg-[#C27E20]"
          >
            <Text className="font-headline text-sm font-bold text-white uppercase tracking-wider">
              {timerElapsedSeconds > 0 ? 'Continuar Banho de Luz' : 'Iniciar Banho de Luz'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              triggerHaptic();
              pauseTimer();
            }}
            className="flex-1 items-center justify-center rounded-xl bg-[#3A3A38] py-4 shadow-sm active:bg-[#161412]"
          >
            <Text className="font-headline text-sm font-bold text-[#EDE6D3] uppercase tracking-wider">
              Pausar Banho de Luz
            </Text>
          </Pressable>
        )}

        {timerElapsedSeconds > 0 && (
          <Pressable
            onPress={() => {
              triggerHaptic();
              resetTimer();
            }}
            className={`items-center justify-center px-4 rounded-xl border ${
              isDark ? 'border-[#332D26] bg-[#161412]' : 'border-[#DDD6C1] bg-[#EDE6D3]'
            }`}
          >
            <Text
              className={`font-label text-xs uppercase tracking-widest ${
                isDark ? 'text-[#9E9789]' : 'text-[#7A7875]'
              }`}
            >
              Reiniciar
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
