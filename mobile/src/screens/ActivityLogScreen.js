import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Theme } from '../theme/theme';
import { Menu, ArrowLeft, Clock, QrCode, CheckCircle2, ChevronRight } from 'lucide-react-native';
import Sidebar from '../components/Sidebar';
import { apiFetch } from '../utils/api';

export default function ActivityLogScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profile, setProfile] = useState(null);

  const loadData = async () => {
    try {
      const [me, logs] = await Promise.all([
        apiFetch('/users/me'),
        apiFetch('/scans/me')
      ]);
      setProfile(me);
      setActivities(logs);
    } catch (error) {
      console.error('Failed to load activity logs', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const renderActivityItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(50 * index).duration(300).springify()} style={styles.activityCard}>
      <View style={styles.iconContainer}>
        <CheckCircle2 color="#00C853" size={18} />
      </View>
      <View style={styles.activityInfo}>
        <View style={styles.activityHeader}>
          <Text style={styles.campaignName}>{item.campaign?.name?.toUpperCase() || 'CORE_DIRECTIVE'}</Text>
          <Text style={styles.points}>+{item.pointsEarned} PTS</Text>
        </View>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString().toUpperCase()}</Text>
        <View style={styles.qrRow}>
           <QrCode color={Theme.muted} size={12} />
           <Text style={styles.qrId}>{item.qrId.substring(0, 16)}...</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.headerBtn}>
          <Menu color="black" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerLabel}>PERSONNEL_LOGS</Text>
          <Text style={styles.headerTitle}>CAPTURE_ACTIVITY</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.statsSummary}>
         <View style={styles.statBox}>
            <Text style={styles.statLabel}>TOTAL CAPTURES</Text>
            <Text style={styles.statValue}>{activities.length}</Text>
         </View>
         <View style={styles.vLine} />
         <View style={styles.statBox}>
            <Text style={styles.statLabel}>UNITS EARNED</Text>
            <Text style={styles.statValue}>
              {activities.reduce((sum, item) => sum + item.pointsEarned, 0)}
            </Text>
         </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Theme.primary} />
        </View>
      ) : (
        <FlatList 
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.listHeader}>
               <Text style={styles.listHeaderText}>CHRONOLOGICAL_STREAM</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
               <Text style={styles.emptyText}>NO CAPTURES DETECTED IN CURRENT CYCLE</Text>
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
  headerBtn: {
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
    letterSpacing: 3,
    color: 'black',
  },
  placeholder: {
    width: 44,
  },
  statsSummary: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 24,
    borderWidth: 1,
    borderColor: Theme.border,
    padding: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: Theme.muted,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: 'black',
  },
  vLine: {
    width: 1,
    height: '100%',
    backgroundColor: Theme.border,
    marginHorizontal: 10,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  listHeader: {
    marginBottom: 20,
  },
  listHeaderText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FFF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  campaignName: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    color: 'black',
  },
  points: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00C853',
  },
  timestamp: {
    fontSize: 8,
    fontWeight: '700',
    color: Theme.muted,
    marginBottom: 8,
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qrId: {
    fontSize: 9,
    color: Theme.muted,
    fontFamily: 'monospace',
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
    textAlign: 'center',
  }
});
