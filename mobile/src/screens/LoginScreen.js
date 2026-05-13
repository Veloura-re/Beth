import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, StatusBar, KeyboardAvoidingView, Platform, Image, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Theme } from '../theme/theme';
import { login } from '../utils/api';
import { ArrowRight, RefreshCw, X, Wifi, WifiOff } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Input Required", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      const role = data.user.role;
      console.info(`[AUTH] Successful login. Finalized Role: ${role}`);

      navigation.replace('Dashboard');
    } catch (err) {
      setError({
        message: err.message,
        diagnostics: `TARGET: SUPABASE\nPROTOCOL: HTTPS`
      });
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
            <View style={styles.logoRow}>
              <Image
                source={require('../../assets/beth-logo.png')}
                style={styles.logoMark}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.headerSubtitle}>Sign In</Text>
                <Text style={styles.headerTitle}>BETH</Text>
              </View>
            </View>
            <View style={styles.structuralLine} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600).springify()} style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="hello@beth.com"
                placeholderTextColor="#A1887F66"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Your password"
                placeholderTextColor="#A1887F66"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error && (
              <Animated.View entering={FadeIn.duration(400)} style={styles.errorContainer}>
                <View style={styles.errorHeader}>
                  <WifiOff color="#C62E2E" size={16} />
                  <Text style={styles.errorTitle}>ACCESS DENIED</Text>
                  <TouchableOpacity onPress={() => setError(null)} style={styles.errorCloseBtn}>
                    <X color={Theme.muted} size={14} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.errorMessage}>{error.message}</Text>
                <View style={styles.diagnosticContainer}>
                  <Text style={styles.diagnosticLabel}>[DIAGNOSTICS]</Text>
                  <Text style={styles.diagnosticText}>{error.diagnostics}</Text>
                </View>
                <View style={styles.errorActions}>
                  <TouchableOpacity onPress={() => setError(null)} style={styles.dismissBtn}>
                    <Text style={styles.dismissBtnText}>GO BACK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleLogin} style={styles.retryBtn}>
                    <RefreshCw color="#FFFFFF" size={10} />
                    <Text style={styles.retryBtnText}>RETRY</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            <TouchableOpacity
              style={[styles.loginBtn, error && styles.loginBtnError]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Continue</Text>
                  <ArrowRight color="white" size={16} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
            >
               <Text style={styles.registerLinkText}>New here? Create an account.</Text>
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
    marginBottom: 48,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  logoMark: {
    width: 52,
    height: 52,
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
    borderRadius: Theme.radius,
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
    borderRadius: Theme.radius,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 8,
    fontWeight: '900',
    color: Theme.muted,
    letterSpacing: 2,
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
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FF000033',
    padding: 16,
    marginBottom: 24,
    borderRadius: Theme.radius,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  errorCloseBtn: {
    marginLeft: 'auto',
    padding: 2,
  },
  errorTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FF0000',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  errorMessage: {
    fontSize: 12,
    color: '#333333',
    lineHeight: 18,
    marginBottom: 12,
  },
  diagnosticContainer: {
    backgroundColor: '#00000008',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  diagnosticLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: Theme.muted,
    marginBottom: 4,
  },
  diagnosticText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: Theme.muted,
    opacity: 0.7,
  },
  dismissBtn: {
    paddingVertical: 8,
  },
  dismissBtnText: {
    fontSize: 9,
    fontWeight: '900',
    color: Theme.muted,
    letterSpacing: 2,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  retryBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
  },
  retryBtnText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  loginBtnError: {
    opacity: 0.5,
  }
});
