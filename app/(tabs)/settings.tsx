import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function SettingRow({
  icon,
  iconColor,
  label,
  value,
  hasToggle,
  toggleValue,
  onPress,
}: {
  icon: IoniconsName;
  iconColor: string;
  label: string;
  value?: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={hasToggle ? 1 : 0.7}>
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {hasToggle ? (
          <Switch
            value={toggleValue}
            trackColor={{ true: Colors.green, false: Colors.border }}
            thumbColor={Colors.text}
          />
        ) : (
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBox}>
              <Ionicons name="wallet-outline" size={18} color={Colors.green} />
            </View>
            <Text style={styles.logoText}>FinanceFlow</Text>
          </View>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color={Colors.text} />
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={32} color={Colors.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Alex Johnson</Text>
            <Text style={styles.profileEmail}>alex.johnson@email.com</Text>
          </View>
          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Text style={styles.groupLabel}>Account</Text>
        <View style={styles.settingsGroup}>
          <SettingRow icon="person-outline" iconColor={Colors.blue} label="Personal Info" />
          <View style={styles.divider} />
          <SettingRow icon="wallet-outline" iconColor={Colors.green} label="Payment Methods" />
          <View style={styles.divider} />
          <SettingRow icon="shield-checkmark-outline" iconColor={Colors.teal} label="Security" />
        </View>

        {/* Preferences */}
        <Text style={styles.groupLabel}>Preferences</Text>
        <View style={styles.settingsGroup}>
          <SettingRow icon="notifications-outline" iconColor={Colors.amber} label="Notifications" hasToggle toggleValue={true} />
          <View style={styles.divider} />
          <SettingRow icon="moon-outline" iconColor={Colors.blue} label="Dark Mode" hasToggle toggleValue={true} />
          <View style={styles.divider} />
          <SettingRow icon="language-outline" iconColor={Colors.teal} label="Currency" value="USD ($)" />
        </View>

        {/* Data */}
        <Text style={styles.groupLabel}>Data</Text>
        <View style={styles.settingsGroup}>
          <SettingRow icon="cloud-upload-outline" iconColor={Colors.green} label="Export Data" />
          <View style={styles.divider} />
          <SettingRow icon="refresh-outline" iconColor={Colors.amber} label="Sync Accounts" value="Just now" />
          <View style={styles.divider} />
          <SettingRow icon="trash-outline" iconColor={Colors.red} label="Delete All Data" />
        </View>

        {/* Subscription */}
        <Text style={styles.groupLabel}>Subscriptions</Text>
        <View style={styles.settingsGroup}>
          <SettingRow
            icon="repeat-outline"
            iconColor={Colors.teal}
            label="Manage Subscriptions"
            onPress={() => router.push('/subscriptions' as any)}
          />
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={20} color={Colors.red} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>FinanceFlow v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: { width: 34, height: 34, borderRadius: 8, backgroundColor: Colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.cardAlt, alignItems: 'center', justifyContent: 'center' },

  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginHorizontal: 20, marginBottom: 24, borderWidth: 1, borderColor: Colors.border, gap: 14 },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  profileName: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  profileEmail: { color: Colors.textMuted, fontSize: 13 },
  editProfileBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  editProfileText: { color: Colors.textSub, fontSize: 13, fontWeight: '600' },

  groupLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 8 },

  settingsGroup: { backgroundColor: Colors.card, borderRadius: 16, marginHorizontal: 20, marginBottom: 20, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { color: Colors.text, fontSize: 15, fontWeight: '500' },
  settingValue: { color: Colors.textMuted, fontSize: 14 },
  divider: { height: 1, backgroundColor: Colors.border + '66', marginLeft: 64 },

  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.red + '15', borderRadius: 14, borderWidth: 1, borderColor: Colors.red + '30', marginBottom: 16 },
  signOutText: { color: Colors.red, fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', color: Colors.textMuted, fontSize: 12 },
});
