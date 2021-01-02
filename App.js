import * as React from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';
import SplashScreen from 'react-native-splash-screen';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import AsyncStorage from '@react-native-community/async-storage';
import withPreventDoubleClick from './src/components/utils/withPreventDoubleClick';
import {
  Appbar,
  Banner,
  Divider,
  Menu,
  Provider as PaperProvider,
  Searchbar,
  Snackbar,
  Text,
} from 'react-native-paper';

import changeNavigationBarColor from 'react-native-navigation-bar-color';

import {TabBar, TabView} from 'react-native-tab-view';

import MyWebComponent from './src/components/views/articleView';
import Categories from './src/components/views/Categories';
import Search from './src/components/screens/Search';
import Credits from './src/components/screens/Credits';
import Settings from './src/components/screens/Settings';

import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';

import {
  Dimensions,
  Linking,
  SafeAreaView,
  StatusBar,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';

import {SvgUri} from 'react-native-svg';
import {getVersion, supportedAbis} from 'react-native-device-info';
import compareVersions from 'compare-versions';

import {Provider as StateProvider, useDispatch, useSelector} from 'react-redux';
import store from './src/redux/store';

import {changeTheme, readArticles} from './src/redux/reducer';

import I18n from './src/components/utils/i18n';

import config from './configuration.json';

function Main({navigation, route}) {
  const [searchBar, setSearchBar] = useState(false);
  const [query, setQuery] = useState('');
  const [menu, setMenu] = useState(false);
  const [snackbar, setSB] = useState(false);
  const [snackbarcache, setSBCache] = useState(false);
  const [snackbarcachearticle, setSBCacheArticle] = useState(false);

  const stateTheme = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  const [index, setIndex] = useState(0);

  const [banner, setBanner] = useState(false);
  const [bannerUpdate, setBannerUpdate] = useState(false);

  const [archs, setArchs] = useState([]);
  const [newVersion, setNewVersion] = useState(null);

  const [refresh, setRefresh] = useState(false);

  const sb = useRef(null);

  // UPDATES
  useEffect(() => {
    AsyncStorage.getItem('@readArticles')
      .then((b) => {
        if (b == null || b) {
          dispatch(readArticles(JSON.parse(b)));
        }
      })
      .catch(() => {});

    AsyncStorage.getItem('@lang')
      .then((b) => {
        if (b !== null && b !== undefined) {
          I18n.locale = b;
          setRefresh((r) => !r);
        }
      })
      .catch(() => {});

    supportedAbis()
      .then((abis) => {
        setArchs(abis);
      })
      .catch(() => {});

    fetch(config.cdn + '/sites/becauseofprog.fr/app/output-metadata.json')
      .then((response) => response.json())
      .then((responseData) => {
        try {
          if (
            compareVersions.compare(
              responseData.elements[0].versionName,
              getVersion(),
              '>',
            )
          ) {
            setNewVersion(responseData.elements[0].versionName);
            setBannerUpdate(true);
          }
        } catch (e) {
          setBannerUpdate(false);
        }
      })
      .catch(() => {
        setBannerUpdate(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (route.params?.err) {
      showErrorArticle();
    }
  }, [route.params]);

  useEffect(() => {
    if (snackbar) {
      setTimeout(() => {
        let theme_light = 'light';
        let theme_dark = 'dark';
        if (stateTheme.t === theme_dark) {
          AsyncStorage.setItem('@theme', theme_light)
            .then(() => {
              dispatch(changeTheme(theme_light));
            })
            .catch(() => {});
        } else {
          AsyncStorage.setItem('@theme', theme_dark)
            .then(() => {
              dispatch(changeTheme(theme_dark));
            })
            .catch(() => {});
        }
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snackbar]);

  useEffect(() => {
    try {
      AsyncStorage.getItem('@theme').then((v) => {
        if (v === null) {
          AsyncStorage.setItem('@theme', 'light')
            .then(() => {
              dispatch(changeTheme('light'));
            })
            .catch(() => {});
        } else {
          dispatch(changeTheme(v));
        }
      });
    } catch (e) {
      SplashScreen.hide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function closeAllBanners() {
    setBanner(false);
  }

  const closeBanners = useCallback(() => {
    closeAllBanners();
  }, []);

  // Categories - Title
  const [routes] = useState([
    {key: 'global', title: 'Global'},
    {key: 'software', title: 'Software'},
    {key: 'web', title: 'Web'},
    {key: 'hardware', title: 'Hardware'},
    {key: 'programming', title: 'Prog'},
    {key: 'android', title: 'Android'},
    {key: 'linux', title: 'Linux'},
    {key: 'windows', title: 'Windows'},
    {key: 'apple', title: 'Apple'},
  ]);

  // ROUTES - Categories
  const renderScene = ({route, jumpTo}) => {
    if (Math.abs(index - routes.indexOf(route)) > 2) {
      return <View />;
    }
    return (
      <Categories
        navigation={navigation}
        categoryTitle={route.key}
        banner={banner}
        closeAllBanners={closeBanners}
        stateTheme={stateTheme}
        jumpTo={jumpTo}
      />
    );
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      scrollEnabled={true}
      tabStyle={{width: 'auto'}}
      bounces={false}
      indicatorStyle={{backgroundColor: 'white'}}
      style={stateTheme.styles.onglets}
      renderLabel={({route, focused, color}) => (
        <Text
          style={{
            fontFamily: 'Roboto-Regular',
            color: 'white',
            textTransform: 'uppercase',
          }}>
          {route.title}
        </Text>
      )}
    />
  );

  useEffect(() => {
    if (searchBar && sb.current != null) {
      // sb.current.focus(); // TODO Wait for fix
    }
  }, [searchBar]);

  function showErrorArticle() {
    setTimeout(() => setSBCacheArticle(true), 100);
  }

  const BaseHeader = (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <TouchableOpacity>
        <SvgUri
          width={45}
          height={45}
          uri={config.cdn + '/sites/becauseofprog.fr/assets/logos/bop.svg'}
        />
      </TouchableOpacity>
      <Appbar.Content
        title={
          <TouchableNativeFeedback
            onLongPress={() =>
              Linking.openURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                .then(() => {})
                .catch(() => {})
            }
            delayLongPress={30000}>
            <Text style={{color: '#e33733', fontFamily: 'Roboto-Regular'}}>
              BecauseOfProg
            </Text>
          </TouchableNativeFeedback>
        }
        style={{flex: 1}}
      />
      <Appbar.Action
        icon="magnify"
        color="#e33733"
        onPress={() => {
          setSearchBar(true);
        }}
      />
    </View>
  );

  const SearchBarMenu = (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Searchbar
        ref={sb}
        onChangeText={(a) => setQuery(a)}
        value={query}
        placeholder={I18n.t('searchBar')}
        onIconPress={() =>
          navigation.push('Search', {search: query, mode: 'search'})
        }
        onSubmitEditing={() =>
          navigation.push('Search', {search: query, mode: 'search'})
        }
        inputStyle={{fontSize: 12, padding: 5}}
        style={{flex: 1, height: 30, marginLeft: 10}}
      />
      <Appbar.Action
        icon="close"
        color="#e33733"
        onPress={() => {
          setSearchBar(false);
        }}
      />
    </View>
  );

  const TV = (
    <TabView
      navigationState={{index, routes}}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
    />
  );

  const MenuItemDC = withPreventDoubleClick(Menu.Item);

  return (
    <PaperProvider theme={stateTheme.theme}>
      <StatusBar translucent={false} backgroundColor={stateTheme.sb} />

      <Snackbar
        style={{marginLeft: 15, marginRight: 15}}
        theme={stateTheme.theme}
        visible={snackbar}
        duration={2000}
        onDismiss={() => setSB(false)}>
        {I18n.t('themeChanged')}
      </Snackbar>

      <Snackbar
        style={{marginLeft: 15, marginRight: 15}}
        theme={stateTheme.theme}
        visible={snackbarcache}
        duration={2000}
        onDismiss={() => setSBCache(false)}>
        {I18n.t('savedInCache')}
      </Snackbar>

      <Snackbar
        style={{marginLeft: 15, marginRight: 15}}
        theme={stateTheme.theme}
        visible={snackbarcachearticle}
        duration={2000}
        onDismiss={() => setSBCacheArticle(false)}>
        {I18n.t('unavailableArticle')}
      </Snackbar>

      <SafeAreaView style={stateTheme.styles.container}>
        <Appbar.Header style={stateTheme.styles.header}>
          {searchBar ? SearchBarMenu : BaseHeader}
          <Menu
            theme={{roundness: 3}}
            contentStyle={{paddingVertical: -5}}
            style={{paddingTop: 45}}
            visible={menu}
            onDismiss={() => setMenu(false)}
            anchor={
              <Appbar.Action
                icon="dots-vertical"
                color="#e33733"
                onPress={() => setMenu(true)}
              />
            }>
            <MenuItemDC
              icon="theme-light-dark"
              onPress={() => {
                setTimeout(() => setSB(true), 50);
                setMenu(false);
              }}
              title={I18n.t('changeTheme')}
            />
            <Divider />
            <MenuItemDC
              icon="cog"
              onPress={() => {
                navigation.push('Settings');
                setMenu(false);
              }}
              title={I18n.t('settings')}
            />
            <Divider />
            <MenuItemDC
              icon="information-outline"
              onPress={() => {
                navigation.push('Credits');
                setMenu(false);
              }}
              title={I18n.t('about')}
            />
          </Menu>
        </Appbar.Header>

        {TV}
        <Banner
          visible={bannerUpdate}
          style={{
            marginBottom: 0,
            backgroundColor: stateTheme.t === 'light' ? '#E0E0E0' : '#404040',
          }}
          actions={[
            {
              label: I18n.t('close'),
              onPress: () => setBannerUpdate(false),
            },
            {
              label: I18n.t('download'),
              onPress: () =>
                Linking.openURL(config.url + '/page/app')
                  .then(() => {})
                  .catch(() => {}),
            },
          ]}
          icon="update">
          <Text>
            {I18n.t('newUpdate')}{' '}
            <Text style={{fontSize: 11}}>
              {getVersion()} -> {newVersion}
            </Text>
            {'\n'}
          </Text>
          <Text style={{fontSize: 11}}>{I18n.t('archAndroid')}</Text>
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
        </Banner>
      </SafeAreaView>
    </PaperProvider>
  );
}

const Stack = createStackNavigator();

const initialLayout = {width: Dimensions.get('window').width};

function App() {
  useEffect(() => {
    changeNavigationBarColor('#edebeb', true);
  }, []);

  return (
    <StateProvider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            gestureResponseDistance: {horizontal: 200},
          }}>
          <Stack.Screen name="Home" component={Main} />
          <Stack.Screen name="WebView" component={MyWebComponent} />
          <Stack.Screen name="Search" component={Search} />
          <Stack.Screen name="Credits" component={Credits} />
          <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
      </NavigationContainer>
    </StateProvider>
  );
}

export default App;
