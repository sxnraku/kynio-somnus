import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const FONT_5X7: Record<string, number[]> = {
  '0': [
    0b01110,
    0b10001,
    0b10011,
    0b10101,
    0b11001,
    0b10001,
    0b01110,
  ],
  '1': [
    0b00100,
    0b01100,
    0b00100,
    0b00100,
    0b00100,
    0b00100,
    0b01110,
  ],
  '2': [
    0b01110,
    0b10001,
    0b00001,
    0b00110,
    0b01000,
    0b10000,
    0b11111,
  ],
  '3': [
    0b01110,
    0b10001,
    0b00001,
    0b00110,
    0b00001,
    0b10001,
    0b01110,
  ],
  '4': [
    0b00010,
    0b00110,
    0b01010,
    0b10010,
    0b11111,
    0b00010,
    0b00010,
  ],
  '5': [
    0b11111,
    0b10000,
    0b11110,
    0b00001,
    0b00001,
    0b10001,
    0b01110,
  ],
  '6': [
    0b01110,
    0b10000,
    0b11110,
    0b10001,
    0b10001,
    0b10001,
    0b01110,
  ],
  '7': [
    0b11111,
    0b00001,
    0b00010,
    0b00100,
    0b01000,
    0b01000,
    0b01000,
  ],
  '8': [
    0b01110,
    0b10001,
    0b10001,
    0b01110,
    0b10001,
    0b10001,
    0b01110,
  ],
  '9': [
    0b01110,
    0b10001,
    0b10001,
    0b01111,
    0b00001,
    0b00010,
    0b01100,
  ],
};

function DotMatrixDigit({
  char,
  dotRadius = 2,
  spacing = 6,
  activeColor = '#D9922E',
  inactiveColor = '#DDD6C1',
}: {
  char: string;
  dotRadius?: number;
  spacing?: number;
  activeColor?: string;
  inactiveColor?: string;
}) {
  const pattern = FONT_5X7[char] ?? FONT_5X7['0'];
  const width = 5 * spacing;
  const height = 7 * spacing;

  const circles = [];
  for (let row = 0; row < 7; row++) {
    const rowBits = pattern[row];
    for (let col = 0; col < 5; col++) {
      const bit = (rowBits >> (4 - col)) & 1;
      const cx = col * spacing + dotRadius + 1;
      const cy = row * spacing + dotRadius + 1;
      circles.push(
        <Circle
          key={`${row}-${col}`}
          cx={cx}
          cy={cy}
          r={dotRadius}
          fill={bit === 1 ? activeColor : inactiveColor}
          opacity={bit === 1 ? 1 : 0.25}
        />
      );
    }
  }

  return (
    <Svg width={width + 2} height={height + 2}>
      {circles}
    </Svg>
  );
}

function DotMatrixColon({
  dotRadius = 2,
  spacing = 6,
  activeColor = '#D9922E',
}: {
  dotRadius?: number;
  spacing?: number;
  activeColor?: string;
}) {
  return (
    <Svg width={spacing * 2} height={7 * spacing + 2}>
      <Circle cx={spacing} cy={2 * spacing + dotRadius + 1} r={dotRadius} fill={activeColor} />
      <Circle cx={spacing} cy={4 * spacing + dotRadius + 1} r={dotRadius} fill={activeColor} />
    </Svg>
  );
}

interface DotMatrixClockProps {
  hours: number;
  minutes: number;
  onAdjustHours?: (delta: number) => void;
  onAdjustMinutes?: (delta: number) => void;
  isDark?: boolean;
}

export function DotMatrixClock({
  hours,
  minutes,
  onAdjustHours,
  onAdjustMinutes,
  isDark = false,
}: DotMatrixClockProps) {
  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');

  const activeColor = isDark ? '#E8A83E' : '#D9922E';
  const inactiveColor = isDark ? '#332D26' : '#DDD6C1';
  const buttonBg = isDark ? 'bg-[#332D26]' : 'bg-[#DDD6C1]';
  const buttonText = isDark ? 'text-[#EDE6D3]' : 'text-[#3A3A38]';

  return (
    <View className="items-center py-2">
      {/* Indicador de Matriz Superior */}
      <View className="flex-row items-center justify-center gap-6 mb-3">
        {/* Bloco de Horas */}
        <View className="items-center">
          {onAdjustHours && (
            <Pressable
              onPress={() => onAdjustHours(1)}
              accessibilityLabel="Aumentar hora"
              className={`px-4 py-1.5 rounded-lg mb-2 ${buttonBg} active:opacity-75`}
            >
              <Text className={`font-label font-bold text-xs ${buttonText}`}>▲ +1H</Text>
            </Pressable>
          )}

          <View className="flex-row gap-1.5 p-2 rounded-xl border border-[#DDD6C1]/40 bg-[#EDE6D3]/30">
            <DotMatrixDigit char={hStr[0]} activeColor={activeColor} inactiveColor={inactiveColor} />
            <DotMatrixDigit char={hStr[1]} activeColor={activeColor} inactiveColor={inactiveColor} />
          </View>

          {onAdjustHours && (
            <Pressable
              onPress={() => onAdjustHours(-1)}
              accessibilityLabel="Diminuir hora"
              className={`px-4 py-1.5 rounded-lg mt-2 ${buttonBg} active:opacity-75`}
            >
              <Text className={`font-label font-bold text-xs ${buttonText}`}>▼ -1H</Text>
            </Pressable>
          )}
        </View>

        {/* Separador de Dois Pontos */}
        <View className="pt-2">
          <DotMatrixColon activeColor={activeColor} />
        </View>

        {/* Bloco de Minutos */}
        <View className="items-center">
          {onAdjustMinutes && (
            <Pressable
              onPress={() => onAdjustMinutes(15)}
              accessibilityLabel="Aumentar minutos"
              className={`px-4 py-1.5 rounded-lg mb-2 ${buttonBg} active:opacity-75`}
            >
              <Text className={`font-label font-bold text-xs ${buttonText}`}>▲ +15M</Text>
            </Pressable>
          )}

          <View className="flex-row gap-1.5 p-2 rounded-xl border border-[#DDD6C1]/40 bg-[#EDE6D3]/30">
            <DotMatrixDigit char={mStr[0]} activeColor={activeColor} inactiveColor={inactiveColor} />
            <DotMatrixDigit char={mStr[1]} activeColor={activeColor} inactiveColor={inactiveColor} />
          </View>

          {onAdjustMinutes && (
            <Pressable
              onPress={() => onAdjustMinutes(-15)}
              accessibilityLabel="Diminuir minutos"
              className={`px-4 py-1.5 rounded-lg mt-2 ${buttonBg} active:opacity-75`}
            >
              <Text className={`font-label font-bold text-xs ${buttonText}`}>▼ -15M</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
