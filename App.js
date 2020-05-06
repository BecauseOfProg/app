import * as React from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';
import SplashScreen from 'react-native-splash-screen';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import AsyncStorage from '@react-native-community/async-storage';
import withPreventDoubleClick from './components/utils/withPreventDoubleClick';
import {
  Appbar,
  DarkTheme,
  DefaultTheme,
  Divider,
  Menu,
  Provider as PaperProvider,
  Searchbar,
  Snackbar,
  Text,
} from 'react-native-paper';
import {Cache} from 'react-native-cache';

import changeNavigationBarColor, {
  showNavigationBar,
} from 'react-native-navigation-bar-color';

import {TabBar, TabView} from 'react-native-tab-view';

import MyWebComponent from './components/views/articleView';
import Categories from './components/views/Categories';
import Search from './components/screens/Search';
import Credits from './components/screens/Credits';

import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';

import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {SvgUri} from 'react-native-svg';

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

const lightsb = '#edebeb';
const darksb = '#000000';

const cache = new Cache({
  namespace: 'everything',
  policy: {
    maxEntries: 50000,
  },
  backend: AsyncStorage,
});

function Main({navigation, route}) {
  const [searchBar, setSearchBar] = useState(false);
  const [query, setQuery] = useState('');
  const [menu, setMenu] = useState(false);
  const [snackbar, setSB] = useState(false);
  const [snackbarcache, setSBCache] = useState(false);
  const [snackbarcachearticle, setSBCacheArticle] = useState(false);

  const [index, setIndex] = useState(0);

  const [banner, setBanner] = useState(false);

  const [everything, setEverything] = useState(null);

  const [refresh, setRefresh] = useState(null);

  const sb = useRef(null);

  const [tH, setTh] = useState(theme);
  const [sT, setSt] = useState(styles);
  const [statusbarcolor, setSBC] = useState(lightsb);
  const [currentTheme, setCT] = useState('light');

  useEffect(() => {
    if (route.params?.err) {
      showErrorArticle();
    }
  }, [route.params]);

  useEffect(() => {
    if (snackbar) {
      setTimeout(() => {
        if (currentTheme === 'dark') {
          switchTheme('white');
        } else {
          switchTheme('dark');
        }
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snackbar]);

  useEffect(() => {
    console.log('Composant monté avec succès.');
    try {
      AsyncStorage.getItem('@theme').then((v) => {
        if (v === null) {
          AsyncStorage.setItem('@theme', 'white').then(() => {
            switchTheme('white');
            SplashScreen.hide();
            getPosts();
            setCT('white');
          });
        } else {
          switchTheme(v);
          setCT(v);
          SplashScreen.hide();
          getPosts();
        }
      });
    } catch (e) {
      SplashScreen.hide();
      getPosts();
    }
  }, []);

  function closeAllBanners() {
    setBanner(false);
  }

  const getAllPosts = useCallback(() => {
    getPosts();
  }, []);

  /*  const showErrorCache = useCallback(() => {
      showErrorArticle();
    }, []);*/

  const closeBanners = useCallback(() => {
    closeAllBanners();
  }, []);

  function getPosts() {
    console.log('App.js -> called getPosts');
    cache.get('@offlineposts').then((value) => {
      if (value !== undefined && value !== null) {
        console.log('Récupération des articles hors connexion');
        setEverything(JSON.parse(value));
      }
    });
    setTimeout(() => {
      fetch('https://api.becauseofprog.fr/v1/blog-posts', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((responseData) => {
          console.log(
            'Connecté ! Récupération des fichiers obtenus par la requête.',
          );
          // setConnected(true);
          let j = responseData.data;
          setBanner(false);
          setEverything(j);
          cache.set('@offlineposts', JSON.stringify(j)).then((r) => {
            console.log('Sauvegarde connexion effectuée');
            setSBCache(true);
          });
        })
        .catch(() => {
          setBanner(true);
          setRefresh((r) => !r);
          // setConnected(false);
        });
    }, 100);
  }

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
        everything={everything}
        refresh={refresh}
        banner={banner}
        gP={getAllPosts}
        closeAllBanners={closeBanners}
        currentTheme={currentTheme}
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
      style={sT.onglets}
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
        onIconPress={() =>
          navigation.push('Search', {search: query, theme: currentTheme})
        }
        onSubmitEditing={() =>
          navigation.push('Search', {search: query, theme: currentTheme})
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

  function switchTheme(t) {
    try {
      if (t === 'dark') {
        setTh(darktheme);
        setSt(darkstyles);
        setSBC(darksb);
        try {
          changeNavigationBarColor(darksb, true);
        } catch {}
      } else {
        setTh(theme);
        setSt(styles);
        setSBC(lightsb);
        try {
          changeNavigationBarColor(lightsb, true);
        } catch {}
      }
      AsyncStorage.setItem('@theme', t);
      setCT(t);
    } catch (e) {}
  }

  const MenuItemDC = withPreventDoubleClick(Menu.Item);

  return (
    <PaperProvider theme={tH}>
      <StatusBar translucent={false} backgroundColor={statusbarcolor} />

      <Snackbar
        style={{marginLeft: 15, marginRight: 15}}
        theme={theme}
        visible={snackbar}
        duration={2000}
        onDismiss={() => setSB(false)}>
        Changement de thème
      </Snackbar>

      <Snackbar
        style={{marginLeft: 15, marginRight: 15}}
        theme={theme}
        visible={snackbarcache}
        duration={2000}
        onDismiss={() => setSBCache(false)}>
        Enregistrement dans le cache effectué
      </Snackbar>

      <Snackbar
        style={{marginLeft: 15, marginRight: 15}}
        theme={theme}
        visible={snackbarcachearticle}
        duration={2000}
        onDismiss={() => setSBCacheArticle(false)}>
        Erreur, article indisponible.
      </Snackbar>

      <SafeAreaView style={sT.container}>
        <Appbar.Header style={sT.header}>
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
              onPress={() => navigation.push('Credits', {theme: currentTheme})}
              title="Crédits"
            />
            <Divider />
            <MenuItemDC
              icon="settings-outline"
              onPress={() => {}}
              title="Paramètres"
            />
          </Menu>
        </Appbar.Header>
        {TV}
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
  );
}

export default App;
