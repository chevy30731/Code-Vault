import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PINInputProps {
  onComplete: (pin: string) => void;
  onCancel: () => void;
  mode: 'set' | 'verify';
  title?: string;
}

export function PINInput({ onComplete, onCancel, mode, title }: PINInputProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');

  const handleNumberPress = (num: string) => {
    if (step === 'enter') {
      if (pin.length < 4) {
        const newPin = pin + num;
        setPin(newPin);
        if (newPin.length === 4) {
          if (mode === 'verify') {
            onComplete(newPin);
          } else {
            setStep('confirm');
          }
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + num;
        setConfirmPin(newConfirmPin);
        if (newConfirmPin.length === 4) {
          if (newConfirmPin === pin) {
            onComplete(pin);
          } else {
            alert('PINs do not match. Please try again.');
            setPin('');
            setConfirmPin('');
            setStep('enter');
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 'enter') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const currentPin = step === 'enter' ? pin : confirmPin;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {title || (mode === 'verify' ? 'Enter PIN' : step === 'enter' ? 'Set PIN' : 'Confirm PIN')}
        </Text>
        <TouchableOpacity onPress={onCancel}>
          <MaterialIcons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.pinDisplay}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.pinDot, currentPin.length > i && styles.pinDotFilled]}
          />
        ))}
      </View>

      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.keypadButton}
            onPress={() => handleNumberPress(num.toString())}
          >
            <Text style={styles.keypadText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.keypadButton} />
        <TouchableOpacity
          style={styles.keypadButton}
          onPress={() => handleNumberPress('0')}
        >
          <Text style={styles.keypadText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.keypadButton} onPress={handleDelete}>
          <MaterialIcons name="backspace" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 60,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00D9FF',
    marginHorizontal: 12,
  },
  pinDotFilled: {
    backgroundColor: '#00D9FF',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  keypadButton: {
    width: 80,
    height: 80,
    margin: 8,
    backgroundColor: '#1A1A2E',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  keypadText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});