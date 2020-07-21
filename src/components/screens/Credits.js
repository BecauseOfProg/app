import React from 'react';
import {Linking, SafeAreaView, View} from 'react-native';
import {Appbar, Provider as PaperProvider, Text} from 'react-native-paper';
import {SvgUri} from 'react-native-svg';
import withPreventDoubleClick from '../utils/withPreventDoubleClick';
import {useSelector} from 'react-redux';

export default React.memo(function Credits({route, navigation}) {
  const stateTheme = useSelector((state) => state.theme);

  const AppbarBackActionDC = withPreventDoubleClick(Appbar.BackAction);

  return (
    <PaperProvider theme={stateTheme.theme}>
      <SafeAreaView style={stateTheme.styles.container}>
        <Appbar.Header
          style={{
            backgroundColor: stateTheme.styles.container.backgroundColor,
          }}>
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
