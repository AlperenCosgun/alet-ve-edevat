import React, { useState } from 'react';
import * as Location from 'expo-location'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Camera, MapPin, X, Save } from 'lucide-react-native';
import { dbService } from '../lib/dbService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const CATEGORIES = ['Elektrikli', 'Bahçe', 'Marangozluk', 'Tesisat', 'Temizlik', 'El Aletleri', 'Diğer'];



export default function AddToolModal({ visible, onClose }) {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'El Aletleri',
    description: '',
    imageUrl: ''
  });

  if (!visible) return null;
  const getLocation = async () => {
  try {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "İzin Gerekli",
        "Konum izni vermeniz gerekiyor."
      );
      return null;
    }

    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  } catch (error) {
    console.error("Konum hatası:", error);
    return null;
  }
};
  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.imageUrl) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    
    

    setLoading(true);
    try {
      const location = await getLocation();

      if (!location?.coords) {
        return;
      }

      console.log("Lat: ", location.coords.latitude)
      console.log("Long: ", location.coords.longitude)

      await dbService.addTool({
        name: formData.name,
        category: formData.category,
        description: formData.description,
        imageUrl: formData.imageUrl,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        ownerId: user.id,
        ownerName: user.name,
        ownerEmail: user.email,
        status: 'available'
      });
      
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Alet eklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, height: Dimensions.get('window').height * 0.85 }}>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary }}>Yeni Alet Ekle</Text>
            <TouchableOpacity onPress={onClose} style={{ backgroundColor: colors.card, padding: 8, borderRadius: 20 }}>
              <X color={colors.textPrimary} size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 24 }}>
            
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '900', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' }}>Aletin Adı</Text>
              <TextInput 
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Örn: Bosch Darbeli Matkap"
                placeholderTextColor={colors.textMuted}
                style={{ backgroundColor: colors.inputBg, borderWidth: 2, borderColor: colors.border, borderRadius: 12, padding: 16, color: colors.textPrimary, fontWeight: 'bold' }}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '900', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' }}>Kategori</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setFormData(prev => ({ ...prev, category: cat }))}
                    style={{ 
                      paddingHorizontal: 16, 
                      paddingVertical: 10, 
                      borderRadius: 12, 
                      marginRight: 8,
                      backgroundColor: formData.category === cat ? colors.teal : colors.card,
                      borderWidth: 2,
                      borderColor: formData.category === cat ? colors.teal : colors.border
                    }}
                  >
                    <Text style={{ color: formData.category === cat ? 'white' : colors.textPrimary, fontWeight: 'bold' }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '900', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' }}>Açıklama & Kurallar</Text>
              <TextInput 
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Aletin durumu, kullanım şartları..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                style={{ backgroundColor: colors.inputBg, borderWidth: 2, borderColor: colors.border, borderRadius: 12, padding: 16, color: colors.textPrimary, fontWeight: 'bold', height: 100, textAlignVertical: 'top' }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 12, fontWeight: '900', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' }}>Görsel URL</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderWidth: 2, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16 }}>
                <Camera color={colors.textMuted} size={20} />
                <TextInput 
                  value={formData.imageUrl}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, imageUrl: text }))}
                  placeholder="https://..."
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, color: colors.textPrimary, fontWeight: 'bold' }}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 40 }}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Save color="white" size={20} style={{ marginRight: 8 }} />}
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>{!loading && 'Aleti Paylaşıma Aç'}</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
