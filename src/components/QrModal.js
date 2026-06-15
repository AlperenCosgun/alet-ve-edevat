import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Dimensions } from 'react-native';
import { QrCode, Scan, X, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { dbService } from '../lib/dbService';
import { useAuth } from '../contexts/AuthContext';

export default function QrModal({ visible, request, mode, onClose }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!visible || !request) return null;

  const isOwner = request.ownerId === user?.id;

  const handleSimulateScan = async () => {
    setLoading(true);
    try {
      if (mode === 'pickup') {
        await dbService.updateRequestStatus(request.id, 'received', user.id);
      } else if (mode === 'return') {
        await dbService.updateRequestStatus(request.id, 'returned', user.id);
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const codeToShow = mode === 'pickup' ? request.pickupQrCode : request.returnQrCode;
  
  // Who shows QR, who scans QR?
  // Pickup: Borrower shows QR, Owner scans. Wait, actually, let's just make it simple: 
  // It's a simulation, we just present a "Simulate Scan" button.

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{ backgroundColor: colors.card, width: '100%', borderRadius: 24, padding: 24, alignItems: 'center' }}>
          
          <TouchableOpacity 
            style={{ position: 'absolute', top: 16, right: 16, padding: 8, backgroundColor: colors.background, borderRadius: 20 }}
            onPress={onClose}
          >
            <X color={colors.textPrimary} size={20} />
          </TouchableOpacity>

          <View style={{ backgroundColor: mode === 'pickup' ? 'rgba(46,196,182,0.1)' : 'rgba(255,107,53,0.1)', padding: 16, borderRadius: 20, marginBottom: 16, marginTop: 16 }}>
            <Scan color={mode === 'pickup' ? colors.teal : colors.primary} size={32} />
          </View>

          <Text style={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>
            {mode === 'pickup' ? 'Teslim Alma QR Kodu' : 'İade QR Kodu'}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>
            Bu işlemi tamamlamak için diğer kullanıcının kodu okutması gerekmektedir. (Simülasyon için butona basınız)
          </Text>

          <View style={{ width: 200, height: 200, backgroundColor: 'white', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <QrCode color="#000" size={150} />
            <Text style={{ marginTop: 8, fontWeight: '900', letterSpacing: 2 }}>{codeToShow}</Text>
          </View>

          {success ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(46,196,182,0.1)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16 }}>
              <CheckCircle color={colors.teal} size={20} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.teal, fontWeight: '900' }}>İşlem Başarılı!</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, width: '100%', alignItems: 'center' }}
              onPress={handleSimulateScan}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Okutmayı Simüle Et</Text>}
            </TouchableOpacity>
          )}

        </View>
      </View>
    </Modal>
  );
}
