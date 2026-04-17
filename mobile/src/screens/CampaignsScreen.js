import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp, FadeIn, Layout } from 'react-native-reanimated';
import { Theme } from '../theme/theme';
import { Menu, Zap, Target, Layers, ArrowRight, X, ArrowLeft, Plus, Pencil } from 'lucide-react-native';
import Sidebar from '../components/Sidebar';
import { apiFetch, logout } from '../utils/api';

export default function CampaignsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const loadData = async () => {
    try {
      const [allCampaigns, me] = await Promise.all([
        apiFetch('/campaigns'),
        apiFetch('/users/me')
      ]);
      setCampaigns(Array.isArray(allCampaigns) ? allCampaigns : []);
      setProfile(me);
    } catch (error) {
      console.error('Failed to load campaigns', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );


  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const renderCampaignItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(100 * index).duration(400).springify()} style={styles.campaignCard}>
      <View style={styles.campaignHeader}>
         <View style={styles.campaignIcon}>
            <Zap color="black" size={16} />
         </View>
         <View style={styles.campaignMeta}>
          <Text style={styles.campaignName}>{item.name?.toUpperCase() || 'UNTITLED DIRECTIVE'}</Text>
          <Text style={styles.campaignId}>ID: {item.id?.substring(0,8) || '####'}</Text>
       </View>
       <View style={styles.activeBadge}>
          <Text style={styles.activeText}>{item.status || 'ACTIVE'}</Text>
       </View>
      </View>
      
      <View style={styles.statsRow}>
         <View style={styles.statBox}>
            <Text style={styles.statVal}>{item._count?.scans || 0}</Text>
            <Text style={styles.statLab}>VOLUME</Text>
         </View>
         <View style={[styles.statBox, styles.borderLeft]}>
            <Text style={styles.statVal}>{item.rewardPerScan || 0}</Text>
            <Text style={styles.statLab}>REWARD</Text>
         </View>
      </View>

      <TouchableOpacity 
        style={styles.detailsBtn} 
        onPress={() => navigation.navigate('CreateCampaign', { campaign: item })}
      >
         <View style={styles.detailsBtnContent}>
            <Pencil color="black" size={14} />
            <Text style={styles.detailsBtnText}>EDIT SYSTEM DIRECTIVE</Text>
         </View>
         <ArrowRight color="black" size={12} />
      </TouchableOpacity>
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
          <Text style={styles.headerSub}>Technical Directives</Text>
          <Text style={styles.headerTitle}>CAMPAIGNS</Text>
        </View>
        <TouchableOpacity style={styles.deployBtn} onPress={() => navigation.navigate('CreateCampaign')}>
           <Plus color="white" size={24} />
        </TouchableOpacity>
      </Animated.View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="black" />
        </View>
      ) : (
        <FlatList
          data={campaigns}
          renderItem={({ item, index }) => renderCampaignItem({ item, index })}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>NO ACTIVE DIRECTIVES LOGGED IN SYSTEM.</Text>
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
  deployBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 32,
    paddingBottom: 120,
  },
  campaignCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 24,
    padding: 24,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  campaignIcon: {
    width: 40,
    height: 40,
    backgroundColor: Theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  campaignMeta: {
    flex: 1,
  },
  campaignName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  campaignId: {
    fontSize: 8,
    color: Theme.muted,
    fontWeight: '600',
    letterSpacing: 1,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#000000',
  },
  activeText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 20,
    backgroundColor: Theme.background + '44',
  },
  statBox: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: Theme.border,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  statLab: {
    fontSize: 7,
    fontWeight: '900',
    color: Theme.muted,
    letterSpacing: 1,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
  },
  detailsBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailsBtnText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#000000',
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
});
