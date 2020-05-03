import React, {useEffect, useState} from 'react';
import 'react-native-get-random-values';
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Linking,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import AutoHeightWebView from 'react-native-autoheight-webview';

import {
  Appbar,
  Card,
  DarkTheme,
  DefaultTheme,
  FAB,
  Portal,
  Provider as PaperProvider,
  Snackbar,
} from 'react-native-paper';
import withPreventDoubleClick from '../utils/withPreventDoubleClick';
import {Cache} from 'react-native-cache';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';

const WEBSITE_ROOT = 'https://becauseofprog.fr/article/';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    backgroundColor: '#FFF',
  },
});

const darkstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#000',
  },
});

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#e33733',
    accent: '#e33733',
  },
  roundness: 20,
};

const darktheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#e33733',
    accent: '#e33733',
  },
  roundness: 20,
};

const textlight = '#f6f8fa';
const textblack = '#000';

const codeblockcolorlight = '#f6f8fa';
const codeblockcolordark = '#242424';

const darklinks = '#e33733';
const lightlinks = '#242424';

async function shareURL(url) {
  try {
    await Share.share({
      message: url,
    });
  } catch (error) {}
}

const cache = new Cache({
  namespace: 'articles',
  policy: {
    maxEntries: 50000,
  },
  backend: AsyncStorage,
});

