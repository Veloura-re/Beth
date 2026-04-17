import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp, FadeIn, Layout } from 'react-native-reanimated';
import { Theme } from '../theme/theme';
import { Menu, QrCode, Plus, X, MapPin, Zap, ChevronRight, Barcode, ArrowLeft } from 'lucide-react-native';
import Sidebar from '../components/Sidebar';
import QRStickerModal from '../components/QRStickerModal';
import { apiFetch, logout } from '../utils/api';

export default function ProtocolScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [protocols, setProtocols] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  
  // Generation Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newProtocol, setNewProtocol] = useState({
    campaignId: '',
    locationName: '',
    rewardPoints: '10'
  });
  const [creating, setCreating] = useState(false);
  
  // Sticker Modal State
  const [stickerVisible, setStickerVisible] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const loadData = async () => {
    try {
      const me = await apiFetch('/users/me');
      if (me.role !== 'ADMIN' && me.role !== 'SUPERADMIN') {
        Alert.alert("Access Denied", "Authorized protocol clearance required.");
        navigation.replace('Dashboard');
        return;
      }
      setProfile(me);

      const [list, ops] = await Promise.all([
        apiFetch('/qrs'),
        apiFetch('/campaigns')
      ]);
      setProtocols(Array.isArray(list) ? list : []);
      setCampaigns(Array.isArray(ops) ? ops : []);
    } catch (error) {
      console.error('Failed to load protocols', error);
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
    loadData();
  };

  const handleCreateProtocol = async () => {
    if (!newProtocol.campaignId || !newProtocol.locationName) {
      Alert.alert("Incomplete Data", "All protocol parameters are required.");
      return;
    }

    setCreating(true);
    try {
      await apiFetch('/qrs', {
        method: 'POST',
        body: JSON.stringify({
          ...newProtocol,
          rewardPoints: parseInt(newProtocol.rewardPoints)
        })
      });
      setModalVisible(false);
      setNewProtocol({ campaignId: '', locationName: '', rewardPoints: '10' });
      loadData();
    } catch (error) {
      Alert.alert("Deployment Failed", error.message || "Unable to register protocol.");
    } finally {
      setCreating(false);
    }
  };

  const renderProtocolItem = (item, index) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => {
        setSelectedProtocol(item);
        setStickerVisible(true);
      }}
    >
      <Animated.View 
        key={item.id} 
        entering={FadeInDown.delay(100 * index).duration(400).springify()}
        style={styles.protocolCard}
      >
         <View style={styles.protocolHeader}>
            <View style={styles.protocolType}>
               <Barcode color="black" size={14} />
               <Text style={styles.protocolTypeText}>SYSTEM.v1</Text>
            </View>
            <Text style={styles.protocolId}>{item.id?.substring(0,8).toUpperCase() || 'REF-####'}</Text>
         </View>
         
         <View style={styles.protocolMain}>
            <View style={styles.protocolInfo}>
               <Text style={styles.locationTitle}>{item.locationName?.toUpperCase() || 'UNKNOWN DEPOT'}</Text>
               <Text style={styles.campaignSubtitle}>{item.campaign?.name || 'GENERIC INITIATIVE'}</Text>
            </View>
            <View style={styles.rewardBubble}>
               <Text style={styles.rewardValue}>{item.rewardPoints || 0}</Text>
               <Text style={styles.rewardUnit}>PTS</Text>
            </View>
         </View>

         <View style={styles.protocolFooter}>
            <View style={styles.metaRow}>
               <MapPin size={10} color={Theme.muted} />
               <Text style={styles.metaText}>{item.gps || 'NO GPS LOC'}</Text>
            </View>
            <View style={styles.statusIndicator}>
               <View style={styles.activeDot} />
               <Text style={styles.statusLabel}>{item.status || 'ACTIVE'}</Text>
            </View>
         </View>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="black" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSub}>Technical Protocols</Text>
          <Text style={styles.headerTitle}>REGISTRY</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateProtocol')}>
           <Plus color="white" size={24} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.statsBar}>
         <View style={styles.statMini}>
            <Text style={styles.statMiniVal}>{protocols?.length || 0}</Text>
            <Text style={styles.statMiniLab}>TOTAL PROTOCOLS</Text>
         </View>
         <View style={[styles.statMini, styles.borderLeft]}>
            <Text style={styles.statMiniVal}>{Array.isArray(protocols) ? protocols.filter(q => q.status === 'ACTIVE').length : 0}</Text>
            <Text style={styles.statMiniLab}>ACTIVE NODES</Text>
         </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="black" />
        </View>
      ) : (
        <FlatList
          data={protocols}
          renderItem={({ item, index }) => renderProtocolItem(item, index)}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>NO TECHNICAL IDENTIFIERS CURRENTLY LOGGED.</Text>
            </View>
          }
        />
      )}

      <Sidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
        currentRole={profile?.role}
        onLogout={async () => {
          await logout();
          navigation.replace('Login');
        }}
      />

      <QRStickerModal 
        visible={stickerVisible}
        protocol={selectedProtocol}
        onClose={() => setStickerVisible(false)}
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
  deployBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 32,
    paddingBottom: 120,
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
  protocolCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Theme.border,
    padding: 24,
    marginBottom: 16,
  },
  protocolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    paddingBottom: 8,
  },
  protocolType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  protocolTypeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#000000',
  },
  protocolId: {
    fontSize: 9,
    color: Theme.muted,
    fontFamily: 'monospace',
  },
  protocolMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  protocolInfo: {
    flex: 1,
    marginRight: 16,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  campaignSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: Theme.muted,
  },
  rewardBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    minWidth: 50,
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 14,
  },
  rewardUnit: {
    fontSize: 7,
    fontWeight: '900',
    color: Theme.muted,
  },
  protocolFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 8,
    color: Theme.muted,
    fontWeight: '600',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
  },
  statusLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#000000',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 9,
    fontWeight: '900',
    color: Theme.muted,
    letterSpacing: 1,
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
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  statMini: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statMiniVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
  statMiniLab: {
    fontSize: 7,
    fontWeight: '900',
    color: Theme.muted,
    letterSpacing: 1,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: Theme.border,
  },
  addBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 32,
    paddingBottom: 120,
  }
});
