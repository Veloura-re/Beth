import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Theme } from '../theme/theme';
import { X, Zap } from 'lucide-react-native';

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    
    // In a real app, we would call the API here
    Alert.alert(
      "QR Detected",
      `ID: ${data}\nProcessing scan...`,
      [
        { 
          text: "OK", 
          onPress: () => {
            setScanned(false);
            navigation.navigate('Dashboard');
          } 
        }
      ]
    );
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <X color="white" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan QR Code</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.scanAreaContainer}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              {scanned && <Text style={styles.processingText}>Processing...</Text>}
            </View>
          </View>

          <View style={styles.footer}>
            <Zap color={Theme.primary} size={32} style={{ marginBottom: 12 }} />
            <Text style={styles.footerText}>Place the QR code inside the frame</Text>
            <Text style={styles.footerSubtext}>Points will be added to your balance automatically</Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanAreaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 0,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Theme.primary,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  footerSubtext: {
    color: Theme.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  text: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: Theme.primary,
    padding: 16,
    borderRadius: Theme.radius,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  processingText: {
    color: Theme.primary,
    fontWeight: 'bold',
    fontSize: 20,
    position: 'absolute',
    top: '40%',
    left: '20%',
  }
});
