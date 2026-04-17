import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Theme } from '../theme/theme';
import { ArrowLeft, Shapes, Wallet, Clock, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { apiFetch, requestCashout } from '../utils/api';
import SuccessOverlay from '../components/SuccessOverlay';

export default function RewardsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await apiFetch('/users/me');
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleRedeem = async (type, points) => {
    const cashValue = parseInt(points.replace(',', '')) / 10;
    
    Alert.alert(
      "CONFIRM REDEMPTION",
      `TRADE ${points} UNITS FOR ${type.toUpperCase()} VALUED AT $${cashValue}?`,
      [
        { text: "DECLINE", style: "cancel" },
        { 
          text: "CONFIRM", 
          onPress: async () => {
            setProcessing(true);
            try {
              await requestCashout(cashValue);
              setShowSuccess(true);
              loadProfile();
            } catch (error) {
              Alert.alert("ERROR", error.message || "SYSTEM LATENCY. RETRY LATER.");
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="black" />
      </View>
    );
  }

  const balance = profile?.performance?.availableBalance || 0;

  const rewards = [
    { title: 'Global Credit', points: '5,000', id: 'VAL-50', icon: Wallet },
    { title: 'Treasury Wire', points: '10,000', id: 'VAL-100', icon: ShieldCheck },
    { title: 'System Refresh', points: '500', id: 'VAL-05', icon: Clock },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="black" size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerSub}>Value Registry</Text>
          <Text style={styles.headerTitle}>REWARD.LOG</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(200).duration(500).springify()} style={styles.balanceCard}>
           <Text style={styles.balanceLabel}>Unit Registry Balance</Text>
           <Text style={styles.balanceValue}>{balance.toLocaleString()}</Text>
           <View style={styles.statusRow}>
              <View style={styles.dot} />
              <Text style={styles.statusText}>ALL CLEARANCES STABLE</Text>
           </View>
        </Animated.View>

        <View style={styles.sectionHeader}>
           <Text style={styles.sectionLabel}>Available Values</Text>
           <View style={styles.hLine} />
        </View>

        {rewards.map((reward, i) => {
          const pointsNeeded = parseInt(reward.points.replace(',', ''));
          const canAfford = balance >= pointsNeeded;

          return (
            <Animated.View key={i} entering={FadeInDown.delay(300 + (100 * i)).duration(400).springify()}>
              <TouchableOpacity 
                style={[styles.rewardCard, !canAfford && styles.disabled]}
                onPress={() => canAfford && handleRedeem(reward.title, reward.points)}
                disabled={!canAfford || processing}
                activeOpacity={0.8}
              >
                <View style={styles.rewardIcon}>
                   <reward.icon color="black" size={20} />
                </View>
                <View style={styles.rewardInfo}>
                   <Text style={styles.rewardTitle}>{reward.title.toUpperCase()}</Text>
                   <Text style={styles.rewardId}>{reward.id}</Text>
                </View>
                <View style={[styles.rewardAction, { backgroundColor: canAfford ? 'black' : Theme.border }]}>
                   <Text style={[styles.rewardPointText, { color: canAfford ? 'white' : Theme.muted }]}>{reward.points}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <View style={styles.footerInfo}>
           <Text style={styles.footerInfoText}>
             ALL REDEMPTIONS ARE AUDITED BY MERSI HQ. PROCESSING WINDOW: 24-48H UTC.
           </Text>
        </View>
      </ScrollView>

      <SuccessOverlay 
        visible={showSuccess} 
        message="REWARD DISPATCHED"
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
  center: {
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
  backBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  headerSub: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '200',
    color: '#000000',
    letterSpacing: 1,
  },
  content: {
    padding: 32,
    paddingBottom: 120,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 48,
  },
  balanceLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -2,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    paddingTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: '#000000',
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
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
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 12,
  },
  disabled: {
    opacity: 0.4,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#000000',
    marginBottom: 2,
  },
  rewardId: {
    fontSize: 9,
    color: Theme.muted,
    fontWeight: '600',
    letterSpacing: 1,
  },
  rewardAction: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  rewardPointText: {
    fontSize: 10,
    fontWeight: '900',
  },
  footerInfo: {
    marginTop: 48,
  },
  footerInfoText: {
    fontSize: 8,
    fontWeight: '900',
    color: Theme.muted,
    opacity: 0.4,
    textAlign: 'center',
    lineHeight: 14,
    letterSpacing: 1,
  }
});
