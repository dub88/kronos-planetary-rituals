import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, LogIn, Moon, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Title from '@/components/ui/Title';
import PlanetSymbol from '@/components/ui/PlanetSymbol';
import KronosLogo from '@/components/KronosLogo';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, currentDayTheme, isDark } = useTheme();
  const { login, enterGuestMode, error, isLoading, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }
    
    try {
      await login(email, password);
      // If we get here, login was successful
      router.replace('/');
    } catch (error) {
      // Error is already handled in the store
      console.log('Login failed');
    }
  };
  
  const handleRegister = () => {
    router.push('/auth/register');
  };

  const handleContinueAsGuest = () => {
    enterGuestMode();
    router.replace('/');
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
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <KronosLogo size={44} />
            <View style={styles.brandText}>
              <Text style={[styles.brandTitle, { color: colors.text }]}>Kronos</Text>
              <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
                Day of {currentDayTheme.name}
              </Text>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={[styles.heroOrb, { backgroundColor: `${colors.primary}16`, borderColor: colors.border }]}>
              <PlanetSymbol planetId={currentDayTheme.planetId} size={64} variant="glowing" />
            </View>

            <Title
              title="Welcome back"
              subtitle="Sign in to continue your planetary practice"
              align="center"
              size="large"
              style={styles.heroTitle}
            />
          </View>

          <Card variant="elevated" style={styles.formContainer} withGradient>
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: `${colors.error}12`, borderColor: `${colors.error}30` }]}>
                <Text style={[styles.errorText, { color: colors.text }]} numberOfLines={3}>
                  {error}
                </Text>
                <TouchableOpacity onPress={clearError}>
                  <Text style={[styles.errorDismiss, { color: colors.primary }]}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface2 || colors.surface }]}> 
              <Mail size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
              />
            </View>
            
            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface2 || colors.surface }]}> 
              <Lock size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="password"
                autoComplete="password"
              />
            </View>
            
            <Button
              variant="primary"
              onPress={handleLogin}
              loading={isLoading}
              icon={<LogIn size={18} color={colors.onPrimary} />}
              style={styles.primaryButton}
              fullWidth
            >
              Sign In
            </Button>
            
            <Button
              variant="outline"
              onPress={handleRegister}
              style={styles.secondaryButton}
              fullWidth
            >
              Create an Account
            </Button>

            <Button
              variant="ghost"
              onPress={handleContinueAsGuest}
              style={styles.guestButton}
              fullWidth
            >
              Continue as Guest
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
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 18,
  },
  brandText: {
    alignItems: 'flex-start',
  },
  brandTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.2,
  },
  brandSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 18,
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
    marginTop: 2,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 10,
    padding: 18,
  },
  errorContainer: {
    padding: 12,
    marginBottom: 14,
    borderRadius: 12,
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
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 14,
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
  secondaryButton: {
    marginTop: 10,
  },
  guestButton: {
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});