import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const UserCard = ({ user, onRequest }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.meta}>Rating {user.rating ?? 0} ⭐ · {user.swaps_done ?? 0} swaps</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>+{user.overlap} match</Text>
      </View>
    </View>
    <Text style={styles.label} numberOfLines={2}>
      Teaches: <Text style={styles.chipText}>{user.skills_teach?.join(', ') || '—'}</Text>
    </Text>
    <Text style={styles.label} numberOfLines={2}>
      Wants: <Text style={styles.chipText}>{user.skills_learn?.join(', ') || '—'}</Text>
    </Text>
    <Pressable style={styles.primaryBtn} onPress={() => onRequest(user)}>
      <Text style={styles.primaryText}>Request swap</Text>
    </Pressable>
  </View>
);

const FeedScreen = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async ({ showSpinner } = { showSpinner: true }) => {
    if (showSpinner) setLoading(true);
    try {
      const { data } = await api.get('/users/all');
      setUsers(data.users || []);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message);
    } finally {
      if (showSpinner) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers({ showSpinner: true });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // refresh once when screen becomes active; don't flip to full-screen loader
      setRefreshing(true);
      fetchUsers({ showSpinner: false });
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
      Alert.alert('Missing skills', 'Please add skills to your profile and pick a match.');
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
    await fetchUsers({ showSpinner: false });
  };

  if (loading) return <ActivityIndicator style={{ flex: 1, backgroundColor: '#020617' }} />;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.heading}>Discover mentors</Text>
        <Text style={styles.subheading}>People who teach what you want to learn.</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => <UserCard user={item} onRequest={sendRequest} />}
        ListEmptyComponent={<Text style={styles.empty}>No users yet.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  subheading: { marginTop: 4, color: '#9CA3AF', fontSize: 13 },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: '#111827',
    padding: 14,
    borderRadius: 18,
    gap: 6,
    backgroundColor: '#020617',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  meta: { color: '#9CA3AF', fontSize: 12 },
  label: { color: '#D1D5DB', fontSize: 13 },
  chipText: { color: '#A855F7', fontWeight: '600' },
  pill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: { color: '#F9FAFB', fontSize: 11 },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#8B5CF6',
    paddingVertical: 9,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryText: { color: '#F9FAFB', fontWeight: '600', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 40, color: '#9CA3AF' },
});

export default FeedScreen;
