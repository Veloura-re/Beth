import React, { useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as Print from 'expo-print';
import { X, Share2, ShieldCheck, Printer } from 'lucide-react-native';
import { Theme } from '../theme/theme';

const { width, height } = Dimensions.get('window');

export default function QRStickerModal({ visible, protocol, onClose }) {
  const viewShotRef = useRef();

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Beth Protocol Sticker',
        UTI: 'public.png',
      });
    } catch (error) {
      console.error('Sharing failed', error);
    }
  };

  const handlePrint = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      
      const htmlContent = `
        <html>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; padding: 0;">
            <img src="${uri}" style="width: 80%; height: auto;" />
          </body>
        </html>
      `;

      await Print.printAsync({
        html: htmlContent,
      });
    } catch (error) {
      console.error('Printing failed', error);
    }
  };

  if (!protocol) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>PROTOCOL STICKER</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color="black" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.stickerWrapper}>
            <ViewShot 
              ref={viewShotRef} 
              options={{ format: 'png', quality: 1.0 }}
              style={styles.stickerOuter}
            >
              <View style={styles.stickerInner}>
                <View style={styles.stickerHeader}>
                  <View style={styles.techInfo}>
                    <Text style={styles.companyName}>
                      {protocol.campaign?.organization?.name || 'BETH CORE SYSTEM'}
                    </Text>
                    <Text style={styles.protocolId}>ID: {protocol.id?.substring(0,12).toUpperCase()}</Text>
                  </View>
                  <ShieldCheck color="black" size={20} />
                </View>

                <View style={styles.qrContainer}>
                  <QRCode
                    value={protocol.id}
                    size={width * 0.55}
                    color="black"
                    backgroundColor="white"
                    quietZone={10}
                  />
                </View>

                <View style={styles.stickerFooter}>
                  <Text style={styles.locationName}>{protocol.locationName?.toUpperCase() || 'UNNAMED LOCATION'}</Text>
                  <Text style={styles.directiveName}>{protocol.campaign?.name || 'GENERIC DIRECTIVE'}</Text>
                  <View style={styles.footerLine} />
                  <Text style={styles.securityText}>BETH REWARDS // ENCRYPTED PROTOCOL v1</Text>
                </View>
              </View>
            </ViewShot>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Share2 color="white" size={20} />
              <Text style={styles.shareBtnText}>SHARE</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.shareBtn, styles.printBtn]} onPress={handlePrint}>
              <Printer color="white" size={20} />
              <Text style={styles.shareBtnText}>PRINT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.95,
    backgroundColor: '#FFFFFF',
    paddingBottom: 40,
  },
  header: {
    padding: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#000000',
  },
  closeBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
  },
  stickerWrapper: {
    padding: 32,
    alignItems: 'center',
  },
  stickerOuter: {
    padding: 2,
    backgroundColor: '#000000',
  },
  stickerInner: {
    width: width * 0.75,
    backgroundColor: '#FFFFFF',
    padding: 32,
  },
  stickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  techInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 4,
  },
  protocolId: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: Theme.muted,
  },
  qrContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stickerFooter: {
    alignItems: 'center',
  },
  locationName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  directiveName: {
    fontSize: 9,
    fontWeight: '600',
    color: Theme.muted,
    marginBottom: 16,
    textAlign: 'center',
  },
  footerLine: {
    width: 32,
    height: 1,
    backgroundColor: '#000000',
    marginBottom: 12,
  },
  securityText: {
    fontSize: 7,
    fontWeight: '900',
    color: Theme.muted,
    letterSpacing: 1,
  },
  shareBtn: {
    backgroundColor: '#000000',
    flex: 1,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  printBtn: {
    backgroundColor: Theme.muted,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    gap: 12,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  }
});
