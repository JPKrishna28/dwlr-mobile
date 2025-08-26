import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
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
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricItem: {
    width: '50%',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricValueBlue: {
    color: '#2563eb',
  },
  metricValueGreen: {
    color: '#059669',
  },
  metricValueOrange: {
    color: '#ea580c',
  },
  metricValueRed: {
    color: '#dc2626',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 8,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
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
  statusBadgeConnected: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeError: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeChecking: {
    backgroundColor: '#fef3c7',
  },
  scrollContent: {
    paddingVertical: 16,
  },
});
