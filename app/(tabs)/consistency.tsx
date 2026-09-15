import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Circle, Path } from 'react-native-svg';
import { calculateCircadianStability, type CircadianStabilityReport, type DaySleepLog } from '@/services/circadianIndexService';
import { useSleepPlannerStore } from '@/store/use-sleep-planner-store';
import { useAppPreferencesStore } from '@/store/app-preferences-store';
import { useCircadianStore } from '@/store/use-circadian-store';

// 5 Ícones Solares Graduais (de sol tímido a sol pleno no zénite)
function GradualSolarIcon({ level, isSelected, isDark }: { level: number; isSelected: boolean; isDark: boolean }) {
  const color = isSelected
    ? isDark
      ? '#E8A83E'
      : '#D9922E'
    : isDark
    ? '#9E9789'
    : '#7A7875';

  const size = 32;

  switch (level) {
    case 1:
      // Sol tímido no horizonte (1/4 de disco)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Line x1="2" y1="18" x2="22" y2="18" stroke={color} strokeWidth="2" />
          <Path d="M 7 18 A 5 5 0 0 1 17 18" fill="none" stroke={color} strokeWidth="2" />
        </Svg>
      );
    case 2:
      // Meio sol no horizonte
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Line x1="2" y1="17" x2="22" y2="17" stroke={color} strokeWidth="2" />
          <Path d="M 6 17 A 6 6 0 0 1 18 17" fill={color} fillOpacity={0.4} stroke={color} strokeWidth="1.5" />
          <Line x1="12" y1="7" x2="12" y2="4" stroke={color} strokeWidth="1.5" />
          <Line x1="6" y1="9" x2="4" y2="7" stroke={color} strokeWidth="1.5" />
          <Line x1="18" y1="9" x2="20" y2="7" stroke={color} strokeWidth="1.5" />
        </Svg>
      );
    case 3:
      // Sol neutro completo sem raios longos
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="6" fill={color} fillOpacity={0.3} stroke={color} strokeWidth="2" />
        </Svg>
      );
    case 4:
      // Sol desperto com 4 raios
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="5" fill={color} fillOpacity={0.6} stroke={color} strokeWidth="2" />
          <Line x1="12" y1="2" x2="12" y2="4" stroke={color} strokeWidth="2" />
          <Line x1="12" y1="20" x2="12" y2="22" stroke={color} strokeWidth="2" />
          <Line x1="2" y1="12" x2="4" y2="12" stroke={color} strokeWidth="2" />
          <Line x1="20" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" />
        </Svg>
      );
    case 5:
    default:
      // Sol pleno no zénite com 8 raios radiantes
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="5.5" fill={color} stroke={color} strokeWidth="1.5" />
          <Line x1="12" y1="1" x2="12" y2="3.5" stroke={color} strokeWidth="2" />
          <Line x1="12" y1="20.5" x2="12" y2="23" stroke={color} strokeWidth="2" />
          <Line x1="1" y1="12" x2="3.5" y2="12" stroke={color} strokeWidth="2" />
          <Line x1="20.5" y1="12" x2="23" y2="12" stroke={color} strokeWidth="2" />
          <Line x1="4.5" y1="4.5" x2="6.2" y2="6.2" stroke={color} strokeWidth="1.8" />
          <Line x1="17.8" y1="17.8" x2="19.5" y2="19.5" stroke={color} strokeWidth="1.8" />
          <Line x1="4.5" y1="19.5" x2="6.2" y2="17.8" stroke={color} strokeWidth="1.8" />
          <Line x1="17.8" y1="6.2" x2="19.5" y2="4.5" stroke={color} strokeWidth="1.8" />
        </Svg>
      );
  }
}

