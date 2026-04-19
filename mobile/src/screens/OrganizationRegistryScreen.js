import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Theme } from '../theme/theme';
import { Menu, Search, ArrowLeft, MoreVertical, Edit2, Trash2, X, Plus } from 'lucide-react-native';
import Sidebar from '../components/Sidebar';
import SuccessOverlay from '../components/SuccessOverlay';
import { apiFetch } from '../utils/api';

export default function OrganizationRegistryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      const [me, orgs] = await Promise.all([
        apiFetch('/users/me'),
        apiFetch('/organizations')
      ]);
      setProfile(me);
      setOrganizations(orgs);
    } catch (error) {
      console.error('Failed to load organizations', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const filteredOrgs = organizations.filter(o => 
    (o.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.id || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id, name) => {
    Alert.alert(
      "Decommission Organization",
      `Are you sure you want to terminate ${name}? This action is irreversible.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "DECOMMISSION", 
          style: "destructive",
          onPress: async () => {
             try {
               await apiFetch(`/organizations/${id}`, { method: 'DELETE' });
               setSuccessMsg('NODE_DECOMMISSIONED');
               setShowSuccess(true);
               loadData();
             } catch (error) {
              Alert.alert("Error", "Failed to decommission organization.");
            }
          }
        }
      ]
    );
  };

  const handleRename = (id, currentName) => {
    Alert.prompt(
      "Rename Organization",
      "Enter new identifier for this node:",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "RENAME", 
          onPress: async (newName) => {
            if (!newName) return;
             try {
               await apiFetch(`/organizations/${id}`, { 
                 method: 'PATCH',
                 body: JSON.stringify({ name: newName }) 
               });
               setSuccessMsg('NODE_RENAMED');
               setShowSuccess(true);
               loadData();
             } catch (error) {
              Alert.alert("Error", "Failed to rename organization.");
            }
          }
        }
      ],
      "plain-text",
      currentName
    );
  };

  const renderOrgItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(100 * index).duration(400).springify()} style={styles.orgCard}>
      <View style={styles.orgInfo}>
        <Text style={styles.orgName}>{item.name?.toUpperCase() || 'NODE_PENDING'}</Text>
         <Text style={styles.orgId}>{item.id}</Text>
         <View style={styles.statsRow}>
            <View style={styles.miniBadge}>
              <Text style={styles.miniBadgeText}>{item._count?.users || 0} MEMBERS</Text>
            </View>
            <View style={styles.miniBadge}>
              <Text style={styles.miniBadgeText}>{item._count?.campaigns || 0} DIRECTIVES</Text>
            </View>
         </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleRename(item.id, item.name)} style={styles.actionBtn}>
          <Edit2 color={Theme.muted} size={16} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={[styles.actionBtn, styles.deleteBtn]}>
          <Trash2 color="#FF4444" size={16} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.iconBtn}>
          <Menu color="black" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerLabel}>PLANETARY OVERSIGHT</Text>
          <Text style={styles.headerTitle}>ORG_REGISTRY</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Invitation')} style={styles.addBtn}>
          <Plus color="white" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search color={Theme.muted} size={18} />
        <TextInput 
          style={styles.searchInput}
          placeholder="SEARCH NODES..."
          placeholderTextColor={Theme.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X color={Theme.muted} size={18} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Theme.primary} />
        </View>
      ) : (
        <FlatList 
          data={filteredOrgs}
          renderItem={renderOrgItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>NO NODES DETECTED</Text>
            </View>
          }
        />
      )}

      <Sidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
        currentRole={profile?.role}
        onLogout={() => {}}
      />

      <SuccessOverlay 
        visible={showSuccess}
        message={successMsg}
        onClose={() => setShowSuccess(false)}
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
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '200',
    letterSpacing: 4,
    color: 'black',
  },
  addBtn: {
    width: 44,
    height: 44,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 24,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '700',
    color: 'black',
    letterSpacing: 1,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  orgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    color: 'black',
    marginBottom: 4,
  },
  orgId: {
    fontSize: 10,
    color: Theme.muted,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  miniBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: 'black',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
    backgroundColor: 'white',
  },
  deleteBtn: {
    borderColor: '#FFEBEB',
  },
  separator: {
    height: 1,
    backgroundColor: Theme.border,
    opacity: 0.5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
  }
});
