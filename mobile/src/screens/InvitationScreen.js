import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Theme } from '../theme/theme';
import { ArrowLeft, ArrowRight, UserPlus, Info } from 'lucide-react-native';
import { getMyProfile, getMyPerformance, getOrganizations, createInvitation } from '../utils/api';
import SuccessOverlay from '../components/SuccessOverlay';
import { useData } from '../hooks/useData';
import { Skeleton } from '../components/Skeleton';

export default function InvitationScreen({ navigation, route }) {
  const { targetRole } = route.params || {}; // ADMIN or AGENT
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [newOrgName, setNewOrgName] = useState('');

  const { data: profile } = useData('user_performance', getMyPerformance); 
  const { data: orgsData, loading: orgsLoading } = useData('organizations', getOrganizations, { 
    enabled: profile?.role === 'SUPERADMIN' 
  });

  const isSuperAdmin = profile?.role === 'SUPERADMIN';
  const organizations = orgsData || [];

  const handleInvite = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter an email address.");
      return;
    }

    setInviting(true);
    try {
      await createInvitation({
        email: email.toLowerCase(),
        role: targetRole,
        organizationName: isSuperAdmin && newOrgName ? newOrgName : undefined,
        organizationId: isSuperAdmin && selectedOrgId ? selectedOrgId : undefined
      });
      
      setShowSuccess(true);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="black" size={24} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerSub}>Invite Member</Text>
          <Text style={styles.headerTitle}>Invite {targetRole}</Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.content}
      >
        <Animated.View entering={FadeInDown.delay(200).duration(400).springify()} style={styles.infoCard}>
           <Info size={16} color={Theme.muted} />
           <Text style={styles.infoText}>
             This will send an invite to join your organization as a {targetRole}.
           </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400).springify()} style={styles.form}>
           <Text style={styles.label}>EMAIL ADDRESS</Text>
           <TextInput 
             style={styles.input}
             placeholder="member@email.com"
             placeholderTextColor={Theme.muted + '44'}
             value={email}
             onChangeText={setEmail}
             autoCapitalize="none"
             keyboardType="email-address"
           />

           <View style={styles.roleDisplay}>
              <Text style={styles.label}>ROLE</Text>
              <View style={styles.roleBadge}>
                 <Text style={styles.roleBadgeText}>{targetRole}</Text>
              </View>
           </View>

           {isSuperAdmin && targetRole === 'ADMIN' && (
             <View style={styles.orgSection}>
               <Text style={styles.label}>ORGANIZATION</Text>
               
               <View style={styles.orgOptions}>
                 {organizations.map(org => (
                   <TouchableOpacity 
                     key={org.id}
                     style={[styles.orgTab, selectedOrgId === org.id && styles.orgTabActive]}
                     onPress={() => {
                       setSelectedOrgId(org.id);
                       setNewOrgName('');
                     }}
                   >
                     <Text style={[styles.orgText, selectedOrgId === org.id && styles.orgTextActive]}>
                       {org.name.toUpperCase()}
                     </Text>
                   </TouchableOpacity>
                 ))}
               </View>

               <View style={styles.divider}>
                 <View style={styles.dLine} />
                 <Text style={styles.dText}>OR CREATE A NEW ONE</Text>
                 <View style={styles.dLine} />
               </View>

               <TextInput 
                 style={styles.input}
                 placeholder="COMPANY NAME"
                 placeholderTextColor={Theme.muted + '44'}
                 value={newOrgName}
                 onChangeText={(text) => {
                   setNewOrgName(text);
                   setSelectedOrgId('');
                 }}
               />
             </View>
           )}
        </Animated.View>

        <TouchableOpacity 
          style={[styles.actionBtn, inviting && styles.btnDisabled]} 
          onPress={handleInvite}
          disabled={inviting}
        >
          {inviting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.actionBtnText}>SEND INVITATION</Text>
              <ArrowRight color="white" size={18} />
            </>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <SuccessOverlay 
        visible={showSuccess} 
        message="INVITE SENT"
        onClose={() => {
          setShowSuccess(false);
          navigation.goBack();
        }}
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
  backBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
    marginRight: 20,
    borderRadius: 12,
  },
  headerText: {
    flex: 1,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '200',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 32,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 48,
    gap: 16,
    borderRadius: Theme.radius,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: Theme.muted,
    lineHeight: 16,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
    marginBottom: 16,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 48,
  },
  roleDisplay: {
    marginTop: 16,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 12,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  actionBtn: {
    backgroundColor: '#000000',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 'auto',
    borderRadius: Theme.radius,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  orgSection: {
    marginTop: 32,
  },
  orgOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  orgTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: 8,
  },
  orgTabActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  orgText: {
    fontSize: 10,
    color: Theme.muted,
    fontWeight: '900',
  },
  orgTextActive: {
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  dLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.border,
  },
  dText: {
    fontSize: 9,
    fontWeight: '900',
    color: Theme.muted,
  }
});
