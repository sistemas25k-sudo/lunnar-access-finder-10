import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5e2884e4c1b84d58b788cbf8f7868689',
  appName: 'Painel Lunnar',
  webDir: 'dist',
  server: {
    url: 'https://5e2884e4-c1b8-4d58-b788-cbf8f7868689.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a'
    }
  }
};

export default config;