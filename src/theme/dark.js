import {DarkTheme} from 'react-native-paper';
import {StyleSheet} from 'react-native';

export const darkstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  item: {
    padding: 0,
  },
  scene: {
    flex: 1,
  },
  header: {
    backgroundColor: '#000',
  },
  onglets: {
    backgroundColor: '#121212',
  },
});

export const darktheme = {
  ...DarkTheme,
  mode: 'exact', // TODO Fix with RNP update
  colors: {
    ...DarkTheme.colors,
    primary: '#e33733',
    accent: '#ff514c',
  },
  roundness: 20,
};

export const darksb = '#000000';

export const dark_others = {
  text: '#f6f8fa',
  codeblockcolor: '#242424',
  links: '#e33733',
};
