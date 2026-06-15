import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Wrench, Mail, Lock, User, LogIn, UserPlus, AlertCircle } from 'lucide-react-native';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const { colors, isDark } = useTheme();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email || !password || (!isLogin && !name)) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        
        {/* Header / Logo */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ 
            backgroundColor: colors.primary, 
            padding: 16, 
            borderRadius: 24, 
            marginBottom: 16,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 5
          }}>
            <Wrench color="white" size={40} />
          </View>
          <Text style={{ fontSize: 28, fontWeight: '900', color: colors.textPrimary, marginBottom: 8 }}>
            Circular<Text style={{ color: colors.primary }}>Share</Text>
          </Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.textSecondary, textAlign: 'center' }}>
            Komşuluk Ölmedi! İhtiyacın olan aleti satın alma, ödünç al.
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={{ flexDirection: 'row', backgroundColor: colors.card, borderRadius: 16, padding: 4, marginBottom: 24, borderWidth: 2, borderColor: colors.border }}>
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: isLogin ? colors.primary : 'transparent' }}
            onClick={() => {}} 
            onPress={() => { setIsLogin(true); setError(''); }}
          >
            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: isLogin ? 'white' : colors.textSecondary }}>Giriş Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: !isLogin ? colors.primary : 'transparent' }}
            onPress={() => { setIsLogin(false); setError(''); }}
          >
            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: !isLogin ? 'white' : colors.textSecondary }}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={{ backgroundColor: colors.card, padding: 24, borderRadius: 24, borderWidth: 2, borderColor: colors.border }}>
          
          {error ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 12, marginBottom: 16 }}>
              <AlertCircle color="#EF4444" size={20} style={{ marginRight: 8 }} />
              <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 12, flex: 1 }}>{error}</Text>
            </View>
          ) : null}

          {!isLogin && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '900', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>Ad Soyad</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderWidth: 2, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12 }}>
                <User color={colors.textMuted} size={20} />
                <TextInput 
                  value={name}
                  onChangeText={setName}
                  placeholder="Ahmet Yılmaz"
                  placeholderTextColor={colors.textMuted}
                  style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: colors.textPrimary, fontWeight: 'bold' }}
                />
              </View>
            </View>
          )}

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '900', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>E-Posta</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderWidth: 2, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12 }}>
              <Mail color={colors.textMuted} size={20} />
              <TextInput 
                value={email}
                onChangeText={setEmail}
                placeholder="ornek@mahalle.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: colors.textPrimary, fontWeight: 'bold' }}
              />
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 12, fontWeight: '900', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>Şifre</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderWidth: 2, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12 }}>
              <Lock color={colors.textMuted} size={20} />
              <TextInput 
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: colors.textPrimary, fontWeight: 'bold' }}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                {isLogin ? <LogIn color="white" size={20} style={{ marginRight: 8 }} /> : <UserPlus color="white" size={20} style={{ marginRight: 8 }} />}
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</Text>
              </>
            )}
          </TouchableOpacity>

        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
