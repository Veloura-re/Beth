import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Theme } from '../theme/theme';
import { 
  Menu, 
  LayoutDashboard, 
  Users, 
  QrCode, 
  Wallet, 
  ShieldAlert, 
  Shapes, 
  LogOut,
  UserPlus,
  Target,
  ArrowUpRight,
  Shield
} from 'lucide-react-native';
import { apiFetch, logout } from '../utils/api';
import Sidebar from '../components/Sidebar';

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const loadData = async () => {
    try {
      const data = await apiFetch('/users/me');
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile', error);
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

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={Theme.primary} />
      </View>
    );
  }

  const role = profile?.role;
  const isAgent = role === 'AGENT';
  const isAdmin = role === 'ADMIN' || role === 'SUPERADMIN';

  const AdminActionCard = ({ title, subtitle, icon: Icon, onPress }) => (
    <TouchableOpacity 
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.actionIconWrapper, { backgroundColor: Theme.border }]}>
        <Icon color="black" size={24} />
      </View>
      <View style={styles.actionInfo}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{subtitle}</Text>
      </View>
      <View style={styles.actionBtn}>
         <ArrowUpRight color="black" size={16} />
      </View>
    </TouchableOpacity>
  );

  const stats = [
    { label: isAdmin ? 'Platform Volume' : 'Volume', value: profile?.performance?.totalScans || 0, id: '01' },
    { label: isAdmin ? 'Total Units' : 'Units', value: profile?.performance?.availableBalance || 0, id: '02' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.exitBtn}>
          <Menu color="black" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{profile?.name?.toUpperCase()}</Text>
          <View style={[styles.roleBadge, { backgroundColor: isAdmin ? '#000000' : Theme.border }]}>
            <Text style={[styles.roleBadgeText, { color: isAdmin ? '#FFFFFF' : '#000000' }]}>
              {profile?.role || 'FETCHING'}
            </Text>
          </View>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionLabel}>System Status</Text>
           <View style={styles.hLine} />
        </View>

        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={[styles.statCard, i % 2 === 0 && styles.borderRight]}>
              <Text style={styles.statId}>{s.id}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value.toLocaleString()}</Text>
              <View style={styles.statFooter}>
                 <ArrowUpRight size={12} color={Theme.muted} />
                 <Text style={styles.statTrend}>STABLE</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
           <Text style={styles.sectionLabel}>Structural Directives</Text>
           <View style={styles.hLine} />
        </View>

        {(role === 'SUPERADMIN' || role === 'ADMIN') && (
           <View>
              {role === 'SUPERADMIN' && (
                <AdminActionCard 
                  title="ADMIN REGISTRY" 
                  subtitle="Manage high-level organizational nodes." 
                  icon={Shield} 
                  onPress={() => navigation.navigate('Personnel', { roleType: 'ADMIN' })}
                />
              )}
              <AdminActionCard 
                title="PERSONNEL REGISTRY" 
                subtitle="Manage and monitor field agent rosters." 
                icon={UserPlus} 
                onPress={() => navigation.navigate('Personnel', { roleType: 'AGENT' })}
              />
              <AdminActionCard 
                title="SYSTEM DIRECTIVES" 
                subtitle="Initialize and oversee active reward protocols." 
                icon={Target} 
                onPress={() => navigation.navigate('Campaigns')}
              />
              <AdminActionCard 
                title="PROTOCOL REGISTRY" 
                subtitle="Technical identifier and QR deployment registry." 
                icon={QrCode} 
                onPress={() => navigation.navigate('Protocols')}
              />
              <AdminActionCard 
                title="TREASURY LEDGER" 
                subtitle="Fiscal oversight and disbursement records." 
                icon={Wallet} 
                onPress={() => navigation.navigate('Treasury')}
              />
           </View>
        )}

        {role === 'AGENT' && (
          <View>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Scanner')}
              activeOpacity={0.9}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: Theme.border }]}>
                <ShieldAlert color="black" size={24} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>INITIALIZE SCAN</Text>
                <Text style={styles.actionDesc}>Technical ID verification and Capture</Text>
              </View>
              <View style={styles.actionBtn}>
                 <ArrowUpRight color="black" size={16} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Rewards')}
              activeOpacity={0.9}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: Theme.border }]}>
                <Shapes color="black" size={24} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>VALUE REGISTRY</Text>
                <Text style={styles.actionDesc}>Live Reward and Performance Pulse</Text>
              </View>
              <View style={styles.actionBtn}>
                 <ArrowUpRight color="black" size={16} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footerNote}>
           <Text style={styles.footerNoteText}>
             ALL OPERATIONS LOGGED PURSUANT TO MERSI ARCHITECTURE STANDARDS V 16.2.0
           </Text>
        </View>
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    backgroundColor: '#FFFFFF',
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#000000',
  },
  roleBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
  },
  placeholder: {
    width: 48,
  },
  headerSub: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
    color: Theme.muted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '200',
    color: '#000000',
    letterSpacing: -0.5,
  },
  exitBtn: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 32,
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
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 48,
  },
  statCard: {
    flex: 1,
    padding: 24,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: Theme.border,
  },
  statId: {
    fontSize: 24,
    fontWeight: '200',
    color: '#000000',
    opacity: 0.1,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 12,
  },
  statFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statTrend: {
    fontSize: 8,
    fontWeight: '900',
    color: Theme.muted,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 12,
  },
  actionIconWrapper: {
    width: 56,
    height: 56,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#000000',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 10,
    color: Theme.muted,
    fontWeight: '600',
  },
  actionBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerNote: {
    marginTop: 48,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    paddingTop: 24,
  },
  footerNoteText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: Theme.muted,
    opacity: 0.4,
    textAlign: 'center',
    lineHeight: 14,
  }
});
