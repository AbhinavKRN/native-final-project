import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const StatusActions = ({ swap, meId, onAccept, onReject, onComplete, onRate }) => {
  if (swap.status === 'pending' && swap.receiver_id === meId) {
    return (
      <View style={styles.actions}>
        <Pressable style={[styles.chipBtn, styles.accept]} onPress={onAccept}>
          <Text style={styles.chipText}>Accept</Text>
        </Pressable>
        <Pressable style={[styles.chipBtn, styles.reject]} onPress={onReject}>
          <Text style={styles.chipText}>Reject</Text>
        </Pressable>
      </View>
    );
  }
  if (swap.status === 'active' && [swap.receiver_id, swap.sender_id].includes(meId)) {
    return (
      <Pressable style={[styles.chipBtn, styles.complete]} onPress={onComplete}>
        <Text style={styles.chipText}>Mark complete</Text>
      </Pressable>
    );
  }
  if (swap.status === 'completed' && [swap.receiver_id, swap.sender_id].includes(meId)) {
    return (
      <Pressable style={[styles.chipBtn, styles.rate]} onPress={onRate}>
        <Text style={styles.chipText}>Rate partner</Text>
      </Pressable>
    );
  }
  return null;
};

const SwapItem = ({ swap, meId, onAccept, onReject, onComplete, onRate }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <Text style={styles.title}>{swap.skill_offered} ↔ {swap.skill_requested}</Text>
      <View style={[styles.statusPill, styles[`status_${swap.status}`]]}>
        <Text style={styles.statusText}>{swap.status}</Text>
      </View>
    </View>
    <Text style={styles.meta}>From: {swap.sender_id === meId ? 'You' : swap.sender_id}</Text>
    <Text style={styles.meta}>To: {swap.receiver_id === meId ? 'You' : swap.receiver_id}</Text>
    <StatusActions
      swap={swap}
      meId={meId}
      onAccept={onAccept}
      onReject={onReject}
      onComplete={onComplete}
      onRate={onRate}
    />
  </View>
);

const SwapsScreen = () => {
  const { user, refreshUser } = useAuth();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSwaps = async () => {
    try {
      const { data } = await api.get('/swaps/mine');
      setSwaps(data.swaps || []);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSwaps();
  }, []);

  const respond = async (swapId, action) => {
    try {
      await api.patch('/swaps/respond', { swapId, action });
      await loadSwaps();
    } catch (err) {
      Alert.alert('Action failed', err.response?.data?.error || err.message);
    }
  };

  const complete = async (swapId) => {
    try {
      await api.patch('/swaps/complete', { swapId });
      await loadSwaps();
      await refreshUser();
    } catch (err) {
      Alert.alert('Action failed', err.response?.data?.error || err.message);
    }
  };

  const ratePartner = async (swap) => {
    const meId = user?.id;
    if (!meId) return;

    const targetUserId = swap.sender_id === meId ? swap.receiver_id : swap.sender_id;

    Alert.alert(
      'Rate your swap',
      'How was this session?',
      [
        { text: '1★', onPress: () => submitRating(targetUserId, 1) },
        { text: '2★', onPress: () => submitRating(targetUserId, 2) },
        { text: '3★', onPress: () => submitRating(targetUserId, 3) },
        { text: '4★', onPress: () => submitRating(targetUserId, 4) },
        { text: '5★', onPress: () => submitRating(targetUserId, 5) },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  const submitRating = async (targetUserId, rating) => {
    try {
      await api.post('/ratings/user', { targetUserId, rating });
      await refreshUser();
      await loadSwaps();
      Alert.alert('Thanks!', 'Your rating was submitted. Ratings will update when you refresh Feed/Matches.');
    } catch (err) {
      Alert.alert('Rating failed', err.response?.data?.error || err.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSwaps();
    await refreshUser();
    setRefreshing(false);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1, backgroundColor: '#020617' }} />;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.heading}>Your swaps</Text>
        <Text style={styles.subheading}>Track everything you've requested, accepted, and completed.</Text>
      </View>
      <FlatList
        data={swaps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <SwapItem
            swap={item}
            meId={user?.id}
            onAccept={() => respond(item.id, 'accept')}
            onReject={() => respond(item.id, 'reject')}
            onComplete={() => complete(item.id)}
            onRate={() => ratePartner(item)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No swaps yet.</Text>}
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
  title: { fontWeight: '700', color: '#F9FAFB', fontSize: 15 },
  meta: { color: '#9CA3AF', fontSize: 12 },
  empty: { textAlign: 'center', marginTop: 40, color: '#9CA3AF' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { color: '#F9FAFB', fontSize: 12, fontWeight: '600' },
  accept: { backgroundColor: '#22C55E' },
  reject: { backgroundColor: '#EF4444' },
  complete: { backgroundColor: '#3B82F6', marginTop: 6 },
  rate: { backgroundColor: '#A855F7', marginTop: 6 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  status_pending: { backgroundColor: '#F973161A' },
  status_active: { backgroundColor: '#3B82F61A' },
  status_completed: { backgroundColor: '#22C55E1A' },
  status_rejected: { backgroundColor: '#EF44441A' },
  statusText: { color: '#E5E7EB', fontSize: 11, textTransform: 'capitalize' },
});

export default SwapsScreen;
