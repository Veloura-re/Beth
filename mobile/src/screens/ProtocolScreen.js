import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp, FadeIn, Layout } from 'react-native-reanimated';
import { Theme } from '../theme/theme';
import { Menu, QrCode, Plus, X, MapPin, Zap, ChevronRight, Barcode, ArrowLeft, Printer } from 'lucide-react-native';
import Sidebar from '../components/Sidebar';
import QRStickerModal from '../components/QRStickerModal';
import SuccessOverlay from '../components/SuccessOverlay';
import { apiFetch, logout } from '../utils/api';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';

export default function ProtocolScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [protocols, setProtocols] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Sticker Modal State
  const [stickerVisible, setStickerVisible] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  // Print Selection State
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState([]);

  const toggleSelection = (id) => {
    setSelectedQueue(prev => {
      if (prev.includes(id)) {
        return prev.filter(q => q !== id);
      }
      return [...prev, id];
    });
  };

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
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    loadData();
  };


  const handleBatchPrint = async () => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedQueue([]);
      Alert.alert("Print Queue Mode", "Tap the protocols exactly in the order you wish them to be printed.\n\nTap the print button again to finalize.");
      return;
    }

    if (selectedQueue.length === 0) {
      setSelectionMode(false);
      return;
    }

    try {
      const orderedProtocols = selectedQueue.map(id => protocols.find(p => p.id === id)).filter(Boolean);

      const qrCards = orderedProtocols.map(p => `
        <div style="border: 2px solid black; padding: 20px; width: 45%; box-sizing: border-box; text-align: center; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; font-family: monospace; font-size: 14px;">${p.campaign?.organization?.name || 'BETH CORE SYSTEM'}</h3>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(p.id)}" style="width: 150px; height: 150px; margin-bottom: 10px;" />
          <p style="margin: 0; font-family: monospace; font-size: 10px; color: #666;">ID: ${p.id.substring(0,8).toUpperCase()}</p>
          <p style="margin: 5px 0 0 0; font-family: sans-serif; font-size: 12px; font-weight: bold;">${p.locationName?.toUpperCase() || 'UNKNOWN LOC'}</p>
          <p style="margin: 0; font-family: sans-serif; font-size: 10px; color: #666;">${p.campaign?.name || 'GENERIC DIRECTIVE'}</p>
        </div>
      `).join('');

      const htmlContent = `
        <html>
          <body style="font-family: sans-serif; padding: 40px; margin: 0;">
            <h1 style="text-align: center; font-size: 24px; letter-spacing: 4px; margin-bottom: 40px;">BETH.ARCH // BATCH PROTOCOL EXPORT</h1>
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
              ${qrCards}
            </div>
            <p style="text-align: center; font-size: 10px; color: #999; margin-top: 40px;">MERSI ARCHITECTURE STANDARDS V 16.2.0 - CONFIDENTIAL</p>
          </body>
        </html>
      `;

      await Print.printAsync({ html: htmlContent });
      setSelectionMode(false);
      setSelectedQueue([]);
    } catch (error) {
      console.error('Batch Print Failed', error);
      Alert.alert("Print Error", "Failed to generate print job.");
    }
  };

  const groupedProtocols = React.useMemo(() => {
    const batches = {};
    const singles = [];
    
    protocols.forEach(p => {
      if (p.batchId) {
        if (!batches[p.batchId]) batches[p.batchId] = [];
        batches[p.batchId].push(p);
      } else {
        singles.push(p);
      }
    });

    const batchGroups = Object.entries(batches).map(([batchId, nodes]) => {
      const activeCount = nodes.filter(n => n.status === 'ACTIVE').length;
      return {
        isBatch: true,
        id: batchId,
        nodes,
        total: nodes.length,
        active: activeCount,
        campaign: nodes[0].campaign,
        locationName: nodes[0].locationName,
        rewardPoints: nodes[0].rewardPoints,
        status: activeCount > 0 ? 'ACTIVE' : 'EXPIRED',
        gps: nodes[0].gps,
        createdAt: nodes[0].createdAt
      };
    });

    // Merge and sort
    return [...singles, ...batchGroups].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [protocols]);

  // Specific print function for a batch row
  const printBatchGroup = async (batchItem) => {
    try {
      const qrCards = batchItem.nodes.map(p => `
        <div style="border: 2px solid black; padding: 20px; width: 45%; box-sizing: border-box; text-align: center; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; font-family: monospace; font-size: 14px;">${p.campaign?.organization?.name || 'BETH CORE SYSTEM'}</h3>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(p.id)}" style="width: 150px; height: 150px; margin-bottom: 10px;" />
          <p style="margin: 0; font-family: monospace; font-size: 10px; color: #666;">ID: ${p.id.substring(0,8).toUpperCase()}</p>
          <p style="margin: 5px 0 0 0; font-family: sans-serif; font-size: 12px; font-weight: bold;">${p.locationName?.toUpperCase() || 'UNKNOWN LOC'}</p>
          <p style="margin: 0; font-family: sans-serif; font-size: 10px; color: #666;">${p.campaign?.name || 'GENERIC DIRECTIVE'}</p>
        </div>
      `).join('');

      const htmlContent = `
        <html>
          <body style="font-family: sans-serif; padding: 40px; margin: 0;">
            <h1 style="text-align: center; font-size: 24px; letter-spacing: 4px; margin-bottom: 40px;">BETH.ARCH // BATCH EXPORT (${batchItem.total} NODES)</h1>
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
              ${qrCards}
            </div>
            <p style="text-align: center; font-size: 10px; color: #999; margin-top: 40px;">MERSI ARCHITECTURE STANDARDS V 16.2.0 - CONFIDENTIAL</p>
          </body>
        </html>
      `;

      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      console.error('Batch Print Failed', error);
      Alert.alert("Print Error", "Failed to generate print job.");
    }
  };

  const renderProtocolItem = (item, index) => {
    if (item.isBatch) {
       return (
         <Animated.View 
           key={item.id} 
           entering={FadeInDown.delay(100 * index).duration(400).springify()}
           style={[styles.protocolCard, { borderColor: '#000000', borderWidth: 2 }]}
         >
           <View style={styles.protocolHeader}>
              <View style={styles.protocolType}>
                 <Zap color="black" size={20} />
                 <Text style={styles.protocolTypeText}>BATCH DEPLOYMENT</Text>
              </View>
              <Text style={styles.protocolId}>({item.nodes.length} UNITS)</Text>
           </View>

           <View style={styles.protocolMain}>
              <View style={styles.protocolInfo}>
                 <Text style={styles.locationTitle}>{item.locationName?.toUpperCase() || 'UNKNOWN DEPOT'}</Text>
                 <Text style={styles.campaignSubtitle}>{item.campaign?.name || 'GENERIC INITIATIVE'}</Text>
              </View>
              <TouchableOpacity style={styles.inlinePrintBtn} onPress={() => printBatchGroup(item)}>
                 <Printer color="white" size={16} />
                 <Text style={styles.inlinePrintText}>PRINT ALL</Text>
              </TouchableOpacity>
           </View>

           <View style={styles.protocolFooter}>
              <View style={styles.metaRow}>
                 <Text style={styles.metaText}>{item.active}/{item.total} ACTIVE</Text>
              </View>
              <View style={[styles.statusIndicator, item.status === 'EXPIRED' && { opacity: 0.3 }]}>
                 <View style={styles.activeDot} />
                 <Text style={styles.statusLabel}>{item.status}</Text>
              </View>
           </View>
         </Animated.View>
       );
    }

    const isSelected = selectedQueue.includes(item.id);
    const orderIndex = selectedQueue.indexOf(item.id) + 1;

    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => {
          if (selectionMode) {
            toggleSelection(item.id);
          } else {
            setSelectedProtocol(item);
            setStickerVisible(true);
          }
        }}
      >
        <Animated.View 
          key={item.id} 
          entering={FadeInDown.delay(100 * index).duration(400).springify()}
          style={[styles.protocolCard, selectionMode && isSelected && styles.protocolCardSelected]}
        >
          {selectionMode && (
            <View style={[styles.selectionBadge, isSelected && styles.selectionBadgeActive]}>
              <Text style={[styles.selectionBadgeText, isSelected && styles.selectionBadgeTextActive]}>
                {isSelected ? orderIndex : ''}
              </Text>
            </View>
          )}
          <View style={styles.protocolHeader}>
            <View style={styles.protocolType}>
               <QRCode
                 value={item.id}
                 size={20}
                 color="black"
                 backgroundColor="white"
               />
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
  };

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
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            style={[styles.printBatchBtn, selectionMode && styles.printBatchBtnActive]} 
            onPress={handleBatchPrint}
          >
             <Printer color={selectionMode ? "white" : "black"} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateProtocol')}>
             <Plus color="white" size={24} />
          </TouchableOpacity>
        </View>
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
          data={groupedProtocols}
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

      <SuccessOverlay 
        visible={showSuccess}
        message="REGISTRATION_SUCCESSFUL"
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
  inlinePrintBtn: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  inlinePrintText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
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
  printBatchBtn: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  printBatchBtnActive: {
    backgroundColor: '#000000',
  },
  protocolCardSelected: {
    borderColor: '#000000',
    backgroundColor: '#FAFAFA',
  },
  selectionBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  selectionBadgeActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  selectionBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'transparent',
  },
  selectionBadgeTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 32,
    paddingBottom: 120,
  }
});
