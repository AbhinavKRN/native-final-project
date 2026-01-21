import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const MatchCard = ({ user, onRequest }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.meta}>Overlap score · {user.overlap}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Best match</Text>
      </View>
    </View>
    <Text style={styles.copy} numberOfLines={2}>
      Teaches <Text style={styles.highlight}>{user.skills_teach?.join(', ') || '—'}</Text>
    </Text>
    <Text style={styles.copy} numberOfLines={2}>
      Wants <Text style={styles.highlight}>{user.skills_learn?.join(', ') || '—'}</Text>
    </Text>
    <Pressable style={styles.primaryBtn} onPress={() => onRequest(user)}>
      <Text style={styles.primaryText}>Request swap</Text>
    </Pressable>
  </View>
);

const MatchesScreen = () => {
  const { user: me } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = async ({ showSpinner } = { showSpinner: true }) => {
    try {
      if (showSpinner) setLoading(true);
      const { data } = await api.get('/users/matches');
      setMatches(data.users || []);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message);
    } finally {
      if (showSpinner) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches({ showSpinner: true });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setRefreshing(true);
      loadMatches({ showSpinner: false });
      return () => {};
    }, []),
  );

  const sendRequest = async (target) => {
    const offered = me?.skills_teach?.[0];
    const overlapSkill =
      target.skills_teach?.find((s) => me?.skills_learn?.includes(s)) ||
      target.skills_teach?.[0] ||
      target.skills_learn?.[0];

    if (!offered || !overlapSkill) {
      Alert.alert('Missing skills', 'Please add skills to your profile first.');
      return;
    }

    try {
      await api.post('/swaps/request', {
        receiverId: target.id,
        skillOffered: offered,
        skillRequested: overlapSkill,
      });
      Alert.alert('Request sent', `Swap requested with ${target.name}`);
    } catch (err) {
      Alert.alert('Could not send request', err.response?.data?.error || err.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches({ showSpinner: false });
  };

  if (loading) return <ActivityIndicator style={{ flex: 1, backgroundColor: '#020617' }} />;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.heading}>Your perfect swaps</Text>
        <Text style={styles.subheading}>These people match directly with your learn list.</Text>
      </View>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => <MatchCard user={item} onRequest={sendRequest} />}
        ListEmptyComponent={<Text style={styles.empty}>No matches yet.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020617' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 8,
  },
  heading: { fontSize: 22, fontWeight: '700', color: '#F9FAFB' },
  subheading: { marginTop: 4, color: '#9CA3AF', fontSize: 13 },
  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16, gap: 10 },
  card: {
    borderWidth: 1,
    borderColor: '#111827',
    borderRadius: 18,
    padding: 14,
    gap: 6,
    backgroundColor: '#020617',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#F9FAFB' },
  meta: { color: '#9CA3AF', fontSize: 12 },
  copy: { color: '#E5E7EB', fontSize: 13 },
  highlight: { color: '#22C55E', fontWeight: '600' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#22C55E1A',
  },
  badgeText: { color: '#22C55E', fontSize: 11, fontWeight: '600' },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#22C55E',
    paddingVertical: 9,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryText: { color: '#F9FAFB', fontWeight: '600', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 40, color: '#9CA3AF' },
});

export default MatchesScreen;
