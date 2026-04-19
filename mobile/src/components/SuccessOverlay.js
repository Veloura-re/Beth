import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  ZoomInDown, 
  ZoomOutUp
} from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';
import { Theme } from '../theme/theme';

const { width, height } = Dimensions.get('window');

export default function SuccessOverlay({ visible, message, onClose }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.container}>
        <Animated.View 
          entering={FadeIn.duration(300)} 
          exiting={FadeOut.duration(300)}
          style={styles.backdrop} 
        />
        <Animated.View 
          entering={ZoomInDown.duration(600).springify()}
          exiting={ZoomOutUp.duration(400)}
          style={styles.content}
        >
          <View style={styles.iconContainer}>
            <CheckCircle2 color="white" size={48} strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>ACTION SUCCESSFUL</Text>
          <Text style={styles.message}>{message?.toUpperCase() || 'DATA REGISTRY SYNCHRONIZED'}</Text>
          <View style={styles.line} />
          <Text style={styles.subtext}>BETH.ARCH // SYSTEM LOG: 200 OK</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  content: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.border,
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
    color: Theme.muted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 24,
    fontWeight: '200',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 32,
  },
  line: {
    width: 48,
    height: 1,
    backgroundColor: '#000000',
    marginBottom: 16,
  },
  subtext: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
    opacity: 0.5,
  }
});
