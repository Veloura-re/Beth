import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StatusBar, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Theme } from '../theme/theme';
import { register } from '../utils/api';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !token) {
      Alert.alert("Registry Error", "All clearance parameters must be satisfied.");
      return;
    }

    setLoading(true);
    try {
      const data = await register(name, email, password, token);
      console.info(`[REGISTRY] New operator authorized: ${data.user?.role}`);
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert(
        "Clearance Rejected", 
        error.message || "Invalid or expired invitation token.",
        [{ text: "DISMISS" }]
      );
    } finally {
      setLoading(false);
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
          <Text style={styles.headerSub}>PERSONNEL REGISTRY</Text>
          <Text style={styles.headerTitle}>INITIALIZATION</Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.formCard}>
            <Text style={styles.instruction}>
              Submit authorized clearance parameters to claim your network node.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>OPERATOR NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="YOUR NAME"
                placeholderTextColor={Theme.muted + '66'}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>IDENTIFIER (EMAIL)</Text>
              <TextInput
                style={styles.input}
                placeholder="operator@beth.arch"
                placeholderTextColor={Theme.muted + '66'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>NEW ACCESS KEY (PASSWORD)</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Theme.muted + '66'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CLEARANCE TOKEN (INVITE CODE)</Text>
              <TextInput
                style={styles.input}
                placeholder="TOKEN STRING"
                placeholderTextColor={Theme.muted + '66'}
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
              />
            </View>

          </Animated.View>
        </ScrollView>
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.9}
        >
          <Text style={styles.registerBtnText}>AUTHORIZE NODE</Text>
          <ArrowRight color="white" size={16} />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={Theme.primary} size="large" />
          <Text style={styles.loadingText}>AUTHORIZING CLEARANCE...</Text>
        </View>
      )}
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
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 32,
    paddingBottom: 100,
  },
  instruction: {
    fontSize: 10,
    color: Theme.muted,
    fontWeight: '700',
    marginBottom: 32,
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
    color: Theme.muted,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  registerBtn: {
    backgroundColor: '#000000',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 24,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#000000',
  }
});
