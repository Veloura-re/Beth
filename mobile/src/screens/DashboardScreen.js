import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Theme } from '../theme/theme';
import { Zap, History, Wallet, Camera } from 'lucide-react-native';

export default function DashboardScreen({ navigation }) {
  const stats = [
    { label: 'Total Points', value: '1,450', icon: Zap },
    { label: 'Earnings', value: '$145.00', icon: Wallet },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome Back,</Text>
            <Text style={styles.nameText}>Agent Liora</Text>
          </View>
          <TouchableOpacity style={styles.profileCircle}>
            <Text style={styles.profileLetter}>L</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <stat.icon color={Theme.primary} size={24} style={styles.statIcon} />
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Scan Button (Large) */}
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => navigation.navigate('Scanner')}
        >
          <View style={styles.scanInner}>
            <Camera color="white" size={40} />
            <Text style={styles.scanText}>SCAN QR CODE</Text>
            <Text style={styles.scanSubtext}>Earn rewards instantly</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Rewards')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Zap color={Theme.primary} size={20} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Scanned: Times Square</Text>
              <Text style={styles.activityDate}>2 hours ago</Text>
            </View>
            <Text style={styles.activityPoints}>+10 pts</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  welcomeText: {
    color: Theme.muted,
    fontSize: 16,
  },
  nameText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileLetter: {
    color: Theme.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.surface,
    borderRadius: Theme.radius,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  statIcon: {
    marginBottom: 12,
  },
  statLabel: {
    color: Theme.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: Theme.primary,
    borderRadius: 24,
    height: 200,
    marginBottom: 40,
    overflow: 'hidden',
    shadowColor: Theme.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  scanInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 12,
    letterSpacing: 1,
  },
  scanSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    color: Theme.primary,
    fontWeight: '600',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.surface,
    borderRadius: Theme.radius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 51, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  activityDate: {
    color: Theme.muted,
    fontSize: 12,
  },
  activityPoints: {
    color: Theme.primary,
    fontWeight: '800',
    fontSize: 16,
  },
});
