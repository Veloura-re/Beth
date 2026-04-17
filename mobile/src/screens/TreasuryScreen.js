import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, StatusBar, Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Theme } from '../theme/theme';
import { Menu, Wallet, LineChart, BadgeCheck, Clock, ArrowRight, ArrowLeft } from 'lucide-react-native';
import Sidebar from '../components/Sidebar';
import { apiFetch, logout } from '../utils/api';

export default function TreasuryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [financials, setFinancials] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);

  const loadData = async () => {
    try {
      const me = await apiFetch('/users/me');
      if (me.role !== 'ADMIN' && me.role !== 'SUPERADMIN') {
        Alert.alert("Access Denied", "Authorized fiscal clearance required.");
        navigation.replace('Dashboard');
        return;
      }

      const [stats, list] = await Promise.all([
        apiFetch('/financial/summary'),
        apiFetch('/financial/requests')
      ]);
      setFinancials(stats || {});
      setPayouts(Array.isArray(list) ? list : []);
      setProfile(me);
    } catch (error) {
      console.error('Failed to load treasury data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setLoading(true);
      await apiFetch(`/financial/requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (error) {
      console.error('Clearance failure', error);
      Alert.alert("System Error", "Failed to update protocol status.");
    } finally {
      setLoading(false);
    }
  };

  const renderPayoutItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(100 * index).duration(400).springify()} style={styles.payoutCard}>
       <View style={styles.payoutIcon}>
          <Clock color={Theme.muted} size={16} />
       </View>
       <View style={styles.payoutInfo}>
          <Text style={styles.payoutTarget}>{item.agent?.name?.toUpperCase() || 'SYSTEM'}</Text>
          <Text style={styles.payoutMeta}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'} // ID: {item.id?.substring(0,8).toUpperCase() || 'REF-LOG'}</Text>
          {item.status === 'PENDING' && (
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.smallActionBtn, styles.bgSuccess]} 
                onPress={() => handleUpdateStatus(item.id, 'APPROVED')}
              >
                <Text style={styles.smallActionText}>APPROVE</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.smallActionBtn, styles.bgDanger]} 
                onPress={() => handleUpdateStatus(item.id, 'REJECTED')}
              >
                <Text style={styles.smallActionText}>REJECT</Text>
              </TouchableOpacity>
            </View>
          )}
          {item.status === 'APPROVED' && (
            <TouchableOpacity 
              style={[styles.smallActionBtn, styles.bgSuccess, { marginTop: 8 }]} 
              onPress={() => handleUpdateStatus(item.id, 'PAID')}
            >
              <Text style={styles.smallActionText}>MARK AS PAID</Text>
            </TouchableOpacity>
          )}
       </View>
       <View style={styles.payoutValue}>
          <Text style={styles.payoutAmount}>${item.amount}</Text>
          <View style={[styles.statusBadge, item.status === 'PAID' ? styles.bgSuccess : styles.bgPending]}>
             <Text style={[styles.statusText, item.status === 'PAID' && { color: 'white' }]}>{item.status}</Text>
          </View>
       </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.menuBtn}>
          <ArrowLeft color="black" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSub}>Fiscal Oversight</Text>
          <Text style={styles.headerTitle}>TREASURY</Text>
        </View>
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Animated.View entering={FadeInUp.delay(200).duration(500).springify()} style={styles.statsCard}>
           <View style={styles.statLine}>
              <Text style={styles.statLabel}>Total Platform Volume</Text>
              <Text style={styles.statValue}>{financials?.totalVolume || 0}</Text>
           </View>
           <View style={styles.divider} />
           <View style={styles.statLine}>
              <Text style={styles.statLabel}>Total Payouts Issued</Text>
              <Text style={styles.statValue}>${financials?.totalPayouts || 0}</Text>
           </View>
        </Animated.View>

        <View style={styles.sectionHeader}>
           <Text style={styles.sectionLabel}>Pending Clearances</Text>
           <View style={styles.hLine} />
        </View>

        {loading ? (
          <ActivityIndicator color="black" />
        ) : (
          (payouts || []).map((item, i) => (
            <View key={i}>
              {renderPayoutItem({ item, index: i })}
            </View>
          ))
        )}

        {payouts.length === 0 && !loading && (
          <View style={styles.empty}>
             <Text style={styles.emptyText}>NO PENDING PAYOUT CLEARANCES AT THIS TIME.</Text>
          </View>
        )}
      </ScrollView>

      <Sidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
        currentRole={profile?.role}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  menuBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
    marginRight: 20,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerSub: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '200',
    color: '#000000',
  },
  content: {
    padding: 32,
    paddingBottom: 120,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Theme.border,
    padding: 24,
    marginBottom: 48,
  },
  statLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: Theme.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: Theme.border,
    marginVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
    textTransform: 'uppercase',
  },
  hLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.border,
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 12,
  },
  payoutIcon: {
    width: 40,
    height: 40,
    backgroundColor: Theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  payoutInfo: {
    flex: 1,
  },
  payoutTarget: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 2,
  },
  payoutMeta: {
    fontSize: 8,
    color: Theme.muted,
    fontWeight: '600',
    letterSpacing: 1,
  },
  payoutValue: {
    alignItems: 'flex-end',
  },
  payoutAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
  },
  bgPending: {
    borderColor: Theme.muted,
    backgroundColor: Theme.background,
  },
  bgSuccess: {
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  bgDanger: {
    borderColor: '#FF3B30',
    backgroundColor: '#FF3B30',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  smallActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  smallActionText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  statusText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
    color: Theme.muted,
  },
  empty: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 9,
    fontWeight: '900',
    color: Theme.muted,
    textAlign: 'center',
    lineHeight: 16,
  }
});
