import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppPreferencesStore } from '@/store/app-preferences-store';
import { useCircadianStore } from '@/store/use-circadian-store';

export default function PaywallModal() {
  const router = useRouter();
  const { themeMode, isProUser, setIsProUser } = useAppPreferencesStore();
  const { currentElevationDeg } = useCircadianStore();

  const isNight = themeMode === 'dark' || (themeMode === 'auto_circadian' && currentElevationDeg < 0);

  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'lifetime'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);
    // Simulação ou chamada nativa RevenueCat
    setTimeout(() => {
      setIsProUser(true);
      setIsProcessing(false);
      Alert.alert('Bem-vindo ao KYNIO Somnus Pro', 'Todas as funcionalidades avançadas foram desbloqueadas com sucesso.', [
        { text: 'Continuar', onPress: () => router.back() },
      ]);
    }, 1000);
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert('Restauro de Compras', 'Nenhuma subscrição prévia foi encontrada para este ID.', [
        { text: 'OK' },
      ]);
    }, 800);
  };

  const PRO_FEATURES = [
    { title: 'Histórico Ilimitado', desc: 'Aceda a tendências circadianas completas a 30, 90 e 365 dias.' },
    { title: 'Análise Profunda de Social Jetlag', desc: 'Mapeamento detalhado da discrepância entre dias úteis e fins de semana.' },
    { title: 'Sons Locais de Crepúsculo', desc: 'Ruído castanho, rosa e sons binaurais gerados 100% offline para adormecer.' },
    { title: 'Relatório Médico Circadiano (PDF)', desc: 'Exportação clínica estruturada para partilhar com terapeutas e médicos do sono.' },
  ];

  return (
    <SafeAreaView className={`flex-1 ${isNight ? 'bg-[#161412]' : 'bg-[#EDE6D3]'}`}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        {/* Botão de Fechar */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="rounded border border-[#D9922E]/40 bg-[#D9922E]/10 px-3 py-1">
            <Text className="font-label text-xs uppercase tracking-widest text-[#D9922E] font-bold">
              Subscrição de Prestígio
            </Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            className={`w-9 h-9 rounded-full items-center justify-center border ${
              isNight ? 'border-[#332D26] bg-[#221E1A]' : 'border-[#DDD6C1] bg-[#F4EFE2]'
            }`}
          >
            <Text className={`font-headline text-sm font-bold ${isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'}`}>✕</Text>
          </Pressable>
        </View>

        {/* Título */}
        <Text
          className={`font-headline text-3xl font-black ${
            isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
          }`}
        >
          KYNIO SOMNUS PRO
        </Text>
        <Text
          className={`font-body text-sm mt-1 mb-6 ${
            isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
          }`}
        >
          Potencie a precisão do seu ritmo circadiano com análise biométrica aprofundada e ferramentas clínicas.
        </Text>

        {/* Lista de Vantagens Pro */}
        <View
          className={`rounded-2xl border p-5 mb-6 ${
            isNight ? 'border-[#332D26] bg-[#221E1A]' : 'border-[#DDD6C1] bg-[#F4EFE2]'
          }`}
        >
          {PRO_FEATURES.map((feat, idx) => (
            <View key={idx} className="mb-4 last:mb-0">
              <View className="flex-row items-center gap-2">
                <Text className="text-[#D9922E] font-bold text-sm">✦</Text>
                <Text
                  className={`font-headline text-sm font-bold ${
                    isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
                  }`}
                >
                  {feat.title}
                </Text>
              </View>
              <Text
                className={`font-body text-xs mt-1 ml-5 ${
                  isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
                }`}
              >
                {feat.desc}
              </Text>
            </View>
          ))}
        </View>

        {/* Seleção de Pacote */}
        <View className="gap-3 mb-6">
          {/* Pacote Anual */}
          <Pressable
            onPress={() => setSelectedPlan('annual')}
            className={`rounded-2xl border p-4 transition-all ${
              selectedPlan === 'annual'
                ? isNight
                  ? 'border-[#E8A83E] bg-[#E8A83E]/15'
                  : 'border-[#D9922E] bg-[#D9922E]/15'
                : isNight
                ? 'border-[#332D26] bg-[#221E1A]'
                : 'border-[#DDD6C1] bg-[#F4EFE2]'
            }`}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <View className="flex-row items-center gap-2">
                  <Text
                    className={`font-headline text-base font-bold ${
                      isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
                    }`}
                  >
                    Plano Anual
                  </Text>
                  <View className="rounded bg-[#3A6B4C] px-2 py-0.5">
                    <Text className="font-label text-[9px] text-white uppercase font-bold tracking-wider">
                      7 Dias Grátis
                    </Text>
                  </View>
                </View>
                <Text
                  className={`font-label text-xs mt-1 ${
                    isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
                  }`}
                >
                  29,99€ / ano (apenas 2,49€ / mês)
                </Text>
              </View>

              <View
                className={`w-5 h-5 rounded-full border items-center justify-center ${
                  selectedPlan === 'annual'
                    ? isNight
                      ? 'border-[#E8A83E] bg-[#E8A83E]'
                      : 'border-[#D9922E] bg-[#D9922E]'
                    : isNight
                    ? 'border-[#9E9789]'
                    : 'border-[#7A7875]'
                }`}
              >
                {selectedPlan === 'annual' && <View className="w-2 h-2 rounded-full bg-white" />}
              </View>
            </View>
          </Pressable>

          {/* Pacote Vitalício */}
          <Pressable
            onPress={() => setSelectedPlan('lifetime')}
            className={`rounded-2xl border p-4 transition-all ${
              selectedPlan === 'lifetime'
                ? isNight
                  ? 'border-[#E8A83E] bg-[#E8A83E]/15'
                  : 'border-[#D9922E] bg-[#D9922E]/15'
                : isNight
                ? 'border-[#332D26] bg-[#221E1A]'
                : 'border-[#DDD6C1] bg-[#F4EFE2]'
            }`}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text
                  className={`font-headline text-base font-bold ${
                    isNight ? 'text-[#EDE6D3]' : 'text-[#3A3A38]'
                  }`}
                >
                  Acesso Vitalício
                </Text>
                <Text
                  className={`font-label text-xs mt-1 ${
                    isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
                  }`}
                >
                  59,99€ pagamento único (sem renovações)
                </Text>
              </View>

              <View
                className={`w-5 h-5 rounded-full border items-center justify-center ${
                  selectedPlan === 'lifetime'
                    ? isNight
                      ? 'border-[#E8A83E] bg-[#E8A83E]'
                      : 'border-[#D9922E] bg-[#D9922E]'
                    : isNight
                    ? 'border-[#9E9789]'
                    : 'border-[#7A7875]'
                }`}
              >
                {selectedPlan === 'lifetime' && <View className="w-2 h-2 rounded-full bg-white" />}
              </View>
            </View>
          </Pressable>
        </View>

        {/* Botão de Compra */}
        <Pressable
          onPress={handlePurchase}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl items-center shadow-md active:opacity-90 ${
            isNight ? 'bg-[#E8A83E]' : 'bg-[#3A3A38]'
          }`}
        >
          <Text
            className={`font-headline text-sm font-bold uppercase tracking-wider ${
              isNight ? 'text-[#161412]' : 'text-[#EDE6D3]'
            }`}
          >
            {isProcessing
              ? 'A processar...'
              : selectedPlan === 'annual'
              ? 'Iniciar Período de Teste Grátis'
              : 'Desbloquear Acesso Vitalício'}
          </Text>
        </Pressable>

        {/* Botão de Restauro */}
        <Pressable onPress={handleRestore} className="py-3 items-center mt-2">
          <Text
            className={`font-label text-xs uppercase tracking-wider ${
              isNight ? 'text-[#9E9789]' : 'text-[#7A7875]'
            }`}
          >
            Restaurar Subscrição Existente
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
