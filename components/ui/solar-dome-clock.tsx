import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface SolarDomeClockProps {
  elevationDeg: number;
  sunriseStr?: string;
  sunsetStr?: string;
  solarNoonStr?: string;
  isDark?: boolean;
  weeklyStreak?: boolean[]; // [M, T, W, T, F, S, S]
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function SolarDomeClock({
  elevationDeg,
  sunriseStr = '06:45',
  sunsetStr = '19:45',
  solarNoonStr = '13:24',
  isDark = false,
  weeklyStreak = [true, true, true, true, false, false, false],
}: SolarDomeClockProps) {
  const width = 320;
  const height = 175;
  const cx = width / 2; // 160
  const cy = 120;
  const rx = 135;
  const ry = 95;

  const isDay = elevationDeg >= 0;

  // Normalização da posição do sol na cúpula (0: nascer, 0.5: zénite, 1: pôr)
  const progressRatio = Math.max(0.06, Math.min(0.94, isDay ? 0.5 + (elevationDeg - 30) / 100 : 0.5));
  const angleRad = Math.PI * (1 - progressRatio);
  const sunX = cx + rx * Math.cos(angleRad);
  const sunY = isDay ? cy - ry * Math.sin(angleRad) : cy + 18;

  const strokeColor = isDark ? '#332D26' : '#DDD6C1';
  const sunColor = isDark ? '#E8A83E' : '#D9922E';
  const textColor = isDark ? '#9E9789' : '#7A7875';
  const headlineColor = isDark ? '#EDE6D3' : '#3A3A38';

  return (
    <View className="items-center py-2">
      {/* Rótulo de Laboratório: Elevação Zenital e Horário do Zénite */}
      <View className="flex-row justify-between w-full px-2 mb-2">
        <View className="flex-row items-center gap-1.5">
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: isDay ? sunColor : '#7A7875' }}
          />
          <Text className="font-label text-[11px] uppercase tracking-wider font-bold" style={{ color: headlineColor }}>
            SOLAR ELEVATION: {elevationDeg >= 0 ? `+${elevationDeg.toFixed(1)}°` : `${elevationDeg.toFixed(1)}°`}
          </Text>
        </View>

        <Text className="font-label text-[11px] uppercase tracking-wider font-bold" style={{ color: sunColor }}>
          ZENITH: {solarNoonStr}
        </Text>
      </View>

      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="domeGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={sunColor} stopOpacity={isDark ? "0.22" : "0.18"} />
            <Stop offset="1" stopColor={sunColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Arco da Cúpula Celeste preenchido */}
        <Path
          d={`M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy} Z`}
          fill="url(#domeGrad)"
        />

        {/* Linha do Arco Superior com Hairline */}
        <Path
          d={`M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeDasharray="4,4"
        />

        {/* Linha do Horizonte */}
        <Line
          x1={cx - rx - 15}
          y1={cy}
          x2={cx + rx + 15}
          y2={cy}
          stroke={isDark ? '#473E35' : '#C4BC9E'}
          strokeWidth="1.5"
        />

        {/* Marcador do Zénite Diário */}
        <Line
          x1={cx}
          y1={cy - ry}
          x2={cx}
          y2={cy - ry + 8}
          stroke={strokeColor}
          strokeWidth="1.5"
        />

        {/* Sol com Anel Radiante */}
        {isDay && (
          <>
            {/* Anel radiante externo */}
            <Circle
              cx={sunX}
              cy={sunY}
              r={16}
              stroke={sunColor}
              strokeWidth="1"
              strokeDasharray="2,3"
              fill="none"
              opacity={0.6}
            />
            {/* Halo suave */}
            <Circle
              cx={sunX}
              cy={sunY}
              r={11}
              fill={sunColor}
              fillOpacity={0.25}
            />
            {/* Núcleo do Sol */}
            <Circle
              cx={sunX}
              cy={sunY}
              r={6.5}
              fill={sunColor}
              stroke={isDark ? '#161412' : '#EDE6D3'}
              strokeWidth="2"
            />
          </>
        )}

        {!isDay && (
          <Circle
            cx={cx}
            cy={cy + 14}
            r={5}
            fill="#7A7875"
            opacity={0.7}
          />
        )}
      </Svg>

      {/* Sequência Semanal de Luz Matinal (Dot-Clock M T W T F S S) */}
      <View
        className={`flex-row items-center justify-center gap-3 px-4 py-2 rounded-full border mb-3 ${
          isDark ? 'border-[#332D26] bg-[#221E1A]' : 'border-[#DDD6C1] bg-[#F4EFE2]'
        }`}
      >
        <Text className="font-label text-[9px] uppercase tracking-widest text-[#7A7875] mr-1">
          ÂNCORA:
        </Text>
        {WEEKDAYS.map((day, idx) => {
          const isDone = weeklyStreak[idx] ?? false;
          return (
            <View key={idx} className="items-center">
              <View
                className="w-2.5 h-2.5 rounded-full mb-0.5"
                style={{
                  backgroundColor: isDone ? sunColor : isDark ? '#332D26' : '#DDD6C1',
                  borderWidth: isDone ? 0 : 1,
                  borderColor: isDark ? '#473E35' : '#C4BC9E',
                }}
              />
              <Text
                className={`font-label text-[9px] ${
                  isDone ? (isDark ? 'text-[#E8A83E]' : 'text-[#D9922E]') : 'text-[#7A7875]'
                } font-bold`}
              >
                {day}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Rótulos dos Horários Astronómicos */}
      <View className="flex-row justify-between w-full px-4">
        <View className="items-start">
          <Text className="font-label text-[10px] uppercase tracking-wider" style={{ color: textColor }}>
            Nascer
          </Text>
          <Text className="font-label text-xs font-bold" style={{ color: headlineColor }}>
            {sunriseStr}
          </Text>
        </View>

        <View className="items-center">
          <Text className="font-label text-[10px] uppercase tracking-wider" style={{ color: textColor }}>
            Meio-Dia Solar
          </Text>
          <Text className="font-label text-xs font-bold" style={{ color: headlineColor }}>
            {solarNoonStr}
          </Text>
        </View>

        <View className="items-end">
          <Text className="font-label text-[10px] uppercase tracking-wider" style={{ color: textColor }}>
            Pôr do Sol
          </Text>
          <Text className="font-label text-xs font-bold" style={{ color: headlineColor }}>
            {sunsetStr}
          </Text>
        </View>
      </View>
    </View>
  );
}