export default function ConsistencyScreen() {
  const { logMorningRating } = useSleepPlannerStore();
  const { themeMode } = useAppPreferencesStore();
  const { currentElevationDeg } = useCircadianStore();
  const isNight = themeMode === 'dark' || (themeMode === 'auto_circadian' && currentElevationDeg < 0);

  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(null);
  const [ratedToday, setRatedToday] = useState(false);

  const sampleLogs: DaySleepLog[] = [
    { date: '2026-09-09', bedtimeHour: 23, bedtimeMinute: 15, wakeHour: 7, wakeMinute: 0, isWeekend: false, receivedMorningLight: true },
    { date: '2026-09-10', bedtimeHour: 23, bedtimeMinute: 0, wakeHour: 7, wakeMinute: 10, isWeekend: false, receivedMorningLight: true },
    { date: '2026-09-11', bedtimeHour: 23, bedtimeMinute: 30, wakeHour: 7, wakeMinute: 15, isWeekend: false, receivedMorningLight: true },
    { date: '2026-09-12', bedtimeHour: 23, bedtimeMinute: 10, wakeHour: 7, wakeMinute: 5, isWeekend: false, receivedMorningLight: true },
    { date: '2026-09-13', bedtimeHour: 23, bedtimeMinute: 45, wakeHour: 7, wakeMinute: 45, isWeekend: true, receivedMorningLight: true },
    { date: '2026-09-14', bedtimeHour: 23, bedtimeMinute: 20, wakeHour: 7, wakeMinute: 25, isWeekend: true, receivedMorningLight: true },
    { date: '2026-09-15', bedtimeHour: 23, bedtimeMinute: 10, wakeHour: 7, wakeMinute: 0, isWeekend: false, receivedMorningLight: true },
  ];

  const report: CircadianStabilityReport = calculateCircadianStability(sampleLogs);

  const handleRateEnergy = async (score: number) => {
    setSelectedEnergy(score);
    await logMorningRating(score);
    setRatedToday(true);
  };

  const sunColor = isNight ? '#E8A83E' : '#D9922E';
  const borderColor = isNight ? '#332D26' : '#DDD6C1';
  const cardBg = isNight ? 'bg-[#221E1A]' : 'bg-[#F4EFE2]';

  // Coordenadas para o gráfico do Horizonte de Consistência (7 dias)
  const chartWidth = 300;
  const chartHeight = 110;
  const colSpacing = chartWidth / 7;
  // Mapeia minutos de acordar (ex.: 07:00 a 07:45) para Y (60..30)
  const points = sampleLogs.map((log, i) => {
    const x = i * colSpacing + colSpacing / 2;
    const wakeDiff = (log.wakeHour * 60 + log.wakeMinute) - 420; // desvio relativo a 07:00
    const y = Math.max(20, Math.min(90, 55 - wakeDiff));
    return { x, y, day: ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'][i] };
  });

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
            Métricas Éticas de Ritmo
          </Text>
          <Text
            className={`font-headline text-2xl font-extrabold ${
              isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
            }`}
          >
            Ritmo & Consistência
          </Text>
        </View>

        {/* 1. Horizonte de Consistência Semanal (7 Barras Verticais + Linha Âmbar) */}
        <View className={`rounded-2xl border ${borderColor} ${cardBg} p-5 mb-4`}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className={`font-label text-xs uppercase tracking-widest ${sunColor} font-bold`}>
              Horizonte de Consistência Semanal
            </Text>
            <Text className="font-label text-[10px] text-[#7A7875]">
              Desvio &lt; 30m: Linha Contínua
            </Text>
          </View>

          {/* SVG do Horizonte de Consistência */}
          <View className="items-center my-2">
            <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              {/* Linhas de grelha horizontal */}
              <Line x1="0" y1="35" x2={chartWidth} y2="35" stroke={borderColor} strokeWidth="1" strokeDasharray="3,3" />
              <Line x1="0" y1="75" x2={chartWidth} y2="75" stroke={borderColor} strokeWidth="1" strokeDasharray="3,3" />

              {/* 7 Barras Verticais */}
              {points.map((p, idx) => (
                <Line
                  key={idx}
                  x1={p.x}
                  y1={20}
                  x2={p.x}
                  y2={90}
                  stroke={borderColor}
                  strokeWidth="1.5"
                  opacity={0.6}
                />
              ))}

              {/* Linha Contínua Âmbar conectando as horas de despertar */}
              <Path
                d={`M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`}
                fill="none"
                stroke={sunColor}
                strokeWidth="2.5"
              />

              {/* Pontos da Âncora de Luz Matinal */}
              {points.map((p, idx) => (
                <Circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  fill={sunColor}
                  stroke={isNight ? '#221E1A' : '#F4EFE2'}
                  strokeWidth="2"
                />
              ))}
            </Svg>

            {/* Dias da semana por baixo das barras */}
            <View className="flex-row justify-between w-[300px] mt-1">
              {points.map((p, idx) => (
                <Text
                  key={idx}
                  className={`font-label text-[9px] font-bold ${
                    isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
                  }`}
                >
                  {p.day}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* 2. Métricas de Estabilidade */}
        <View className="flex-row gap-3 mb-4">
          {/* Índice de Estabilidade Circadiana */}
          <View className={`flex-1 rounded-xl border ${borderColor} ${cardBg} p-4 items-center`}>
            <Text className="font-label text-[10px] uppercase tracking-wider text-[#7A7875]">
              Estabilidade Circadiana
            </Text>
            <Text className={`font-headline text-3xl font-black my-1 ${sunColor}`}>
              {report.stabilityScore}%
            </Text>
            <Text className="font-label text-[10px] text-[#3A6B4C] font-bold">
              {report.consistencyGrade}
            </Text>
          </View>

          {/* Social Jetlag */}
          <View className={`flex-1 rounded-xl border ${borderColor} ${cardBg} p-4 items-center`}>
            <Text className="font-label text-[10px] uppercase tracking-wider text-[#7A7875]">
              Social Jetlag
            </Text>
            <Text className={`font-headline text-3xl font-black my-1 ${isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'}`}>
              {report.socialJetlagMinutes} min
            </Text>
            <Text className={`font-label text-[10px] ${report.socialJetlagMinutes <= 45 ? 'text-[#3A6B4C]' : 'text-[#D9922E]'} font-bold`}>
              {report.socialJetlagMinutes <= 45 ? '✓ Excelente' : 'Ajuste Suave'}
            </Text>
          </View>
        </View>

        {/* 3. Check-in Matinal de 1 Toque (5 Ícones Solares Graduais) */}
        <View className={`rounded-2xl border ${borderColor} ${cardBg} p-5 mb-4`}>
          <Text className={`font-label text-xs uppercase tracking-widest mb-1 font-bold ${sunColor}`}>
            Como acordaste hoje?
          </Text>
          <Text className={`font-body text-xs mb-4 ${isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'}`}>
            {ratedToday
              ? '✓ Feedback de energia matinal registado com sucesso.'
              : '1 Toque de prontidão biológica (do sol no horizonte ao zénite pleno):'}
          </Text>

          <View className="flex-row justify-between gap-1">
            {[1, 2, 3, 4, 5].map((level) => {
              const isSelected = selectedEnergy === level;
              const labels = ['Tímido', 'Lento', 'Neutro', 'Desperto', 'Zénite'];
              return (
                <Pressable
                  key={level}
                  onPress={() => handleRateEnergy(level)}
                  className={`flex-1 items-center py-3 rounded-xl border ${
                    isSelected
                      ? isNight
                        ? 'border-[#E8A83E] bg-[#E8A83E]/20'
                        : 'border-[#D9922E] bg-[#D9922E]/20'
                      : isNight
                      ? 'border-[#332D26] bg-[#161412]'
                      : 'border-[#DDD6C1] bg-[#EDE6D3]'
                  } active:scale-95 transition-all`}
                >
                  <GradualSolarIcon level={level} isSelected={isSelected} isDark={isNight} />
                  <Text
                    className={`font-label text-[9px] uppercase tracking-wider mt-2 ${
                      isSelected
                        ? isNight
                          ? 'text-[#E8A83E] font-bold'
                          : 'text-[#D9922E] font-bold'
                        : isNight
                        ? 'text-[#9E9789]'
                        : 'text-[#7A7875]'
                    }`}
                  >
                    {labels[level - 1]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Orientações Circadianas */}
        <View className={`rounded-xl border ${borderColor} ${isNight ? 'bg-[#161412]' : 'bg-[#EDE6D3]'} p-4`}>
          <Text className={`font-label text-xs uppercase tracking-wider mb-2 font-bold ${sunColor}`}>
            Princípios do Social Jetlag
          </Text>
          <Text className={`font-body text-xs leading-relaxed ${isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'}`}>
            A estabilidade circadiana protege a sincronia das ondas lentas de sono profundo. Dormir mais 2 ou 3 horas no fim de semana desloca o relógio central do hipotálamo, gerando fadiga cognitiva na segunda-feira ("Segunda-Feira Social").
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
