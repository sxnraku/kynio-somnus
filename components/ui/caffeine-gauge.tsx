import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  getCaffeineWindowStatus,
  calculateRemainingCaffeineMg,
  COMMON_CAFFEINE_SOURCES,
} from '@/services/caffeineMetabolismService';
import { recordCaffeineEntry } from '@/services/dbService';

interface CaffeineGaugeProps {
  bedtimeHour?: number;
  halfLifeHours?: number;
  isDark?: boolean;
}

export function CaffeineGauge({
  bedtimeHour = 23,
  halfLifeHours = 5.5,
  isDark = false,
}: CaffeineGaugeProps) {
  const currentHour = new Date().getHours();
  const windowStatus = getCaffeineWindowStatus(currentHour, bedtimeHour, halfLifeHours);

  const [consumedMg, setConsumedMg] = useState(160);
  const [activeMgAtBedtime, setActiveMgAtBedtime] = useState(28);
  const [showQuickLog, setShowQuickLog] = useState(false);

  const handleLogIntake = async (amountMg: number, source: string) => {
    const nextConsumed = consumedMg + amountMg;
    setConsumedMg(nextConsumed);

    // Estimativa de cafeína residual às 23:00
    const now = new Date();
    const tonightBedtime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), bedtimeHour, 0, 0);
    const residual = Math.round(calculateRemainingCaffeineMg(amountMg, now, tonightBedtime, halfLifeHours));
    setActiveMgAtBedtime((prev) => prev + residual);

    setShowQuickLog(false);
    try {
      await recordCaffeineEntry({
        id: `caffeine_${Date.now()}`,
        amountMg,
        source,
        consumedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    } catch {
      // Local
    }
  };

  const cutoffFormatted = `${String(windowStatus.cutoffHour).padStart(2, '0')}:15`;

  // Barra de duas zonas: percentagem segura vs zona de sono
  const safeZonePercentage = 65; // ~65% do dia até ao corte
  const activeZonePercentage = 35;

  return (
    <View
      className={`rounded-xl border p-5 ${
        isDark ? 'border-[#332D26] bg-[#221E1A]' : 'border-[#DDD6C1] bg-[#F4EFE2]'
      }`}
    >
      {/* Cabeçalho */}
      <View className="flex-row items-center justify-between mb-2">
        <Text
          className={`font-label text-xs uppercase tracking-widest ${
            isDark ? 'text-[#E8A83E]' : 'text-[#D9922E]'
          } font-bold`}
        >
          Depuração Metabólica de Cafeína
        </Text>
        <View
          className={`px-2.5 py-0.5 rounded-full border ${
            windowStatus.isWindowOpen
              ? 'border-[#3A6B4C]/40 bg-[#3A6B4C]/10'
              : 'border-[#943D3D]/40 bg-[#943D3D]/10'
          }`}
        >
          <Text
            className={`font-label text-[10px] uppercase tracking-wider font-bold ${
              windowStatus.isWindowOpen ? 'text-[#3A6B4C]' : 'text-[#943D3D]'
            }`}
          >
            {windowStatus.isWindowOpen ? 'Zona Segura' : 'Janela Bloqueada'}
          </Text>
        </View>
      </View>

      {/* Destaque do Corte Recomendado */}
      <View className="flex-row items-baseline justify-between mt-1 mb-2">
        <View>
          <Text
            className={`font-label text-[11px] uppercase tracking-wider ${
              isDark ? 'text-[#9E9789]' : 'text-[#7A7875]'
            }`}
          >
            CORTE RECOMENDADO:
          </Text>
          <Text
            className={`font-headline text-3xl font-black ${
              isDark ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
            }`}
          >
            {cutoffFormatted}
          </Text>
        </View>

        <View className="items-end">
          <Text
            className={`font-label text-xs font-bold ${
              activeMgAtBedtime > 30 ? 'text-[#D9922E]' : 'text-[#3A6B4C]'
            }`}
          >
            ~{activeMgAtBedtime} mg ativos às {bedtimeHour}:00
          </Text>
          <Text
            className={`font-label text-[10px] uppercase tracking-wider ${
              isDark ? 'text-[#9E9789]' : 'text-[#7A7875]'
            }`}
          >
            {consumedMg} mg consumidos hoje
          </Text>
        </View>
      </View>

      {/* Barra Horizontal de Duas Zonas */}
      <View className="my-2">
        <View className="h-3 rounded-full overflow-hidden flex-row border border-[#DDD6C1]/40 bg-[#161412]/10">
          {/* Zona Segura: Verde Oliva Circadiano #3A6B4C */}
          <View
            style={{ width: `${safeZonePercentage}%` }}
            className="bg-[#3A6B4C] h-full"
          />
          {/* Zona Ativa no Sono: Âmbar/Carvão */}
          <View
            style={{ width: `${activeZonePercentage}%` }}
            className={windowStatus.isWindowOpen ? 'bg-[#D9922E]/50 h-full' : 'bg-[#D9922E] h-full'}
          />
        </View>

        <View className="flex-row justify-between mt-1">
          <Text className="font-label text-[9px] uppercase tracking-widest text-[#3A6B4C] font-bold">
            ◄ Zona Segura (Manhã)
          </Text>
          <Text className="font-label text-[9px] uppercase tracking-widest text-[#D9922E] font-bold">
            Zona Ativa no Sono (Noite) ►
          </Text>
        </View>
      </View>

      {/* Rótulo Explicativo */}
      <Text
        className={`font-body text-xs leading-relaxed mt-1 mb-3 ${
          isDark ? 'text-[#9E9789]' : 'text-[#7A7875]'
        }`}
      >
        {windowStatus.statusMessage} A adenosina é o neuromodulador da pressão de sono; a cafeína bloqueia os seus recetores mesmo que adormeça com facilidade.
      </Text>

      {/* Botão de Registo Rápido */}
      {!showQuickLog ? (
        <Pressable
          onPress={() => setShowQuickLog(true)}
          className={`py-2.5 rounded-xl border items-center ${
            isDark ? 'border-[#332D26] bg-[#161412]' : 'border-[#DDD6C1] bg-[#EDE6D3]'
          }`}
        >
          <Text
            className={`font-label text-xs uppercase tracking-widest font-bold ${
              isDark ? 'text-[#E8A83E]' : 'text-[#D9922E]'
            }`}
          >
            + Registar Café ou Chá
          </Text>
        </Pressable>
      ) : (
        <View className="gap-2">
          <Text
            className={`font-label text-[10px] uppercase tracking-wider ${
              isDark ? 'text-[#9E9789]' : 'text-[#7A7875]'
            }`}
          >
            Selecione a fonte consumida:
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {COMMON_CAFFEINE_SOURCES.slice(0, 4).map((src) => (
              <Pressable
                key={src.id}
                onPress={() => handleLogIntake(src.defaultMg, src.id)}
                className={`px-3 py-2 rounded-lg border ${
                  isDark ? 'border-[#332D26] bg-[#161412]' : 'border-[#DDD6C1] bg-[#EDE6D3]'
                }`}
              >
                <Text
                  className={`font-label text-xs ${
                    isDark ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
                  }`}
                >
                  {src.name} ({src.defaultMg}mg)
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
