import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const { login } = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Login failed', err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.gradient} />
      <View style={styles.container}>
        <Text style={styles.badge}>Gen-Z Skill Swap</Text>
        <Text style={styles.title}>SkillSwap</Text>
        <Text style={styles.subtitle}>Trade what you know for what you want to learn.</Text>
        <View style={styles.card}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
            style={styles.input}
          />
          <Pressable style={styles.primaryBtn} onPress={onSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#F9FAFB" /> : <Text style={styles.primaryText}>Log in</Text>}
          </Pressable>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>New here?</Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Create account</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
  },
  gradient: {
    position: 'absolute',
    top: -120,
    left: -60,
    right: -60,
    height: 260,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F2937',
    color: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F9FAFB',
    textAlign: 'left',
  },
  subtitle: {
    color: '#9CA3AF',
    marginTop: 6,
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#020617',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#111827',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
    gap: 12,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#111827',
    color: '#E5E7EB',
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryText: {
    color: '#F9FAFB',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  footerText: { color: '#9CA3AF' },
  footerLink: { color: '#A855F7', fontWeight: '600' },
});

export default LoginScreen;

