import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { Theme } from '../theme/theme';
import { ArrowLeft, ArrowRight, UserPlus, Info } from 'lucide-react-native';
import { apiFetch } from '../utils/api';

export default function InvitationScreen({ navigation, route }) {
  const { targetRole } = route.params || {}; // ADMIN or AGENT
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!email) {
      Alert.alert("Input Error", "Target email is required for clearance.");
      return;
    }

    setInviting(true);
    try {
      await apiFetch('/invites', {
        method: 'POST',
        body: JSON.stringify({ email: email.toLowerCase(), role: targetRole })
      });
      
      Alert.alert(
        "Registry Logged", 
        `INVITATION DISPATCHED TO ${email.toUpperCase()}`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Protocol Error", error.message || "Failed to issue invitation.");
    } finally {
      setInviting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="black" size={24} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerSub}>PERSONNEL CLEARANCE</Text>
          <Text style={styles.headerTitle}>INVITE {targetRole}</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.content}
      >
        <View style={styles.infoCard}>
           <Info size={16} color={Theme.muted} />
           <Text style={styles.infoText}>
             Authorized invitation will grant access to BETH hierarchy under the role of {targetRole}.
           </Text>
        </View>

        <View style={styles.form}>
           <Text style={styles.label}>TARGET IDENTIFIER (EMAIL)</Text>
           <TextInput 
             style={styles.input}
             placeholder="operator@beth.arch"
             placeholderTextColor={Theme.muted + '44'}
             value={email}
             onChangeText={setEmail}
             autoCapitalize="none"
             keyboardType="email-address"
           />

           <View style={styles.roleDisplay}>
              <Text style={styles.label}>ASSIGNED PRIVILEGE</Text>
              <View style={styles.roleBadge}>
                 <Text style={styles.roleBadgeText}>{targetRole}</Text>
              </View>
           </View>
        </View>

        <TouchableOpacity 
          style={[styles.actionBtn, inviting && styles.btnDisabled]} 
          onPress={handleInvite}
          disabled={inviting}
        >
          {inviting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.actionBtnText}>DISPATCH INVITATION</Text>
              <ArrowRight color="white" size={18} />
            </>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
  },
  headerText: {
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
  },
  infoText: {
    flex: 1,
    fontSize: 9,
    fontWeight: '700',
    color: Theme.muted,
    lineHeight: 16,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 9,
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
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
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
  },
  btnDisabled: {
    opacity: 0.7,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  }
});
