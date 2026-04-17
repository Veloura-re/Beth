import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp, FadeIn, Layout } from 'react-native-reanimated';
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
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [census, setCensus] = useState(null);

  const loadData = async (orgId = selectedOrgId) => {
    try {
      const url = orgId ? `/users/me?organizationId=${orgId}` : '/users/me';
      const data = await apiFetch(url);
      setProfile(data);

      if (data.role === 'SUPERADMIN') {
        const [orgs, censusData] = await Promise.all([
          organizations.length === 0 ? apiFetch('/organizations') : Promise.resolve(organizations),
          apiFetch('/analytics/census')
        ]);
        setOrganizations(orgs);
        setCensus(censusData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData(selectedOrgId);
  };

  const handleOrgSelect = (orgId) => {
    setSelectedOrgId(orgId);
    setLoading(true);
    loadData(orgId);
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

  const AdminActionCard = ({ title, subtitle, icon: Icon, onPress, delay = 0 }) => (
    <Animated.View entering={FadeInDown.delay(delay).duration(300).springify()}>
      <TouchableOpacity 
        style={styles.actionCard}
        onPress={onPress}
        activeOpacity={0.7}
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
    </Animated.View>
  );

  const stats = [
    { label: isAdmin ? 'Platform Volume' : 'Volume', value: profile?.performance?.totalScans || 0, id: '01' },
    { label: isAdmin ? 'Total Units' : 'Units', value: profile?.performance?.availableBalance || 0, id: '02' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
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
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {role === 'SUPERADMIN' && (
          <>
            <View style={styles.sectionHeader}>
               <Text style={styles.sectionLabel}>Network Growth</Text>
               <View style={styles.hLine} />
            </View>

            <View style={styles.statsGrid}>
              <Animated.View entering={FadeInUp.duration(400).springify()} style={[styles.statCard, styles.borderRight]}>
                <Text style={styles.statId}>01</Text>
                <Text style={styles.statLabel}>COMPANIES</Text>
                <Text style={styles.statValue}>{census?.totalOrgs || 0}</Text>
              </Animated.View>
              <Animated.View entering={FadeInUp.delay(100).duration(400).springify()} style={styles.statCard}>
                <Text style={styles.statId}>02</Text>
                <Text style={styles.statLabel}>CORE FLEET</Text>
                <Text style={styles.statValue}>{(census?.totalAdmins || 0) + (census?.totalAgents || 0)}</Text>
              </Animated.View>
            </View>
          </>
        )}

        {role !== 'SUPERADMIN' && (
          <>
            <View style={styles.sectionHeader}>
               <Text style={styles.sectionLabel}>System Status</Text>
               <View style={styles.hLine} />
            </View>

            <View style={styles.statsGrid}>
              {stats.map((s, i) => (
                <Animated.View 
                  key={i} 
                  entering={FadeInUp.delay(100 * i).duration(400).springify()}
                  style={[styles.statCard, i % 2 === 0 && styles.borderRight]}
                >
                  <Text style={styles.statId}>{s.id}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <Text style={styles.statValue}>{s.value.toLocaleString()}</Text>
                  <View style={styles.statFooter}>
                     <ArrowUpRight size={12} color={Theme.muted} />
                     <Text style={styles.statTrend}>STABLE</Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </>
        )}

        <View style={styles.sectionHeader}>
           <Text style={styles.sectionLabel}>{role === 'SUPERADMIN' ? 'CORE REGISTRY' : 'OPERATIONAL HUD'}</Text>
           <View style={styles.hLine} />
        </View>

        {(role === 'SUPERADMIN' || role === 'ADMIN') && (
           <View>
              {role === 'SUPERADMIN' && (
                <>
                  <View style={styles.filterSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                      <TouchableOpacity 
                        onPress={() => handleOrgSelect(null)}
                        style={[styles.filterTab, !selectedOrgId && styles.filterTabActive]}
                      >
                        <Text style={[styles.filterTabText, !selectedOrgId && styles.filterTabActiveText]}>GLOBAL VIEW</Text>
                      </TouchableOpacity>
                      {organizations.map(org => (
                        <TouchableOpacity 
                          key={org.id}
                          onPress={() => handleOrgSelect(org.id)}
                          style={[styles.filterTab, selectedOrgId === org.id && styles.filterTabActive]}
                        >
                          <Text style={[styles.filterTabText, selectedOrgId === org.id && styles.filterTabActiveText]}>{org.name.toUpperCase()}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <AdminActionCard 
                    title="ADMIN REGISTRY" 
                    subtitle="Manage high-level organizational nodes." 
                    icon={Shield} 
                    onPress={() => navigation.navigate('Personnel', { roleType: 'ADMIN' })}
                    delay={100}
                  />
                </>
              )}
              <AdminActionCard 
                title="PERSONNEL REGISTRY" 
                subtitle="Manage and monitor field agent rosters." 
                icon={UserPlus} 
                onPress={() => navigation.navigate('Personnel', { roleType: 'AGENT' })}
                delay={200}
              />
              {role === 'ADMIN' && (
                <>
                  <AdminActionCard 
                    title="SYSTEM DIRECTIVES" 
                    subtitle="Initialize and oversee active reward protocols." 
                    icon={Target} 
                    onPress={() => navigation.navigate('Campaigns')}
                    delay={300}
                  />
                  <AdminActionCard 
                    title="PROTOCOL REGISTRY" 
                    subtitle="Technical identifier and QR deployment registry." 
                    icon={QrCode} 
                    onPress={() => navigation.navigate('Protocols')}
                    delay={400}
                  />
                  <AdminActionCard 
                    title="TREASURY LEDGER" 
                    subtitle="Fiscal oversight and disbursement records." 
                    icon={Wallet} 
                    onPress={() => navigation.navigate('Treasury')}
                    delay={500}
                  />
                </>
              )}
           </View>
        )}

        {role === 'AGENT' && (
          <View>
            <Animated.View entering={FadeInDown.delay(100).duration(300).springify()}>
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => navigation.navigate('Scanner')}
                activeOpacity={0.7}
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
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(300).springify()}>
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => navigation.navigate('Rewards')}
                activeOpacity={0.7}
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
            </Animated.View>
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
  },
  filterSection: {
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  filterContainer: {
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  filterTabActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterTabText: {
    fontSize: 8,
    fontWeight: '900',
    color: Theme.muted,
  },
  filterTabActiveText: {
    color: '#FFFFFF',
  }
});
