import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { Theme } from '../theme/theme';
import { login } from '../utils/api';
import { ArrowRight, ShieldCheck } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Input Required", "Identifier and Access Key are mandatory.");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      const role = data.user.role;
      console.info(`[AUTH] Successful login. Finalized Role: ${role}`);

      if (role === 'AGENT') {
        navigation.replace('Scanner');
      } else {
        navigation.replace('Dashboard');
      }
    } catch (error) {
      const targetUrl = process.env.EXPO_PUBLIC_API_URL || 'UNKNOWN';
      Alert.alert(
        "Access Denied", 
        `${error.message}\n\n[DIAGNOSTICS]\nTARGET: ${targetUrl}\nPROTOCOL: HTTP\nPORT: 5000`,
        [{ text: "DISMISS" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View entering={FadeIn.duration(800)} style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.technicalHeader}>
            <View style={styles.technicalSubHeader}>
              <Text style={styles.versionLabel}>V 16.2.0</Text>
              <Text style={styles.versionLabel}>SECURE LINE</Text>
            </View>
            <Text style={styles.headerSubtitle}>Authorized Access</Text>
            <Text style={styles.headerTitle}>BETH.ARCH</Text>
            <View style={styles.structuralLine} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600).springify()} style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Identifier</Text>
              <TextInput
                style={styles.input}
                placeholder="operator@beth.arch"
                placeholderTextColor="#A1887F66"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Access Key</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#A1887F66"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Initialize Session</Text>
                  <ArrowRight color="white" size={16} />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(800)} style={styles.footer}>
            <Text style={styles.footerText}>Project: Beth REW</Text>
            <Text style={styles.footerText}>Loc: 00-HQ</Text>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
  },
  technicalHeader: {
    marginBottom: 64,
  },
  technicalSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  versionLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
    color: Theme.muted,
    opacity: 0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
    color: Theme.muted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 52,
    fontWeight: '200',
    color: '#000000',
    letterSpacing: -2,
    marginBottom: 16,
  },
  structuralLine: {
    height: 1,
    width: 64,
    backgroundColor: '#000000',
  },
  form: {
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
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: '#000000',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    flexDirection: 'row',
    gap: 24,
  },
  footerText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
    opacity: 0.4,
    textTransform: 'uppercase',
  }
});
