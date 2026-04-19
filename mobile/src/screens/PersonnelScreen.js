import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList,
  TextInput,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp, FadeIn, Layout } from 'react-native-reanimated';
import { Theme } from '../theme/theme';
import { Menu, UserPlus, Info, Shield, Search, ArrowRight, X, ArrowLeft } from 'lucide-react-native';
import Sidebar from '../components/Sidebar';
import { apiFetch, logout } from '../utils/api';
import { 
  Modal, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';

export default function PersonnelScreen({ navigation, route }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState(null);

  const roleType = route.params?.roleType || (profile?.role === 'SUPERADMIN' ? 'ADMIN' : 'AGENT');

  const loadData = async () => {
    try {
      const me = await apiFetch('/users/me');
      setProfile(me);

      if (me.role !== 'ADMIN' && me.role !== 'SUPERADMIN') {
        Alert.alert("Access Denied", "Authorized clearance required.");
        navigation.replace('Dashboard');
        return;
      }
      
      const [allUsers, orgs] = await Promise.all([
        apiFetch('/users'),
        me.role === 'SUPERADMIN' ? apiFetch('/organizations') : Promise.resolve([])
      ]);

      const orgMap = (Array.isArray(orgs) ? orgs : []).reduce((acc, org) => {
        acc[org.id] = org.name;
        return acc;
      }, {});

      // Determine correct role type to display
      const effectiveRoleType = route.params?.roleType || (me.role === 'SUPERADMIN' ? 'ADMIN' : 'AGENT');

      // Filter based on who we are managing
      const data = Array.isArray(allUsers) ? allUsers : [];
      const filteredRegistry = data.filter(u => u.role === effectiveRoleType).map(u => ({
        ...u,
        organizationName: orgMap[u.organizationId] || 'UNKNOWN'
      }));
      
      setUsers(filteredRegistry);
    } catch (error) {
      console.error('Failed to load personnel', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [route.params?.roleType])
  );

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const renderUserItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(100 * index).duration(400).springify()} style={styles.userCard}>
      <View style={styles.userIcon}>
        {item.role === 'ADMIN' ? <Shield color="black" size={16} /> : <Info color="black" size={16} />}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name?.toUpperCase() || 'IDENTITY_PENDING'}</Text>
        <View style={styles.userMeta}>
          <Text style={styles.userEmail}>{item.email || 'NO_CLEARANCE'}</Text>
          {profile?.role === 'SUPERADMIN' && (
            <View style={styles.orgBadge}>
              <Text style={styles.orgBadgeText}>{item.organizationName?.toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.miniBadge}>
             <Text style={styles.miniBadgeText}>{item.role || 'AGENT'}</Text>
          </View>
       </View>
      </View>
      <View style={styles.userStatus}>
         <View style={styles.statusPulse} />
         <Text style={styles.statusLabel}>OPERATIONAL</Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="black" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSub}>Registry Alpha</Text>
          <Text style={styles.headerTitle}>{roleType === 'ADMIN' ? 'ADMIN REGISTRY' : 'AGENT REGISTRY'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => navigation.navigate('Invitation', { targetRole: roleType })}
        >
           <UserPlus color="black" size={20} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.searchContainer}>
        <Search color={Theme.muted} size={16} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`SEARCH ${roleType} REGISTRY...`}
          placeholderTextColor={Theme.muted + '88'}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="black" />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={({ item, index }) => renderUserItem({ item, index })}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>NO CORRESPONDING ENTRIES FOUND.</Text>
            </View>
          }
        />
      )}

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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  addBtn: {
    width: 48,
    height: 48,
    backgroundColor: Theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    height: 40,
  },
  list: {
    padding: 32,
    paddingBottom: 120,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 12,
  },
  userIcon: {
    width: 40,
    height: 40,
    backgroundColor: Theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 6,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userEmail: {
    fontSize: 9,
    fontWeight: '600',
    color: Theme.muted,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  miniBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#000000',
  },
  userStatus: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
  },
  statusLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: Theme.muted,
  },
  empty: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 10,
    fontWeight: '900',
    color: Theme.muted,
    letterSpacing: 1,
    textAlign: 'center',
  },
  backBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
    marginRight: 20,
  },
  orgBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#000000',
  },
  orgBadgeText: {
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  }
});
