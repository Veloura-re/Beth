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
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const data = await register(name, email, password, token);
      console.info(`[REGISTRY] New operator authorized: ${data.user?.role}`);
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert(
        "Registration Failed", 
        error.message || "Invalid or expired invite code.",
        [{ text: "Dismiss" }]
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
          <Text style={styles.headerSub}>Join Beth</Text>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.formCard}>
            <Text style={styles.instruction}>
              Fill in your details to create your account and join the team.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={Theme.muted + '66'}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                placeholderTextColor={Theme.muted + '66'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
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
              <Text style={styles.label}>INVITE CODE</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter code"
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
          <Text style={styles.registerBtnText}>CREATE ACCOUNT</Text>
          <ArrowRight color="white" size={16} />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={Theme.primary} size="large" />
          <Text style={styles.loadingText}>CREATING ACCOUNT...</Text>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 32,
    paddingBottom: 100,
  },
  instruction: {
    fontSize: 12,
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
    borderRadius: Theme.radius,
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 11,
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
    borderRadius: Theme.radius,
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
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
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#000000',
  }
});
