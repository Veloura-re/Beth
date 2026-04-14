import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal,
  Dimensions
} from 'react-native';
import { Theme } from '../theme/theme';
import { 
  Menu, 
  LayoutDashboard, 
  Users, 
  QrCode, 
  Wallet, 
  ShieldAlert, 
  Shapes, 
  LogOut,
  UserPlus,
  Target,
  ChevronRight,
  X
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function Sidebar({ visible, onClose, navigation, currentRole, onLogout }) {
  const isAdmin = currentRole === 'ADMIN' || currentRole === 'SUPERADMIN';

  const menuItems = [
    { label: 'System Oversight', icon: LayoutDashboard, route: 'Dashboard', roles: ['ADMIN', 'SUPERADMIN', 'AGENT'] },
    { label: 'Personnel Registry', icon: UserPlus, route: 'Personnel', roles: ['ADMIN', 'SUPERADMIN'] },
    { label: 'System Directives', icon: Target, route: 'Campaigns', roles: ['ADMIN', 'SUPERADMIN'] },
    { label: 'Protocol Registry', icon: QrCode, route: 'Protocols', roles: ['ADMIN', 'SUPERADMIN'] },
    { label: 'Treasury Ledger', icon: Wallet, route: 'Treasury', roles: ['ADMIN', 'SUPERADMIN'] },
    { label: 'Scanner Protocol', icon: ShieldAlert, route: 'Scanner', roles: ['AGENT'] },
    { label: 'Value Registry', icon: Shapes, route: 'Rewards', roles: ['AGENT'] },
  ];

  const handleNavigate = (item) => {
    onClose();
    if (item.route === 'Personnel') {
      const targetRole = currentRole === 'SUPERADMIN' ? 'ADMIN' : 'AGENT';
      navigation.navigate('Personnel', { roleType: targetRole });
    } else {
      navigation.navigate(item.route);
    }
  };

  const hasAccess = (roles) => {
    if (roles.includes('ANY')) return true;
    return roles.includes(currentRole);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.dismissArea} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        
        <SafeAreaView style={styles.menuContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BETH.NAV</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color="black" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.sectionLabelContainer}>
               <Text style={styles.sectionLabel}>Operations</Text>
               <View style={styles.hLine} />
            </View>

            {menuItems.map((item, i) => {
              if (!hasAccess(item.roles)) return null;

              return (
                <TouchableOpacity 
                  key={i} 
                  style={styles.menuItem}
                  onPress={() => handleNavigate(item.route)}
                >
                  <View style={styles.iconWrapper}>
                    <item.icon color="black" size={18} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label.toUpperCase()}</Text>
                  <ChevronRight color={Theme.border} size={14} />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <LogOut color={Theme.muted} size={16} />
              <Text style={styles.logoutText}>TERMINATE SESSION</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
  },
  dismissArea: {
    flex: 1,
  },
  menuContainer: {
    width: width * 0.8,
    height: '100%',
    backgroundColor: Theme.background,
    borderLeftWidth: 1,
    borderLeftColor: Theme.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#000000',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 32,
  },
  sectionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
    textTransform: 'uppercase',
  },
  hLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  iconWrapper: {
    marginRight: 16,
    width: 32,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#000000',
  },
  footer: {
    padding: 32,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    color: Theme.muted,
  }
});
