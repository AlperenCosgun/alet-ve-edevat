import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { User, Mail, MapPin, Hammer, Shield, Trash2, Send, Check, X } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function ToolDetailCard({
  tool,
  currentUser,
  onRequestBorrow,
  onDeleteTool,
  onClose
}) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const isMyTool = tool.ownerId === currentUser.id;

  const handleRequest = async () => {
    setLoading(true);
    try {
      await onRequestBorrow(tool);
      setRequestSent(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // In React Native, we'd use Alert.alert for confirm, but doing simple here
    setLoading(true);
    try {
      await onDeleteTool(tool.id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' }}>
      
      {/* Resim */}
      <View style={{ height: 180, width: '100%', backgroundColor: colors.border }}>
        <Image source={{ uri: tool.imageUrl }} style={{ width: '100%', height: '100%' }} />
        
        {/* Etiketler */}
        <View style={{ position: 'absolute', top: 16, left: 16, gap: 8 }}>
          <View style={{ backgroundColor: colors.teal, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>{tool.category}</Text>
          </View>
          <View style={{ backgroundColor: tool.status === 'available' ? colors.gold : colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: tool.status === 'available' ? '#2D3142' : 'white', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>
              {tool.status === 'available' ? 'Müsait' : 'Kullanımda'}
            </Text>
          </View>
        </View>

        {/* Kapat */}
        <TouchableOpacity 
          style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}
          onPress={onClose}
        >
          <X color="#2D3142" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary, marginBottom: 8 }}>{tool.name}</Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.textSecondary, marginBottom: 16, lineHeight: 18 }}>{tool.description}</Text>

        {/* Detay Grid */}
        <View style={{ backgroundColor: colors.background, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: colors.border, gap: 12, marginBottom: 16 }}>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <User color={colors.textMuted} size={16} />
            <Text style={{ color: colors.textMuted, fontWeight: '900', fontSize: 12, marginLeft: 8, flex: 1 }}>Paylaşan:</Text>
            <Text style={{ color: colors.textPrimary, fontWeight: '900', fontSize: 12 }}>{isMyTool ? 'Siz (Kendiniz)' : tool.ownerName}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Mail color={colors.textMuted} size={16} />
            <Text style={{ color: colors.textMuted, fontWeight: '900', fontSize: 12, marginLeft: 8, flex: 1 }}>E-Posta:</Text>
            <Text style={{ color: colors.textPrimary, fontWeight: '900', fontSize: 12 }} numberOfLines={1}>{tool.ownerEmail}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Hammer color={colors.textMuted} size={16} />
            <Text style={{ color: colors.textMuted, fontWeight: '900', fontSize: 12, marginLeft: 8, flex: 1 }}>Ödünç Sayısı:</Text>
            <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 12 }}>{tool.borrowCount} defa paylaşıldı</Text>
          </View>
        </View>

        {/* Güvence */}
        <View style={{ flexDirection: 'row', backgroundColor: 'rgba(46,196,182,0.1)', padding: 12, borderRadius: 16, marginBottom: 24 }}>
          <Shield color={colors.teal} size={20} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: 'bold', flex: 1, lineHeight: 14 }}>
            <Text style={{ fontWeight: '900' }}>Komşu Koruma Sistemi:</Text> Geri iade anında iki kullanıcı QR kodu okutarak alet teslimini onaylar.
          </Text>
        </View>

        {/* Butonlar */}
        {isMyTool ? (
          <TouchableOpacity 
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
            onPress={handleDelete}
            disabled={loading}
          >
            <Trash2 color="#EF4444" size={20} />
            <Text style={{ color: '#EF4444', fontWeight: '900', fontSize: 14, marginLeft: 8 }}>{loading ? 'Siliniyor...' : 'Aleti Listeden Kaldır'}</Text>
          </TouchableOpacity>
        ) : requestSent ? (
          <View style={{ backgroundColor: 'rgba(46,196,182,0.1)', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(46,196,182,0.2)' }}>
            <Check color={colors.teal} size={20} />
            <Text style={{ color: colors.teal, fontWeight: '900', fontSize: 14, marginLeft: 8 }}>Ödünç Talebiniz Gönderildi!</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={{ backgroundColor: tool.status === 'available' ? colors.primary : colors.background, padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
            onPress={handleRequest}
            disabled={loading || tool.status !== 'available'}
          >
            <Send color={tool.status === 'available' ? 'white' : colors.textMuted} size={20} />
            <Text style={{ color: tool.status === 'available' ? 'white' : colors.textMuted, fontWeight: '900', fontSize: 14, marginLeft: 8 }}>
              {tool.status === 'available' ? 'Komşudan Ödünç Al' : 'Alet Şu An Kullanımda'}
            </Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}
