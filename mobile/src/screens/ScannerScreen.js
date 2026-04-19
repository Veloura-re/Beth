import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Theme } from '../theme/theme';
import { ArrowLeft, ShieldCheck, X, Scan, QrCode } from 'lucide-react-native';
import { scanQRCode } from '../utils/api';

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      // Get current location for geo-verification
      let lat, lng;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = location.coords.latitude;
          lng = location.coords.longitude;
        }
      } catch (locError) {
        console.log('Location not available:', locError);
        // Continue without location - backend will handle it
      }

      const response = await scanQRCode(data, lat, lng);
      Alert.alert(
        "Verification Successful", 
        `IDENTIFIER: ${data.substring(0, 12)}...\nSTATUS: LOGGED\nREWARD: ${response.points} UNITS`,
        [{ text: "CONTINUE", onPress: () => {
          setScanned(false);
          setLoading(false);
        }}]
      );
    } catch (error) {
      Alert.alert("Verification Failed", error.message || "Invalid or unrecognized identifier.");
      setScanned(false);
      setLoading(false);
    }
  };

  if (!permission) return (
    <View style={[styles.container, styles.center]}>
      <ActivityIndicator color="black" />
    </View>
  );

  if (!permission.granted) return (
    <View style={[styles.container, styles.center]}>
      <Text style={styles.errorText}>CAMERA ACCESS REQUIRED FOR SCANNING.</Text>
      <TouchableOpacity style={styles.btn} onPress={requestPermission}>
        <Text style={styles.btnText}>GRANT PERMISSION</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <X color="white" size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerSub}>Technical Protocol</Text>
          <Text style={styles.headerTitle}>SCANNER.v1</Text>
        </View>
      </Animated.View>

      <View style={styles.scannerWrapper}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        
        {/* Architectural Overlay */}
        <Animated.View entering={FadeIn.delay(300)} style={styles.overlay}>
           <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {loading && (
                <View style={styles.loadingOverlay}>
                   <ActivityIndicator color="white" />
                   <Text style={styles.loadingText}>VERIFYING...</Text>
                </View>
              )}
           </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(400).springify()} style={styles.instructionBox}>
           <View style={styles.indicator} />
           <Text style={styles.instructionText}>
             ALIGN THE TECHNICAL IDENTIFIER WITHIN THE FRAME FOR REGISTRY VERIFICATION.
           </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 32,
    zIndex: 10,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  headerSub: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  scannerWrapper: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFFFFF',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  topRight: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
  },
  instructionBox: {
    position: 'absolute',
    bottom: 64,
    left: 32,
    right: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  indicator: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
  },
  instructionText: {
    flex: 1,
    color: 'white',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    lineHeight: 14,
  },
  errorText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 24,
  },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'white',
  },
  btnText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  }
});
