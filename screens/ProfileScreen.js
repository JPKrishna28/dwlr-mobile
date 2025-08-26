import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [dbStats, setDbStats] = useState({
    totalReadings: 0,
    lastUpdate: null,
    dateRange: { earliest: null, latest: null },
  });
  const [loading, setLoading] = useState(true);

  // Test Supabase connection and fetch database statistics
  const checkConnectionAndStats = async () => {
    try {
      setLoading(true);
      setConnectionStatus('checking');

      // Test connection by fetching count
      const { count, error: countError } = await supabase
        .from('water_levels')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Connection error:', countError);
        setConnectionStatus('error');
        return;
      }

      // Fetch additional statistics
      const { data: statsData, error: statsError } = await supabase
        .from('water_levels')
        .select('timestamp')
        .order('timestamp', { ascending: true });

      if (statsError) {
        console.error('Stats error:', statsError);
        setConnectionStatus('error');
        return;
      }

      // Calculate statistics
      const totalReadings = count || 0;
      let dateRange = { earliest: null, latest: null };

      if (statsData && statsData.length > 0) {
        dateRange.earliest = new Date(statsData[0].timestamp);
        dateRange.latest = new Date(statsData[statsData.length - 1].timestamp);
      }

      setDbStats({
        totalReadings,
        lastUpdate: dateRange.latest,
        dateRange,
      });

      setConnectionStatus('connected');
    } catch (err) {
      console.error('Unexpected error:', err);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Test database connection
  const testConnection = async () => {
    Alert.alert(
      'Testing Connection',
      'Checking connection to Supabase database...',
      [{ text: 'OK' }]
    );
    await checkConnectionAndStats();
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleString();
  };

  useEffect(() => {
    checkConnectionAndStats();
  }, []);

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          text: 'Connected',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: '✓',
        };
      case 'error':
        return {
          text: 'Connection Error',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: '✗',
        };
      case 'checking':
        return {
          text: 'Checking...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: '⟳',
        };
      default:
        return {
          text: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: '?',
        };
    }
  };

  const statusInfo = getConnectionStatusInfo();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Settings & Info
        </Text>
        <Text style={styles.headerSubtitle}>
          System status and configuration
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Connection Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Database Connection
          </Text>
          
          <View style={styles.connectionStatus}>
            <View style={styles.connectionInfo}>
              <View style={[
                styles.statusBadge,
                connectionStatus === 'connected' ? styles.statusBadgeConnected :
                connectionStatus === 'error' ? styles.statusBadgeError : styles.statusBadgeChecking
              ]}>
                <Text style={[
                  styles.statusIcon,
                  connectionStatus === 'connected' ? styles.statusConnected :
                  connectionStatus === 'error' ? styles.statusError : styles.statusChecking
                ]}>
                  {statusInfo.icon}
                </Text>
              </View>
              <View style={styles.statusText}>
                <Text style={[
                  styles.statusTitle,
                  connectionStatus === 'connected' ? styles.statusConnected :
                  connectionStatus === 'error' ? styles.statusError : styles.statusChecking
                ]}>
                  {statusInfo.text}
                </Text>
                <Text style={styles.statusSubtitle}>
                  Supabase Database
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={testConnection}
            >
              <Text style={styles.testButtonText}>
                Test
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.urlText}>
            URL: https://ytogcvqzqnzjfnxyqqip.supabase.co
          </Text>
        </View>

        {/* Database Statistics */}
        {loading ? (
          <View style={[styles.card, styles.loadingCard]}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading statistics...</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Database Statistics
            </Text>

            <View style={styles.statsContainer}>
              {/* Total Readings */}
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Readings</Text>
                <Text style={styles.statValueBlue}>
                  {dbStats.totalReadings.toLocaleString()}
                </Text>
              </View>

              {/* Last Update */}
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Last Update</Text>
                <Text style={styles.statValue}>
                  {formatDate(dbStats.lastUpdate)}
                </Text>
              </View>

              {/* Data Range */}
              <View style={styles.statRowLast}>
                <Text style={styles.statLabel}>Data Range</Text>
                <View>
                  <Text style={styles.statValueSmall}>
                    From: {formatDate(dbStats.dateRange.earliest)}
                  </Text>
                  <Text style={styles.statValueSmall}>
                    To: {formatDate(dbStats.dateRange.latest)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* App Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            User Information
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Email</Text>
              <Text style={styles.statValue}>{user?.email || 'Not available'}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>User ID</Text>
              <Text style={styles.statValueSmall}>{user?.id || 'Not available'}</Text>
            </View>

            <View style={styles.statRowLast}>
              <Text style={styles.statLabel}>Login Status</Text>
              <Text style={styles.statValueGreen}>Authenticated</Text>
            </View>
          </View>
        </View>

        {/* App Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            App Information
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>App Name</Text>
              <Text style={styles.statValue}>Groundwater Insights</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Version</Text>
              <Text style={styles.statValue}>1.0.0</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Platform</Text>
              <Text style={styles.statValue}>React Native (Expo)</Text>
            </View>

            <View style={styles.statRowLast}>
              <Text style={styles.statLabel}>Real-time Updates</Text>
              <Text style={styles.statValueGreen}>Enabled</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Actions
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={checkConnectionAndStats}
          >
            <Text style={styles.actionButtonText}>
              Refresh Statistics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => Alert.alert('Info', 'Additional settings will be available in future updates')}
          >
            <Text style={styles.actionButtonText}>
              Advanced Settings (Coming Soon)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonDanger}
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Sign Out', 
                    style: 'destructive',
                    onPress: signOut
                  }
                ]
              );
            }}
          >
            <Text style={styles.actionButtonText}>
              🚪 Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Groundwater Insights v1.0.0
          </Text>
          <Text style={styles.footerSubtext}>
            Built with React Native, Expo, and Supabase
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    color: '#bfdbfe',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusBadgeConnected: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeError: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeChecking: {
    backgroundColor: '#fef3c7',
  },
  statusIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusConnected: {
    color: '#059669',
  },
  statusError: {
    color: '#dc2626',
  },
  statusChecking: {
    color: '#d97706',
  },
  testButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  testButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  urlText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingCard: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#6b7280',
  },
  statsContainer: {
    marginTop: 0,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    color: '#6b7280',
  },
  statValue: {
    fontWeight: '500',
    color: '#1f2937',
  },
  statValueBlue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
  },
  statValueGreen: {
    fontWeight: '500',
    color: '#059669',
  },
  statValueSmall: {
    fontSize: 14,
    color: '#374151',
  },
  actionButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonSecondary: {
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonDanger: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
  },
  footerText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
  footerSubtext: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
});

export default ProfileScreen;
