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
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Theme } from '../theme/theme';
import { ArrowLeft, ArrowRight, QrCode, Info, ChevronDown, User, X } from 'lucide-react-native';
import { getCampaigns, getUsers, createQRCodes } from '../utils/api';
import SuccessOverlay from '../components/SuccessOverlay';

export default function CreateProtocolScreen({ navigation }) {
  const [campaigns, setCampaigns] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    campaignId: '',
    rewardPoints: '',
    locationName: '',
    painterId: '',
    quantity: '1'
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [showCampaignPicker, setShowCampaignPicker] = useState(false);

  useEffect(() => {
    const loadRegistry = async () => {
      try {
        const [campaignData, agentData] = await Promise.all([
          getCampaigns(),
          getUsers()
        ]);
        
        setCampaigns(campaignData);
        setAgents(agentData.filter(u => u.role === 'AGENT'));
        
        if (campaignData.length > 0) updateForm('campaignId', campaignData[0].id);
      } catch (error) {
        console.error('Failed to load screen registry', error);
      } finally {
        setLoading(false);
      }
    };
    loadRegistry();
  }, []);

  const handleGenerate = async () => {
    if (!form.campaignId || !form.rewardPoints) {
      Alert.alert("Error", "Please select a campaign and enter points.");
      return;
    }

    const points = parseInt(form.rewardPoints);
    if (isNaN(points)) {
      Alert.alert("Error", "Points must be a number.");
      setBusy(false);
      return;
    }

    setBusy(true);

    try {
      const response = await createQRCodes({
        ...form,
        painterId: form.painterId || null,
        rewardPoints: points,
        quantity: parseInt(form.quantity || '1', 10),
      });
      
      console.log('[REGISTRY_SUCCESS]', response);
      setShowSuccess(true);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create QR code.");
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
          <Text style={styles.headerSub}>QR Code Details</Text>
          <Text style={styles.headerTitle}>Create QR Code</Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.delay(200).duration(400).springify()} style={styles.infoCard}>
             <Info size={16} color={Theme.muted} />
             <Text style={styles.infoText}>
                Select a campaign and an agent to assign this QR code to.
             </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400).springify()} style={styles.form}>
             <Text style={styles.label}>CAMPAIGN</Text>
             <TouchableOpacity 
               style={styles.selectBox} 
               onPress={() => setShowCampaignPicker(true)}
             >
                <Text style={styles.selectText}>
                  {campaigns.find(c => c.id === form.campaignId)?.name || "Select campaign..."}
                </Text>
                <ChevronDown size={14} color={Theme.muted} />
             </TouchableOpacity>

             <Text style={styles.label}>ASSIGNED AGENT</Text>
             <TouchableOpacity 
               style={styles.selectBox} 
               onPress={() => setShowAgentPicker(true)}
             >
                <Text style={[styles.selectText, !form.painterId && { color: Theme.muted }]}>
                  {agents.find(a => a.id === form.painterId)?.name || "Select agent (optional)..."}
                </Text>
                <User size={14} color={Theme.muted} />
             </TouchableOpacity>

             <Text style={styles.label}>POINTS PER SCAN</Text>
             <TextInput 
               style={styles.input}
               placeholder="100"
               keyboardType="numeric"
               value={form.rewardPoints}
               onChangeText={(v) => updateForm('rewardPoints', v)}
             />

             <Text style={styles.label}>LOCATION</Text>
             <TextInput 
               style={styles.input}
               placeholder="e.g. Main Entrance"
               value={form.locationName}
               onChangeText={(v) => updateForm('locationName', v)}
             />

             <Text style={[styles.label, { marginTop: 24 }]}>QUANTITY</Text>
             <TextInput 
               style={styles.input}
               placeholder="1"
               keyboardType="numeric"
               value={form.quantity}
               onChangeText={(v) => updateForm('quantity', v)}
             />

             <TouchableOpacity 
               style={[styles.actionBtn, busy && styles.btnDisabled]} 
               onPress={handleGenerate}
               disabled={busy}
               activeOpacity={0.8}
             >
               {busy ? (
                 <ActivityIndicator color="white" />
               ) : (
                 <>
                   <Text style={styles.actionBtnText}>CREATE QR CODE</Text>
                   <ArrowRight color="white" size={18} />
                 </>
               )}
             </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessOverlay 
        visible={showSuccess} 
        message="QR CODE CREATED"
        onClose={() => {
          setShowSuccess(false);
          navigation.goBack();
        }}
      />

      {/* Campaign Picker Modal */}
      <Modal visible={showCampaignPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECT CAMPAIGN</Text>
              <TouchableOpacity onPress={() => setShowCampaignPicker(false)}>
                <X size={20} color="black" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={campaigns}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.pickerItem}
                  onPress={() => {
                    updateForm('campaignId', item.id);
                    setShowCampaignPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Agent Picker Modal */}
      <Modal visible={showAgentPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECT AGENT</Text>
              <TouchableOpacity onPress={() => setShowAgentPicker(false)}>
                <X size={20} color="black" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={agents}
              ListHeaderComponent={() => (
                <TouchableOpacity 
                  style={styles.pickerItem}
                  onPress={() => {
                    updateForm('painterId', '');
                    setShowAgentPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, { color: Theme.muted }]}>NONE</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.pickerItem}
                  onPress={() => {
                    updateForm('painterId', item.id);
                    setShowAgentPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{item.name}</Text>
                  <Text style={styles.pickerItemSub}>{item.email}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    marginBottom: 48,
  },
  label: {
    fontSize: 11,
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
    fontSize: 14,
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
    marginTop: 48,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    height: '60%',
    padding: 32,
    borderTopLeftRadius: Theme.radius,
    borderTopRightRadius: Theme.radius,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
    flex: 1,
  },
  pickerItem: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'black',
  },
  pickerItemSub: {
    fontSize: 12,
    color: Theme.muted,
    marginTop: 4,
  }
});
