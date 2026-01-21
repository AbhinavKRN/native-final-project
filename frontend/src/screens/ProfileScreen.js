import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user, setUser, logout, refreshUser } = useAuth();
  const [skillsTeach, setSkillsTeach] = useState('');
  const [skillsLearn, setSkillsLearn] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSkillsTeach(user?.skills_teach?.join(', ') || '');
    setSkillsLearn(user?.skills_learn?.join(', ') || '');
    setBio(user?.bio || '');
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      refreshUser();
      return () => {};
    }, []),
  );

  const saveProfile = async () => {
    try {
      setSaving(true);
      const payload = {
        bio,
        skillsTeach: skillsTeach.split(',').map((s) => s.trim()).filter(Boolean),
        skillsLearn: skillsLearn.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const { data } = await api.patch('/users/profile', payload);
      setUser(data.user);
      Alert.alert('Updated', 'Profile saved');
    } catch (err) {
      Alert.alert('Update failed', err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.row}>
              <Text style={styles.stat}>
                ⭐ {user.rating ?? 0}
                <Text style={styles.statLabel}> rating</Text>
              </Text>
              <Text style={styles.stat}>
                🔁 {user.swaps_done ?? 0}
                <Text style={styles.statLabel}> swaps</Text>
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bio</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={bio}
            onChangeText={setBio}
            multiline
            placeholder="Tell people how you teach and learn..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Skills</Text>
          <Text style={styles.fieldLabel}>You teach</Text>
          <TextInput
            style={styles.input}
            value={skillsTeach}
            placeholder="e.g. react, ui design, video editing"
            placeholderTextColor="#9CA3AF"
            onChangeText={setSkillsTeach}
          />
          <Text style={styles.fieldLabel}>You want to learn</Text>
          <TextInput
            style={styles.input}
            value={skillsLearn}
            placeholder="e.g. yoga, guitar, public speaking"
            placeholderTextColor="#9CA3AF"
            onChangeText={setSkillsLearn}
          />
        </View>
        {saving ? (
          <ActivityIndicator style={{ marginTop: 12 }} color="#F9FAFB" />
        ) : (
          <Pressable style={styles.primaryBtn} onPress={saveProfile}>
            <Text style={styles.primaryText}>Save profile</Text>
          </Pressable>
        )}
        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  container: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24, gap: 16 },
  headerCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#111827',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: '#1D4ED8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#F9FAFB', fontSize: 26, fontWeight: '800' },
  title: { fontSize: 20, fontWeight: '700', color: '#F9FAFB' },
  email: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  stat: { color: '#E5E7EB', fontWeight: '600', fontSize: 13 },
  statLabel: { color: '#9CA3AF', fontWeight: '400' },
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#111827',
    gap: 8,
  },
  cardTitle: { color: '#F9FAFB', fontWeight: '700', marginBottom: 4 },
  fieldLabel: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#E5E7EB',
    backgroundColor: '#020617',
    marginTop: 2,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryText: { color: '#F9FAFB', fontWeight: '600', fontSize: 16 },
  logoutBtn: {
    marginTop: 10,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  logoutText: { color: '#FCA5A5', fontWeight: '600' },
});

export default ProfileScreen;
