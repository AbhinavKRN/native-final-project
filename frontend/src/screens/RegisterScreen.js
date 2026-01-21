import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

const RegisterScreen = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    skillsTeach: '',
    skillsLearn: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async () => {
    const payload = {
      name: form.name,
      email: form.email.trim().toLowerCase(),
      password: form.password,
      bio: form.bio,
      skillsTeach: form.skillsTeach.split(',').map((s) => s.trim()).filter(Boolean),
      skillsLearn: form.skillsLearn.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      setLoading(true);
      await register(payload);
    } catch (err) {
      Alert.alert('Signup failed', err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.gradient} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.badge}>New to SkillSwap?</Text>
        <Text style={styles.title}>Create your vibe</Text>
        <Text style={styles.subtitle}>Show what you teach, what you crave to learn.</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Display name"
            placeholderTextColor="#9CA3AF"
            value={form.name}
            onChangeText={(v) => update('name', v)}
          />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(v) => update('email', v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={form.password}
          onChangeText={(v) => update('password', v)}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Short bio"
          placeholderTextColor="#9CA3AF"
          multiline
          value={form.bio}
          onChangeText={(v) => update('bio', v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Skills you can teach (comma separated)"
          placeholderTextColor="#9CA3AF"
          value={form.skillsTeach}
          onChangeText={(v) => update('skillsTeach', v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Skills you want to learn (comma separated)"
          placeholderTextColor="#9CA3AF"
          value={form.skillsLearn}
          onChangeText={(v) => update('skillsLearn', v)}
        />
        <Pressable style={styles.primaryBtn} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#F9FAFB" /> : <Text style={styles.primaryText}>Sign up</Text>}
        </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  gradient: {
    position: 'absolute',
    top: -140,
    left: -80,
    right: -80,
    height: 260,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    backgroundColor: '#0F172A',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    gap: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    color: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F9FAFB',
    marginTop: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    marginBottom: 4,
  },
  card: {
    marginTop: 8,
    backgroundColor: '#020617',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#111827',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
    gap: 10,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#111827',
    color: '#E5E7EB',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    marginTop: 6,
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryText: {
    color: '#F9FAFB',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default RegisterScreen;

