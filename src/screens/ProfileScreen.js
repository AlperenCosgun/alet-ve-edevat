import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, User as UserIcon, Moon, Sun, Hammer } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ padding: 24, paddingTop: 60, backgroundColor: colors.card, borderBottomWidth: 2, borderBottomColor: colors.border }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.textPrimary }}>Profilim</Text>
      </View>

      <View style={{ padding: 24, alignItems: 'center' }}>
        <View style={{ 
          width: 100, 
          height: 100, 
          borderRadius: 50, 
          backgroundColor: colors.teal, 
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: 16,
          borderWidth: 4,
          borderColor: colors.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5
        }}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={{ width: 92, height: 92, borderRadius: 46 }} />
          ) : (
            <UserIcon color="white" size={40} />
          )}
        </View>

        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.textPrimary, marginBottom: 4 }}>{user?.name}</Text>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.textSecondary, marginBottom: 24 }}>{user?.email}</Text>

        <View style={{ flexDirection: 'row', backgroundColor: colors.card, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: colors.border, width: '100%', marginBottom: 24, alignItems: 'center', justifyContent: 'center' }}>
          <Hammer color={colors.primary} size={24} style={{ marginRight: 12 }} />
          <View>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.textSecondary, textTransform: 'uppercase' }}>Başarılı İşlem</Text>
            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.primary }}>{user?.borrowCount || 0} Paylaşım</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: colors.border, width: '100%', marginBottom: 12 }}
          onPress={toggleTheme}
        >
          {theme === 'dark' ? <Sun color={colors.gold} size={24} /> : <Moon color={colors.textPrimary} size={24} />}
          <Text style={{ marginLeft: 16, fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>
            {theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.1)', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: 'rgba(239,68,68,0.2)', width: '100%' }}
          onPress={logout}
        >
          <LogOut color="#EF4444" size={24} />
          <Text style={{ marginLeft: 16, fontSize: 16, fontWeight: 'bold', color: '#EF4444' }}>Çıkış Yap</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}
