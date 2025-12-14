import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, UserPlus, ArrowLeft, Moon, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Title from '@/components/ui/Title';
import PlanetSymbol from '@/components/ui/PlanetSymbol';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, isDark, currentDayTheme } = useTheme();
  const { register, error, isLoading, clearError } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Invalid Password', 'Password must be at least 8 characters long');
      return;
    }
    
    try {
      await register(email, password, name);
      
      // Show confirmation message for email verification
      Alert.alert(
        'Registration Successful',
        'Please check your email to confirm your account before logging in.',
        [{ text: 'OK', onPress: () => router.replace('/auth') }]
      );
    } catch (error) {
      // Error is already handled in the store
      console.log('Registration failed');
    }
  };
  
  const handleBack = () => {
    router.back();
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={
            isDark
              ? ['#05050E', colors.background, colors.surface]
              : [colors.background, colors.surface2 || colors.surface, colors.background]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <Container withPattern>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={18} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={[styles.heroOrb, { backgroundColor: `${colors.secondary}12`, borderColor: colors.border }]}> 
            <PlanetSymbol planetId={currentDayTheme.planetId} size={64} variant="glowing" />
          </View>

          <Title
            title="Create account"
            subtitle="Start your planetary practice"
            align="center"
            size="large"
            style={styles.heroTitle}
          />

          <Card variant="elevated" style={styles.formContainer} withGradient>
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: `${colors.error}12`, borderColor: `${colors.error}30` }]}>
              <Text style={[styles.errorText, { color: colors.text }]} numberOfLines={3}>
                {error}
              </Text>
              <TouchableOpacity onPress={clearError}>
                <Text style={[styles.errorDismiss, { color: colors.text }]}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={[styles.inputContainer, { backgroundColor: colors.surface2 || colors.surface, borderColor: colors.border }]}>
            <UserPlus size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="name"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.surface2 || colors.surface, borderColor: colors.border }]}>
            <Mail size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
            />
          </View>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.surface2 || colors.surface, borderColor: colors.border }]}>
            <Lock size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password (min. 8 characters)"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
              autoComplete="new-password"
            />
          </View>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.surface2 || colors.surface, borderColor: colors.border }]}>
            <Lock size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textContentType="newPassword"
              autoComplete="new-password"
            />
          </View>
          
          <Button
            variant="primary"
            onPress={handleRegister}
            loading={isLoading}
            icon={<UserPlus size={18} color={colors.onPrimary} />}
            fullWidth
            style={styles.primaryButton}
          >
            Create Account
          </Button>
          </Card>

          <View style={styles.footer}>
            <Star size={16} color={colors.textSecondary} />
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              "As above, so below. As within, so without."
            </Text>
            <Moon size={16} color={colors.textSecondary} />
          </View>
        </View>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 18,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  backButtonText: {
    marginLeft: 8,
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 72,
    paddingBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOrb: {
    width: 112,
    height: 112,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  heroTitle: {
    marginBottom: 14,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 18,
    marginTop: 6,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  errorDismiss: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    height: 52,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
  },
  primaryButton: {
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});