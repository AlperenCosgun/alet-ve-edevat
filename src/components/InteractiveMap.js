import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Search, Compass, Filter } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// Initial Region: Kadikoy Moda (approx)
const INITIAL_REGION = {
  latitude: 40.985,
  longitude: 29.025,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function InteractiveMap({
  tools,
  onSelectTool,
  selectable = false,
  selectedCoords = null,
  onCoordsChange,
  selectedCategory,
  setSelectedCategory
}) {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredTool, setHoveredTool] = useState(null);

  const visibleTools = tools.filter(t => {
    if (t.status === 'borrowed') return false;
    if (selectedCategory !== 'Tümü' && t.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      return t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             t.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleMapPress = (e) => {
    if (!selectable || !onCoordsChange) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    onCoordsChange(latitude, longitude);
  };

  const getPinColor = (cat) => {
    switch (cat) {
      case 'Elektrikli': return '#F59E0B';
      case 'Bahçe': return '#10B981';
      case 'Marangozluk': return '#EA580C';
      case 'Tesisat': return '#0EA5E9';
      case 'Temizlik': return '#6366F1';
      case 'El Aletleri': return '#2EC4B6';
      default: return '#8B5CF6';
    }
  };

  const categories = ['Tümü', 'Elektrikli', 'Bahçe', 'Marangozluk', 'Tesisat', 'Temizlik', 'El Aletleri', 'Diğer'];

  // Map Style for Dark Mode
  const customMapStyle = isDark ? [
    {
      "elementType": "geometry",
      "stylers": [{"color": "#242f3e"}]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#746855"}]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{"color": "#242f3e"}]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#d59563"}]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#d59563"}]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{"color": "#263c3f"}]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#6b9a76"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{"color": "#38414e"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [{"color": "#212a37"}]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#9ca5b3"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{"color": "#746855"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{"color": "#1f2835"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#f3d19c"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#17263c"}]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#515c6d"}]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.stroke",
      "stylers": [{"color": "#17263c"}]
    }
  ] : [];

  return (
    <View style={{ flex: 1, borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: colors.gold }}>
      
      {/* Map Content */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={INITIAL_REGION}
        onPress={handleMapPress}
        customMapStyle={customMapStyle}
      >
        {selectable && selectedCoords && (
          <Marker coordinate={selectedCoords} pinColor={colors.teal} />
        )}
        
        {!selectable && visibleTools.map((tool) => {
          // Calculate dummy coords relative to initial region based on the percentage 0-100 logic from web
          // Web coords were 0-100 percentages. Map them to a lat/lng delta around Moda.
          // This is a naive translation of the mock data.
          // const lat = INITIAL_REGION.latitude + ((50 - tool.latitude) * 0.0005);
          // const lng = INITIAL_REGION.longitude + ((tool.longitude - 50) * 0.0005);

          const lat = tool.latitude
          const lng = tool.longitude

          return (
            <Marker
              key={tool.id}
              coordinate={{ latitude: lat, longitude: lng }}
              pinColor={tool.status === 'requested' ? colors.gold : getPinColor(tool.category)}
              title={tool.name}
              description={tool.ownerName}
              onPress={() => onSelectTool(tool)}
            />
          );
        })}
      </MapView>

      {/* Top Controls Overlay */}
      <View style={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 24, paddingHorizontal: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <Search color={colors.textMuted} size={20} />
          <TextInput
            placeholder="Haritada alet ara..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: colors.textPrimary, fontWeight: 'bold' }}
          />
        </View>

        <View style={{ flexDirection: 'row', overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: selectedCategory === cat ? colors.primary : colors.card,
                  borderWidth: 1,
                  borderColor: selectedCategory === cat ? colors.primary : colors.border,
                  shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
                }}
              >
                <Text style={{ color: selectedCategory === cat ? 'white' : colors.textPrimary, fontSize: 12, fontWeight: 'bold' }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom Info Overlay */}
      <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        {selectable ? (
          <View style={{ backgroundColor: colors.card, padding: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.teal, marginRight: 8 }} />
            <Text style={{ color: colors.textPrimary, fontWeight: 'bold', fontSize: 12 }}>
              {selectedCoords ? "Konum Seçildi." : "Haritaya tıklayarak konum işaretleyin."}
            </Text>
          </View>
        ) : (
          <View style={{ backgroundColor: colors.card, padding: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Compass color={colors.teal} size={20} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.textPrimary, fontWeight: 'bold', fontSize: 12 }}>
                Haritada <Text style={{ color: colors.primary }}>{visibleTools.length}</Text> müsait alet var.
              </Text>
            </View>
          </View>
        )}
      </View>

    </View>
  );
}
