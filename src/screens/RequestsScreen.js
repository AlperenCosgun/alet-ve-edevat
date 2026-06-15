import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Inbox, Send, Check, X, QrCode, Clock, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { dbService } from '../lib/dbService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import QrModal from '../components/QrModal';

export default function RequestsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [requests, setRequests] = useState([]);
  const [tools, setTools] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  
  // Qr Modal State
  const [qrModalData, setQrModalData] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsubReq = dbService.subscribeRequests(user.id, setRequests);
    const unsubTools = dbService.subscribeTools(setTools);
    
    return () => {
      if (typeof unsubReq === 'function') unsubReq();
      if (typeof unsubTools === 'function') unsubTools();
    };
  }, [user]);

  const incomingRequests = requests.filter(r => r.ownerId === user?.id);
  const outgoingRequests = requests.filter(r => r.borrowerId === user?.id);

  const handleAccept = async (reqId) => {
    setLoadingId(reqId);
    try {
      await dbService.updateRequestStatus(reqId, 'approved', user.id);
    } catch (e) { console.error(e); } finally { setLoadingId(null); }
  };

  const handleReject = async (reqId) => {
    setLoadingId(reqId);
    try {
      await dbService.updateRequestStatus(reqId, 'rejected', user.id);
    } catch (e) { console.error(e); } finally { setLoadingId(null); }
  };

  const getOwnerName = (req) => {
    const tool = tools.find(t => t.id === req.toolId);
    return tool?.ownerName || req.ownerId;
  };

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'pending': return (
        <View style={{ backgroundColor: 'rgba(255,191,105,0.12)', borderColor: 'rgba(255,191,105,0.25)', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
          <Clock color={colors.primary} size={12} style={{ marginRight: 4 }} />
          <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '900' }}>ONAY BEKLİYOR</Text>
        </View>
      );
      case 'approved': return (
        <View style={{ backgroundColor: 'rgba(46,196,182,0.1)', borderColor: 'rgba(46,196,182,0.2)', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ color: colors.teal, fontSize: 10, fontWeight: '900' }}>ONAYLANDI - QR HAZIR</Text>
        </View>
      );
      case 'received': return (
        <View style={{ backgroundColor: 'rgba(46,196,182,0.15)', borderColor: 'rgba(46,196,182,0.25)', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ color: colors.teal, fontSize: 10, fontWeight: '900' }}>AKTİF ÖDÜNÇTE</Text>
        </View>
      );
      case 'returned': return (
        <View style={{ backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '900' }}>✓ TESLİM EDİLDİ</Text>
        </View>
      );
      case 'rejected': return (
        <View style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: '900' }}>REDDEDİLDİ</Text>
        </View>
      );
      default: return null;
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingTop: 48, paddingBottom: 100 }}>
      
      {/* GELEN TALEPLER */}
      <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 2, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ backgroundColor: 'rgba(46,196,182,0.12)', padding: 8, borderRadius: 12, marginRight: 12 }}>
            <Inbox color={colors.teal} size={24} />
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '900', color: colors.textPrimary }}>GELEN ÖDÜNÇ TALEPLERİ</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.textSecondary }}>Komşularınızın başvuruları</Text>
          </View>
        </View>

        {incomingRequests.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background, borderRadius: 16, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' }}>
            <ArrowDownLeft color={colors.borderStrong} size={32} style={{ marginBottom: 8 }} />
            <Text style={{ color: colors.textSecondary, fontWeight: '900', fontSize: 12 }}>Henüz Talep Yok</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {incomingRequests.map(req => (
              <View key={req.id} style={{ backgroundColor: colors.background, padding: 12, borderRadius: 16, borderWidth: 2, borderColor: colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Image source={{ uri: req.toolImg }} style={{ width: 48, height: 48, borderRadius: 12, borderWidth: 2, borderColor: colors.border, marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: colors.textPrimary }}>{req.toolName}</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.textSecondary }}>İsteyen: <Text style={{ color: colors.teal }}>{req.borrowerName}</Text></Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StatusBadge status={req.status} />
                  
                  {req.status === 'pending' && (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity 
                        onPress={() => handleReject(req.id)}
                        style={{ backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}
                      >
                        <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: '900' }}>Reddet</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleAccept(req.id)}
                        style={{ backgroundColor: colors.teal, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}
                      >
                        <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>Onayla</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* GİDEN TALEPLER */}
      <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, borderWidth: 2, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ backgroundColor: 'rgba(255,107,53,0.12)', padding: 8, borderRadius: 12, marginRight: 12 }}>
            <Send color={colors.primary} size={24} />
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '900', color: colors.textPrimary }}>BENİM TALEPLERİM</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.textSecondary }}>Gönderdiğiniz başvurular</Text>
          </View>
        </View>

        {outgoingRequests.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background, borderRadius: 16, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' }}>
            <ArrowUpRight color={colors.borderStrong} size={32} style={{ marginBottom: 8 }} />
            <Text style={{ color: colors.textSecondary, fontWeight: '900', fontSize: 12 }}>Ödünç Talebiniz Yok</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {outgoingRequests.map(req => (
              <View key={req.id} style={{ backgroundColor: colors.background, padding: 12, borderRadius: 16, borderWidth: 2, borderColor: colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Image source={{ uri: req.toolImg }} style={{ width: 48, height: 48, borderRadius: 12, borderWidth: 2, borderColor: colors.border, marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: colors.textPrimary }}>{req.toolName}</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.textSecondary }}>Sahibi: <Text style={{ color: colors.primary }}>{getOwnerName(req)}</Text></Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StatusBadge status={req.status} />
                  
                  {req.status === 'approved' && (
                    <TouchableOpacity 
                      onPress={() => setQrModalData({ request: req, mode: 'pickup' })}
                      style={{ backgroundColor: colors.teal, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
                    >
                      <QrCode color="white" size={12} style={{ marginRight: 4 }} />
                      <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>Teslim Al</Text>
                    </TouchableOpacity>
                  )}

                  {req.status === 'received' && (
                    <TouchableOpacity 
                      onPress={() => setQrModalData({ request: req, mode: 'return' })}
                      style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
                    >
                      <QrCode color="white" size={12} style={{ marginRight: 4 }} />
                      <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>İade Et</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* QR Modal */}
      <QrModal 
        visible={!!qrModalData} 
        request={qrModalData?.request} 
        mode={qrModalData?.mode} 
        onClose={() => setQrModalData(null)} 
      />

    </ScrollView>
  );
}