export default React.memo(function MyWebComponent({route, navigation}) {
  const [fab, setFab] = useState(false);
  const [fabIcon, setFabIcon] = useState('share');
  const [page, setPage] = useState('');
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [url, setURL] = useState('');
  const [auteur, setAuteur] = useState('');
  const [date, setDate] = useState('');
  const [picture, setPicture] = useState(null);
  const [allVisible, setAV] = useState(false);

  const [snackbarhc, setSBHc] = useState(false);
  const [snackbarcache, setSBCache] = useState(false);

  const [tH, setTh] = useState(theme);
  const [sT, setSt] = useState(styles);
  const [textColor, setTC] = useState(textblack);
  const [codeColor, setCC] = useState(textlight);
  const [linksColor, setLC] = useState(textlight);

  function switchTheme(t) {
    try {
      if (t === 'dark') {
        setTh(darktheme);
        setSt(darkstyles);
        setTC(textlight);
        setCC(codeblockcolordark);
        setLC(darklinks);
      } else {
        setTh(theme);
        setSt(styles);
        setTC(textblack);
        setCC(codeblockcolorlight);
        setLC(lightlinks);
      }
    } catch (e) {}
  }

  useEffect(() => {
    switchTheme(route.params.theme);
    getContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setEverything(e) {
    setPage(e.data.content);
    setURL(e.data.url);
    setType(e.data.article_language);
    setTitle(e.data.title);
    setPicture(e.data.banner);
    setDate(moment.unix(e.data.timestamp).format('DD/MM/YYYY'));
    setAuteur(e.data.author.displayname);
    setAV(true);
  }

  function saveCache(responseData, showSnackbar) {
    cache
      .set('@offline_post_' + route.params.url, JSON.stringify(responseData))
      .then((r) => {
        console.log("Sauvegarde de l'article dans le cache effectuée");
        if (showSnackbar) {
          setSBCache(true);
        }
      });
  }

  function getContent() {
    fetch('https://api.becauseofprog.fr/v1/blog-posts/' + route.params.url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        setEverything(responseData);

        cache.get('@offline_post_' + route.params.url).then((value) => {
          if (value !== undefined && value !== null) {
            if (value !== JSON.stringify(responseData)) {
              saveCache(responseData, true);
            } else {
              saveCache(responseData, false);
            }
          } else {
            saveCache(responseData, true);
          }
        });
      })
      .catch(() => {
        cache.get('@offline_post_' + route.params.url).then((value) => {
          if (value !== undefined && value !== null) {
            console.log(
              "Récupération de l'article : " +
                route.params.url +
                ' hors connexion',
            );
            setEverything(JSON.parse(value));
            setSBHc(true);
          } else {
            navigation.navigate('Home', {err: true});
          }
        });
      });
  }

  // let jsCode =
  //   '!function(){var e=function(e,n,t){if(n=n.replace(/^on/g,""),"addEventListener"in window)e.addEventListener(n,t,!1);else if("attachEvent"in window)e.attachEvent("on"+n,t);else{var o=e["on"+n];e["on"+n]=o?function(e){o(e),t(e)}:t}return e},n=document.querySelectorAll("a[href]");if(n)for(var t in n)n.hasOwnProperty(t)&&e(n[t],"onclick",function(e){new RegExp("^https?://"+location.host,"gi").test(this.href)||(e.preventDefault(),window.postMessage(JSON.stringify({external_url_open:this.href})))})}();';

  const AppbarBackActionDC = withPreventDoubleClick(Appbar.BackAction);

  return (
    <PaperProvider theme={tH}>
      <Snackbar
        style={{marginLeft: 15, marginRight: 15}}
        theme={theme}
        visible={snackbarhc}
        duration={2000}
        onDismiss={() => setSBHc(false)}>
        Article hors connexion
      </Snackbar>

      <Snackbar
        style={{marginLeft: 15, marginRight: 15}}
        theme={theme}
        visible={snackbarcache}
        duration={500}
        onDismiss={() => setSBCache(false)}>
        Enregistrement dans le cache effectué
      </Snackbar>

      <SafeAreaView style={sT.container}>
        <Appbar.Header style={sT.header}>
          <AppbarBackActionDC
            color="#e33733"
            onPress={() => navigation.goBack()}
          />
          <Appbar.Content
            title={
              <Text style={{color: '#e33733', fontFamily: 'Roboto-Regular'}}>
                BecauseOfProg
              </Text>
            }
            color="#e33733"
            style={{flex: 1}}
          />

          <Appbar.Action
            icon="open-in-app"
            color="#e33733"
            onPress={() => {
              Linking.openURL(WEBSITE_ROOT + url).catch(() => {});
            }}
          />
          <Appbar.Action color="#e33733" icon="dots-vertical" />
        </Appbar.Header>
        {allVisible ? (
          <ScrollView>
            <ImageBackground
              blurRadius={12}
              source={{
                uri: picture,
              }}
              style={{width: '100%', height: 190}}>
              <View
                style={{
                  position: 'absolute',
                  top: 25,
                  left: 0,
                  right: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: 'Roboto-Bold',
                    textAlign: 'center',
                    color: 'white',
                    padding: 20,
                    textShadowColor: 'rgba(0, 0, 0, 0.75)',
                    textShadowOffset: {width: -1, height: 1},
                    textShadowRadius: 10,
                  }}>
                  {title}
                </Text>
                <Text
                  style={{
                    fontSize: 17,
                    fontFamily: 'Roboto-Light',
                    color: 'white',
                    textShadowColor: 'rgba(0, 0, 0, 0.75)',
                    textShadowOffset: {width: -1, height: 1},
                    textShadowRadius: 10,
                  }}>
                  Publié par {auteur}, le {date}
                </Text>
              </View>
            </ImageBackground>

            <Card style={{margin: 10}}>
              {type === 'markdown' ? (
                <View style={{padding: 15}}>
                  <Markdown
                    mergeStyle={true}
                    style={{
                      // TODO Fix Colors Dark theme
                      body: {
                        fontFamily: 'Roboto-Light',
                        fontSize: 16,
                        textAlign: 'justify',
                      },
                      text: {
                        color: textColor,
                      },
                      code_block: {
                        color: textColor,
                        backgroundColor: codeColor,
                      },
                      fence: {
                        color: textColor,
                        backgroundColor: codeColor,
                      },
                      code_inline: {
                        color: textColor,
                        backgroundColor: codeColor,
                        fontSize: 20,
                        fontStyle: 'normal',
                      },
                      blockquote: {
                        color: textColor,
                        backgroundColor: codeColor,
                        fontStyle: 'italic',
                      },
                      heading3: {
                        fontWeight: 'bold',
                      },
                      heading2: {
                        fontWeight: 'bold',
                      },
                    }}>
                    {page}
                  </Markdown>
                </View>
              ) : (
                <AutoHeightWebView
                  customScript={"document.body.style.userSelect = 'none'"}
                  style={{
                    width: Dimensions.get('window').width - 60,
                    marginTop: 20,
                    marginBottom: 20,
                    marginLeft: 20,
                  }}
                  source={{
                    html:
                      page +
                      "<style>* { font-family: 'Roboto Light',sans-serif }</style><style type=\"text/css\"> @font-face {font-family: 'Roboto Light'; src:url('file:///android_asset/fonts/Roboto-Light.ttf')}</style>",
                  }}
                  onShouldStartLoadWithRequest={(event) => {
                    if (
                      event.url !== WEBSITE_ROOT + url &&
                      event.url !== 'about:blank'
                    ) {
                      Linking.openURL(event.url).catch(() => {});
                      return false;
                    }
                    return true;
                  }}
                  customStyle={`
                  * {
                    text-align: justify;
                    color: ${textColor}
                  }
                  p {
                    font-size: 16px;
                  }
                  a {
                    color: ${linksColor}
                  }
                `}
                />
              )}
            </Card>
          </ScrollView>
        ) : (
          <ActivityIndicator
            style={{marginTop: 50}}
            size="large"
            color="#e33733"
          />
        )}
      </SafeAreaView>

      <Portal>
        <FAB.Group
          open={fab}
          icon={fabIcon}
          actions={[
            {
              color: '#e33733',
              icon: 'heart',
              label: 'Aimer le post',
              onPress: () => console.log('Pressed star'),
            },
            {
              color: 'forestgreen',
              icon: 'share',
              label: 'Partager',
              onPress: () => {
                setFabIcon('share');
                shareURL(WEBSITE_ROOT + route.params.url).then((r) => {});
              },
            },
          ]}
          onStateChange={({open}) => {
            if (!open) {
              setFabIcon('share');
            }
            setFab(open);
          }}
          onPress={() => {
            if (!fab) {
              setFabIcon('close');
            } else {
              setFabIcon('share');
            }
          }}
        />
      </Portal>
    </PaperProvider>
  );
});
