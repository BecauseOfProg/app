import {DefaultTheme} from 'react-native-paper';
import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  item: {
    padding: 0,
  },
  scene: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFF',
  },
  onglets: {
    backgroundColor: 'rgba(255,81,76,1)',
  },
});

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#e33733',
    accent: '#ff514c',
  },
  roundness: 20,
};

export const lightsb = '#edebeb';

export const light_others = {
  text: '#000',
  codeblockcolor: '#f6f8fa',
  links: '#242424',
};
