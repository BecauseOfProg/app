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

import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';

import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';

import {SvgUri} from 'react-native-svg';
import {getVersion, supportedAbis} from 'react-native-device-info';

import {Provider as StateProvider, useDispatch, useSelector} from 'react-redux';
import store from './src/redux/store';

import {changeTheme} from './src/redux/reducer';

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

  const sb = useRef(null);

  // UPDATES
  useEffect(() => {
    supportedAbis()
      .then((abis) => {
        setArchs(abis);
      })
      .catch(() => {});

    fetch(
      'https://cdn.becauseofprog.fr/v2/sites/becauseofprog.fr/app/output-metadata.json',
    )
      .then((response) => response.json())
      .then((responseData) => {
        try {
          if (responseData.elements[0].versionName !== getVersion()) {
            setNewVersion(responseData.elements[0].versionName);
            setBannerUpdate(true);
          }
        } catch (e) {}
      })
      .catch(() => {});
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
          AsyncStorage.setItem('@theme', theme_light).then(() => {
            dispatch(changeTheme(theme_light));
          });
        } else {
          AsyncStorage.setItem('@theme', theme_dark).then(() => {
            dispatch(changeTheme(theme_dark));
          });
        }
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snackbar]);

  useEffect(() => {
    try {
      AsyncStorage.getItem('@theme').then((v) => {
        if (v === null) {
          AsyncStorage.setItem('@theme', 'light').then(() => {
            dispatch(changeTheme('light'));
          });
        } else {
          dispatch(changeTheme(v));
        }
      });
    } catch (e) {
      SplashScreen.hide();
    }
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
  const renderScene = ({route}) => {
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
      sb.current.focus();
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
          uri="https://cdn.becauseofprog.fr/v2/sites/becauseofprog.fr/assets/logos/bop.svg"
        />
      </TouchableOpacity>
      <Appbar.Content
        title={
          <Text style={{color: '#e33733', fontFamily: 'Roboto-Regular'}}>
            BecauseOfProg
          </Text>
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
        placeholder="Rechercher un article"
        onIconPress={() => navigation.push('Search', {search: query})}
        onSubmitEditing={() => navigation.push('Search', {search: query})}
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
        Changement de thème
      </Snackbar>

      <Snackbar
        style={{marginLeft: 15, marginRight: 15}}
        theme={stateTheme.theme}
        visible={snackbarcache}
        duration={2000}
        onDismiss={() => setSBCache(false)}>
        Enregistrement dans le cache effectué
      </Snackbar>

      <Snackbar
        style={{marginLeft: 15, marginRight: 15}}
        theme={stateTheme.theme}
        visible={snackbarcachearticle}
        duration={2000}
        onDismiss={() => setSBCacheArticle(false)}>
        Erreur, article indisponible.
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
              }}
              title="Changer de thème"
            />
            <Divider />
            <MenuItemDC
              icon="information-outline"
              onPress={() => navigation.push('Credits')}
              title="Crédits"
            />
            <Divider />
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
              label: 'Fermer',
              onPress: () => setBannerUpdate(false),
            },
            {
              label: 'Télécharger',
              onPress: () =>
                Linking.openURL(
                  'https://becauseofprog.fr/page/app',
                ).then(() => {}),
            },
          ]}
          icon="update">
          <Text>
            Une mise-à-jour est disponible !{' '}
            <Text style={{fontSize: 11}}>
              {getVersion()} -> {newVersion}
            </Text>
            {'\n'}
          </Text>
          <Text style={{fontSize: 11}}>Architectures de l'appareil : </Text>
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
        </Stack.Navigator>
      </NavigationContainer>
    </StateProvider>
  );
}

export default App;
