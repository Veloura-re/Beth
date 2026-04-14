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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { Theme } from '../theme/theme';
import { ArrowLeft, ArrowRight, Zap, Info } from 'lucide-react-native';
import { apiFetch } from '../utils/api';

export default function CreateCampaignScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    budget: '',
    rewardPerScan: '',
    painterMargin: '0.05'
  });
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    if (!form.name || !form.rewardPerScan) {
      Alert.alert("Input Required", "Identifier and scan reward must be defined.");
      return;
    }

    setBusy(true);
    try {
      await apiFetch('/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          budget: parseFloat(form.budget) || 0,
          rewardPerScan: parseInt(form.rewardPerScan),
          painterMargin: parseFloat(form.painterMargin)
        })
      });
      
      Alert.alert(
        "Directive Live", 
        "STRATEGIC INITIATIVE SUCCESSFULLY REGISTERED.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Deployment Error", error.message || "Failed to initialize directive.");
    } finally {
      setBusy(false);
    }
  };

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="black" size={24} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerSub}>SYSTEM OVERLAY</Text>
          <Text style={styles.headerTitle}>NEW DIRECTIVE</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>CORE IDENTIFIER</Text>
            <TextInput 
              style={styles.input}
              placeholder="e.g. AURORA OVERLAY PROTOCOL"
              placeholderTextColor={Theme.muted + '44'}
              value={form.name}
              onChangeText={(v) => updateForm('name', v)}
            />

            <Text style={styles.label}>OPERATIONAL DESCRIPTION</Text>
            <TextInput 
              style={[styles.input, styles.textArea]}
              placeholder="STRATEGIC GOALS..."
              placeholderTextColor={Theme.muted + '44'}
              multiline
              numberOfLines={3}
              value={form.description}
              onChangeText={(v) => updateForm('description', v)}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
               <Text style={styles.label}>SCAN REWARD (POINTS)</Text>
               <TextInput 
                 style={styles.input}
                 placeholder="10"
                 keyboardType="numeric"
                 value={form.rewardPerScan}
                 onChangeText={(v) => updateForm('rewardPerScan', v)}
               />
            </View>
            <View style={styles.col}>
               <Text style={styles.label}>PAINTER MARGIN (%)</Text>
               <TextInput 
                 style={styles.input}
                 placeholder="0.05"
                 keyboardType="numeric"
                 value={form.painterMargin}
                 onChangeText={(v) => updateForm('painterMargin', v)}
               />
            </View>
          </View>

          <Text style={styles.label}>TOTAL BUDGETARY ALLOCATION (UNITS)</Text>
          <TextInput 
            style={styles.input}
            placeholder="5000"
            keyboardType="numeric"
            value={form.budget}
            onChangeText={(v) => updateForm('budget', v)}
          />

          <View style={styles.infoCard}>
             <Zap size={16} color={Theme.muted} />
             <Text style={styles.infoText}>
                Directive activation will immediately update registry protocols across active devices.
             </Text>
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={[styles.actionBtn, busy && styles.btnDisabled]} 
          onPress={handleCreate}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.actionBtnText}>DEPLOY DIRECTIVE</Text>
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
    padding: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
    marginBottom: 16,
    marginTop: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 32,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 24,
  },
  col: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderWidth: 1,
    borderColor: Theme.border,
    marginTop: 16,
    marginBottom: 120,
    gap: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 9,
    fontWeight: '700',
    color: Theme.muted,
    lineHeight: 16,
  },
  actionBtn: {
    backgroundColor: '#000000',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
