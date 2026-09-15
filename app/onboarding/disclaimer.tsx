import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLegalConsentStore } from '@/store/legal-consent-store';
import { router } from 'expo-router';

export default function DisclaimerScreen() {
  const { acceptDisclaimer } = useLegalConsentStore();
  const [showFullDetails, setShowFullDetails] = useState(false);

  const handleAccept = async () => {
    await acceptDisclaimer();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#EDE6D3]">
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'space-between' }}>
        <View>
          {/* Tag de Conformidade */}
          <View className="self-start rounded border border-[#DDD6C1] bg-[#F4EFE2] px-3 py-1 mb-4">
            <Text className="font-label text-xs uppercase tracking-widest text-[#7A7875]">
              RGPD & EU MDR / FDA Wellness
            </Text>
          </View>

          {/* Título Principal */}
          <Text className="font-headline text-3xl font-extrabold text-[#3A3A38] leading-tight">
            KYNIO SOMNUS
          </Text>
          <Text className="font-headline text-lg font-medium text-[#D9922E] mt-1 mb-6">
            Sincronização Circadiana & Higiene do Sono
          </Text>

          {/* Cartão de Enquadramento Legal */}
          <View className="rounded-xl border border-[#DDD6C1] bg-[#F4EFE2] p-5 mb-4 shadow-sm">
            <Text className="font-label text-xs uppercase tracking-wider text-[#D9922E] mb-2 font-bold">
              Aviso Informativo de Saúde
            </Text>
            <Text className="font-body text-base text-[#3A3A38] leading-relaxed">
              O KYNIO Somnus é uma ferramenta desenhada exclusivamente para apoio a hábitos de estilo de vida, ritmos solares e cálculo de ciclos de sono.
            </Text>
            <Text className="font-body text-base text-[#3A3A38] mt-3 leading-relaxed font-semibold">
              Não constitui dispositivo médico, diagnóstico clínico, prevenção nem tratamento de patologias do sono (como insónia crónica, apneia do sono ou narcolepsia).
            </Text>
          </View>

          {/* Cartão Local-First & Privacidade */}
          <View className="rounded-xl border border-[#DDD6C1] bg-[#F4EFE2] p-5 mb-4 shadow-sm">
            <Text className="font-label text-xs uppercase tracking-wider text-[#3A6B4C] mb-2 font-bold">
              Privacidade Absoluta (Local-First)
            </Text>
            <Text className="font-body text-sm text-[#3A3A38] leading-relaxed">
              • <Text className="font-bold">Zero Servidores de Dados:</Text> 100% dos seus registos de sono e cafeína são armazenados na base de dados SQLite do seu telemóvel.
            </Text>
            <Text className="font-body text-sm text-[#3A3A38] mt-2 leading-relaxed">
              • <Text className="font-bold">Cálculo Solar Offline:</Text> As equações solares da NOAA correm diretamente no processador do dispositivo sem enviar coordenadas GPS para a Internet.
            </Text>
          </View>

          {/* Botão de Detalhes Regulamentares */}
          <Pressable
            onPress={() => setShowFullDetails(!showFullDetails)}
            className="py-2"
          >
            <Text className="font-label text-xs uppercase tracking-widest text-[#7A7875] underline">
              {showFullDetails ? 'Ocultar Enquadramento Regulamentar' : 'Ver Enquadramento Regulamentar Completo'}
            </Text>
          </Pressable>

          {showFullDetails && (
            <View className="mt-3 rounded border border-[#DDD6C1] bg-[#F4EFE2]/60 p-4">
              <Text className="font-body text-xs text-[#7A7875] leading-relaxed">
                Este software cumpre as orientações da Comissão Europeia (MDCG 2019-11) e as diretrizes da FDA para "General Wellness: Policy for Low Risk Devices". Se tem sintomas persistentes de fadiga extrema ou perturbações de sono, consulte um médico especialista ou centro de medicina do sono credenciado.
              </Text>
            </View>
          )}
        </View>

        {/* Botão de Aceitação Obrigatória */}
        <View className="mt-8 pt-4 border-t border-[#DDD6C1]">
          <Pressable
            onPress={handleAccept}
            className="w-full items-center justify-center rounded-xl bg-[#3A3A38] py-4 shadow-md active:bg-[#161412]"
          >
            <Text className="font-headline text-base font-bold text-[#EDE6D3] uppercase tracking-wider">
              Compreendo e Aceito
            </Text>
          </Pressable>
          <Text className="font-label text-[10px] text-center uppercase tracking-widest text-[#7A7875] mt-3">
            O consentimento pode ser revisto a qualquer momento nas definições
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
