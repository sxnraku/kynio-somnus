import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface CycleOption {
  cycles: number;
  label: string;
  duration: string;
  tag: string;
  tagColor: string;
}

const CYCLE_OPTIONS: CycleOption[] = [
  { cycles: 4, label: '4 Ciclos', duration: '6h00', tag: 'Curto', tagColor: '#7A7875' },
  { cycles: 5, label: '5 Ciclos', duration: '7h30', tag: 'Padrão', tagColor: '#D9922E' },
  { cycles: 6, label: '6 Ciclos', duration: '9h00', tag: 'Recuperação', tagColor: '#3A6B4C' },
];

interface CycleSelectorProps {
  selectedCycles: number;
  onSelectCycles: (cycles: number) => void;
  isDark?: boolean;
}

export function CycleSelector({ selectedCycles, onSelectCycles, isDark = false }: CycleSelectorProps) {
  return (
    <View className="flex-row gap-2 py-2">
      {CYCLE_OPTIONS.map((opt) => {
        const isSelected = selectedCycles === opt.cycles;
        return (
          <Pressable
            key={opt.cycles}
            onPress={() => onSelectCycles(opt.cycles)}
            accessibilityRole="button"
            accessibilityLabel={`${opt.cycles} ciclos`}
            className={`flex-1 items-center rounded-xl border p-3.5 transition-all ${
              isSelected
                ? isDark
                  ? 'border-[#E8A83E] bg-[#E8A83E]/20 shadow-sm'
                  : 'border-[#D9922E] bg-[#D9922E]/15 shadow-sm'
                : isDark
                ? 'border-[#332D26] bg-[#221E1A]'
                : 'border-[#DDD6C1] bg-[#F4EFE2]'
            }`}
          >
            <View className="flex-row items-center gap-1 mb-1">
              <View
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: opt.tagColor }}
              />
              <Text
                className={`font-label text-[10px] uppercase tracking-widest ${
                  isDark ? 'text-[#9E9789]' : 'text-[#7A7875]'
                }`}
              >
                {opt.tag}
              </Text>
            </View>

            <Text
              className={`font-headline text-base font-bold ${
                isDark ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
              }`}
            >
              {opt.label}
            </Text>

            <Text
              className={`font-label text-xs mt-0.5 ${
                isSelected
                  ? isDark
                    ? 'text-[#E8A83E] font-bold'
                    : 'text-[#D9922E] font-bold'
                  : isDark
                  ? 'text-[#9E9789]'
                  : 'text-[#7A7875]'
              }`}
            >
              {opt.duration}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
