import React, {useRef, useState, useEffect} from 'react';
import {
  Animated,
  Image,
  Linking,
  PanResponder,
  SafeAreaView,
  View,
} from 'react-native';
import {Appbar, Provider as PaperProvider, Text} from 'react-native-paper';
import {SvgUri} from 'react-native-svg';
import withPreventDoubleClick from '../utils/withPreventDoubleClick';
import {useSelector} from 'react-redux';
import * as Animatable from 'react-native-animatable';
import {getVersion, supportedAbis} from 'react-native-device-info';
import I18n from '../utils/i18n';

export default React.memo(function Credits({route, navigation}) {
  const stateTheme = useSelector((state) => state.theme);
  const [showEA, setEA] = useState(false);
  const [archs, setArchs] = useState([]);

  useEffect(() => {
    supportedAbis()
      .then((abis) => {
        setArchs(abis);
      })
      .catch(() => {});
  }, []);

  const AppbarBackActionDC = withPreventDoubleClick(Appbar.BackAction);

  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.moveY > 10 && gestureState.moveY <= 40) {
          setEA(true);
        } else {
          setEA(false);
        }
        return Animated.event([null, {dx: pan.x, dy: pan.y}], {
          useNativeDriver: false,
        })(evt, gestureState);
      },
      onPanResponderRelease: () => {
        setEA(false);
        Animated.spring(pan, {
          toValue: {x: 0, y: 0},
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

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
          <Animated.View
            style={{
              transform: [{translateX: pan.x}, {translateY: pan.y}],
            }}
            {...panResponder.panHandlers}>
            <Animatable.View
              animation="pulse"
              useNativeDriver={true}
              duration={2000}
              iterationCount="infinite">
              <SvgUri
                width={100}
                height={100}
                uri="https://cdn.becauseofprog.fr/v2/sites/becauseofprog.fr/assets/logos/bop.svg"
              />
            </Animatable.View>
          </Animated.View>
          {!showEA ? (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Roboto-Regular',
                }}>
                BecauseOfProg {getVersion()}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'Roboto-Regular',
                }}>
                {I18n.t('createdBy')}{' '}
                <Text
                  style={{
                    color: '#008abe',
                    textDecorationLine: 'underline',
                    fontWeight: 'bold',
                  }}
                  onPress={() =>
                    Linking.openURL(
                      'https://twitter.com/kop_of_tea',
                    ).catch(() => {})
                  }>
                  @kernoeb
                </Text>
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: 'Roboto-Regular',
                }}>
                {I18n.t('acknowledgements')}
              </Text>
              <Text
                onPress={() =>
                  Linking.openURL('https://becauseofprog.fr').catch(() => {})
                }
                style={{
                  color: 'rgba(255,81,76,1)',
                  marginTop: 10,
                  fontSize: 15,
                  fontFamily: 'monospace',
                  textDecorationLine: 'underline',
                  marginBottom: 10,
                }}>
                https://becauseofprog.fr
              </Text>
              {archs.map((v, i) => {
                return i < archs.length - 1 ? (
                  <Text style={{fontSize: 9}} key={i}>
                    {v},{' '}
                  </Text>
                ) : (
                  <Text style={{fontSize: 9}} key={i}>
                    {v}
                  </Text>
                );
              })}
            </View>
          ) : (
            <Image
              style={{width: 300, height: 300}}
              source={{
                uri: `https://cataas.com/cat?${Date.now()}`,
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
});
