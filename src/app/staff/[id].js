// app/staff/[id].js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeftIcon, 
  EditIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  UserFriendsIcon, 
  CalendarIcon 
} from '../../components/Icons';
import { COLORS } from '../../constants/colors';

export default function MemberDetail() {
  const router = useRouter();
  const { memberData } = useLocalSearchParams();
  const member = JSON.parse(memberData || '{}');
  
  const handleEdit = () => {
    router.push({
      pathname: '/staff/edit-member',
      params: { memberData: JSON.stringify(member) }
    });
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeftIcon size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalles</Text>
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: COLORS.primary }]}
          onPress={handleEdit}
        >
          <EditIcon size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileSection}>
        <LinearGradient
          colors={[`${COLORS.primary}20`, COLORS.background]}
          style={styles.profileGradient}
        >
          <View style={styles.profileImageContainer}>
            <View style={[styles.profileImageGlow, { backgroundColor: COLORS.primary }]} />
            <Image 
              source={{ uri: member.image }} 
              style={styles.profileImage} 
            />
          </View>
          
          <Text style={styles.profileName}>{member.name}</Text>
          <Text style={styles.profilePosition}>{member.position}</Text>
        </LinearGradient>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Información de contacto</Text>
        
        <View style={styles.infoCard}>
          <LinearGradient
            colors={[COLORS.card, '#252525']}
            style={styles.cardGradient}
          >
            <View style={styles.infoItem}>
              <View style={[styles.infoIconContainer, { backgroundColor: `${COLORS.info}20` }]}>
                <PhoneIcon size={20} color={COLORS.info} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{member.phone || '-'}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        <View style={styles.infoCard}>
          <LinearGradient
            colors={[COLORS.card, '#252525']}
            style={styles.cardGradient}
          >
            <View style={styles.infoItem}>
              <View style={[styles.infoIconContainer, { backgroundColor: `${COLORS.primary}20` }]}>
                <EnvelopeIcon size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Correo electrónico</Text>
                <Text style={styles.infoValue}>{member.email || '-'}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Información adicional</Text>
        
        <View style={styles.infoCard}>
          <LinearGradient
            colors={[COLORS.card, '#252525']}
            style={styles.cardGradient}
          >
            <View style={styles.infoItem}>
              <View style={[styles.infoIconContainer, { backgroundColor: `${COLORS.success}20` }]}>
                <UserFriendsIcon size={20} color={COLORS.success} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Experiencia</Text>
                <Text style={styles.infoValue}>5 años</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        <View style={styles.infoCard}>
          <LinearGradient
            colors={[COLORS.card, '#252525']}
            style={styles.cardGradient}
          >
            <View style={styles.infoItem}>
              <View style={[styles.infoIconContainer, { backgroundColor: `${COLORS.warning}20` }]}>
                <CalendarIcon size={20} color={COLORS.warning} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Fecha de incorporación</Text>
                <Text style={styles.infoValue}>01/01/2023</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileGradient: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImageGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
    transform: [{ scale: 1.1 }],
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profilePosition: {
    color: COLORS.primary,
    fontSize: 16,
  },
  infoSection: {
    padding: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 12,
    padding: 1, // Borde gradiente
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 11,
    padding: 16,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
});