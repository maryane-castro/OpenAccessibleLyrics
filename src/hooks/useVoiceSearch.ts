import { useEffect, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { Alert } from 'react-native';

export function useVoiceSearch() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useSpeechRecognitionEvent('start', () => setIsListening(true));
  useSpeechRecognitionEvent('end', () => setIsListening(false));

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    setTranscript(text);
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    if (event.error !== 'aborted') {
      Alert.alert('Erro no reconhecimento de voz', 'Tente novamente.');
    }
  });

  async function start() {
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      Alert.alert(
        'Permissão necessária',
        'Para buscar por voz, permita o uso do microfone nas configurações do celular.',
      );
      return;
    }
    setTranscript('');
    ExpoSpeechRecognitionModule.start({ lang: 'pt-BR', interimResults: false });
  }

  function stop() {
    ExpoSpeechRecognitionModule.stop();
  }

  return { isListening, transcript, start, stop };
}
