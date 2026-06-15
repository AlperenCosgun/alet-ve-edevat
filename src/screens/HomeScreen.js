import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { Plus } from 'lucide-react-native';
import { dbService } from '../lib/dbService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import InteractiveMap from '../components/InteractiveMap';
import ToolDetailCard from '../components/ToolDetailCard';
import AddToolModal from '../components/AddToolModal';

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [tools, setTools] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedTool, setSelectedTool] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const unsub = dbService.subscribeTools((data) => {
      setTools(data);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const handleRequestBorrow = async (tool) => {
    if (!user) return;
    await dbService.createBorrowRequest({
      toolId: tool.id,
      toolName: tool.name,
      toolImg: tool.imageUrl,
      ownerId: tool.ownerId,
      ownerName: tool.ownerName,
      borrowerId: user.id,
      borrowerName: user.name,
      status: 'pending'
    });
  };

  const handleDeleteTool = async (toolId) => {
    await dbService.deleteTool(toolId);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Map */}
      <View style={{ flex: 1, padding: 16, paddingTop: 48 }}>
        <InteractiveMap 
          tools={tools}
          onSelectTool={setSelectedTool}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </View>

      {/* Floating Action Button for Add Tool */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: colors.primary,
          shadowOpacity: 0.4,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 5
        }}
        onPress={() => setIsAddModalOpen(true)}
      >
        <Plus color="white" size={32} />
      </TouchableOpacity>

      {/* Tool Detail Modal (Bottom Sheet style) */}
      <Modal visible={!!selectedTool} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ height: Dimensions.get('window').height * 0.8 }}>
            {selectedTool && (
              <ToolDetailCard 
                tool={selectedTool}
                currentUser={user}
                onRequestBorrow={handleRequestBorrow}
                onDeleteTool={handleDeleteTool}
                onClose={() => setSelectedTool(null)}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Add Tool Modal */}
      <AddToolModal visible={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

    </View>
  );
}
