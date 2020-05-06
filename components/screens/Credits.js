import React, {useEffect, useState} from 'react';
import {Linking, SafeAreaView, StyleSheet, View} from 'react-native';
import {
  Appbar,
  DarkTheme,
  DefaultTheme,
  Provider as PaperProvider,
  Text,
} from 'react-native-paper';
import {SvgUri} from 'react-native-svg';
import withPreventDoubleClick from '../utils/withPreventDoubleClick';

const styles = StyleSheet.create({
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

const darkstyles = StyleSheet.create({
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

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#e33733',
    accent: '#f1c40f',
  },
  roundness: 20,
};

const darktheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#e33733',
    accent: '#f1c40f',
  },
  roundness: 20,
};

export default React.memo(function Credits({route, navigation}) {
  const [tH, setTh] = useState(theme);
  const [sT, setSt] = useState(styles);

  useEffect(() => {
    switchTheme(route.params.theme);
  }, [route.params.theme]);

  function switchTheme(t) {
    try {
      if (t === 'dark') {
        setTh(darktheme);
        setSt(darkstyles);
      } else {
        setTh(theme);
        setSt(styles);
      }
    } catch (e) {}
  }

  const AppbarBackActionDC = withPreventDoubleClick(Appbar.BackAction);

  return (
    <PaperProvider theme={tH}>
      <SafeAreaView style={sT.container}>
        <Appbar.Header style={{backgroundColor: sT.container.backgroundColor}}>
          <AppbarBackActionDC
            color="#e33733"
            onPress={() => {
              navigation.popToTop();
            }}
          />

          <Appbar.Content
            title={'BecauseOfProg'}
            color="#e33733"
            style={{flex: 1}}
          />
        </Appbar.Header>
        <View
          style={{
            flex: 1,
            marginTop: -50,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <SvgUri
            width={100}
            height={100}
            uri="https://cdn.becauseofprog.fr/v2/sites/becauseofprog.fr/assets/logos/bop.svg"
          />
          <Text
            style={{
              fontSize: 20,
              fontFamily: 'Roboto-Regular',
            }}>
            Réalisé par @kernoeb
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontFamily: 'Roboto-Regular',
            }}>
            Remerciements : @exybore, @gildas_gh
          </Text>
          <Text
            onPress={() => Linking.openURL('https://becauseofprog.fr')}
            style={{
              color: 'rgba(255,81,76,1)',
              marginTop: 10,
              fontSize: 15,
              fontFamily: 'monospace',
            }}>
            {' '}
            https://becauseofprog.fr
          </Text>
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
});
