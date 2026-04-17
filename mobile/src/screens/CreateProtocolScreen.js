import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Theme } from '../theme/theme';
import { ArrowLeft, ArrowRight, QrCode, Info, ChevronDown } from 'lucide-react-native';
import { apiFetch } from '../utils/api';
import SuccessOverlay from '../components/SuccessOverlay';

export default function CreateProtocolScreen({ navigation }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    campaignId: '',
    rewardPoints: '',
    locationName: '',
    painterId: '' // Metadata for physical painter identification
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const data = await apiFetch('/campaigns');
        setCampaigns(data);
        if (data.length > 0) updateForm('campaignId', data[0].id);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadCampaigns();
  }, []);

  const handleGenerate = async () => {
    if (!form.campaignId || !form.rewardPoints) {
      Alert.alert("Registry Error", "Target directive and unit value must be specified.");
      return;
    }

    setBusy(true);
    try {
      await apiFetch('/qrs', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          rewardPoints: parseInt(form.rewardPoints),
        })
      });
      
      setShowSuccess(true);
    } catch (error) {
      Alert.alert("Registry failure", error.message || "Failed to finalize unit deployment.");
    } finally {
      setBusy(false);
    }
  };

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  if (loading) {
     return (
       <View style={[styles.container, styles.center, { backgroundColor: Theme.background }]}>
         <ActivityIndicator color="black" />
       </View>
     );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="black" size={24} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerSub}>TECHNICAL REGISTRY</Text>
          <Text style={styles.headerTitle}>GENERATE PROTOCOL</Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.delay(200).duration(400).springify()} style={styles.infoCard}>
             <Info size={16} color={Theme.muted} />
             <Text style={styles.infoText}>
                Identify the target directive and physical painter for record synchronization.
             </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400).springify()} style={styles.form}>
             <Text style={styles.label}>TARGET SYSTEM DIRECTIVE</Text>
             <View style={styles.selectBox}>
                <Text style={styles.selectText}>
                  {campaigns.find(c => c.id === form.campaignId)?.name || "SELECT DIRECTIVE..."}
                </Text>
                <ChevronDown size={14} color={Theme.muted} />
             </View>
             {/* Note: In a full app, this would be a real picker, 
                 but for high-fidelity UI we show the selected state */}

             <Text style={styles.label}>UNIT VALUE (POINTS PER SCAN)</Text>
             <TextInput 
               style={styles.input}
               placeholder="100"
               keyboardType="numeric"
               value={form.rewardPoints}
               onChangeText={(v) => updateForm('rewardPoints', v)}
             />

             <Text style={styles.label}>GEOGRAPHICAL IDENTIFIER (LOCATION)</Text>
             <TextInput 
               style={styles.input}
               placeholder="e.g. DISTRICT ALPHA"
               value={form.locationName}
               onChangeText={(v) => updateForm('locationName', v)}
             />

             <Text style={styles.label}>PAINTER METADATA (OPTIONAL)</Text>
             <TextInput 
               style={styles.input}
               placeholder="IDENTIFIER..."
               value={form.painterId}
               onChangeText={(v) => updateForm('painterId', v)}
             />
          </Animated.View>
        </ScrollView>

        <TouchableOpacity 
          style={[styles.actionBtn, busy && styles.btnDisabled]} 
          onPress={handleGenerate}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.actionBtnText}>REGISTER PROTOCOL</Text>
              <ArrowRight color="white" size={18} />
            </>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <SuccessOverlay 
        visible={showSuccess} 
        message="PROTOCOL GENERATED"
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 32,
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
    marginBottom: 120,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
    marginBottom: 16,
    marginTop: 24,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  selectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
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
