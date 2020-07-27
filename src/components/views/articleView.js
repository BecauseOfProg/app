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
  Text,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import AutoHeightWebView from 'react-native-autoheight-webview';
import FitImage from 'react-native-fit-image';
import ImageViewing from 'react-native-image-viewing';

import {
  Appbar,
  Card,
  FAB,
  Portal,
  Provider as PaperProvider,
  Snackbar,
} from 'react-native-paper';
import withPreventDoubleClick from '../utils/withPreventDoubleClick';
import {Cache} from 'react-native-cache';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import Clipboard from '@react-native-community/clipboard';

import {useDispatch, useSelector} from 'react-redux';
import {changeTheme} from '../../redux/reducer';

const WEBSITE_ROOT = 'https://becauseofprog.fr/article/';

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
  const [fabIcon, setFabIcon] = useState('dots-horizontal');
  const [page, setPage] = useState('');
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [url, setURL] = useState('');
  const [auteur, setAuteur] = useState('');
  const [date, setDate] = useState('');
  const [picture, setPicture] = useState(null);
  const [allVisible, setAV] = useState(false);

  const [modalPicture, setModalPicture] = useState(false);

  const [snackbarhc, setSBHc] = useState(false);
  const [snackbarcache, setSBCache] = useState(false);
  const [snackbarclipboard, setSBClipboard] = useState(false);
  const [snackbar, setSB] = useState(false);

  const [allImages, setAllImages] = useState([]);
  const imagesNb = {};
  let imageCounter = 0;
  const images = [];
  const [imageNumber, setImageNumber] = useState(0);

  const stateTheme = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  useEffect(() => {
    getContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            setEverything(JSON.parse(value));
            setSBHc(true);
          } else {
            navigation.navigate('Home', {err: true});
          }
        });
      });
  }

  const AppbarBackActionDC = withPreventDoubleClick(Appbar.BackAction);

  const imageRule = {
    image: (
      node,
      children,
      parent,
      styles,
      allowedImageHandlers,
      defaultImageHandler,
    ) => {
      const {src, alt} = node.attributes;

      // we check that the source starts with at least one of the elements in allowedImageHandlers
      const show =
        allowedImageHandlers.filter((value) => {
          return src.toLowerCase().startsWith(value.toLowerCase());
        }).length > 0;

      if (show === false && defaultImageHandler === null) {
        return null;
      }

      const imageProps = {
        indicator: true,
        style: styles._VIEW_SAFE_image,
        source: {
          uri: show === true ? src : `${defaultImageHandler}${src}`,
        },
      };

      if (alt) {
        imageProps.accessible = true;
        imageProps.accessibilityLabel = alt;
      }
      images.push({uri: src});
      imagesNb[src] = imageCounter;
      imageCounter++;
      return (
        <TouchableNativeFeedback
          key={node.key}
          onPress={() => {
            setAllImages(images);
            setModalPicture(true);
            setImageNumber(imagesNb[src]);
          }}>
          <FitImage {...imageProps} />
        </TouchableNativeFeedback>
      );
    },
  };

  return (
    <PaperProvider theme={stateTheme.theme}>
      <Snackbar
        style={{marginLeft: 15, marginRight: 15}}
        theme={stateTheme.theme}
        visible={snackbarhc}
        duration={2000}
        onDismiss={() => setSBHc(false)}>
        Article hors connexion
      </Snackbar>
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
        duration={500}
        onDismiss={() => setSBCache(false)}>
        Enregistrement dans le cache effectué
      </Snackbar>
      <Snackbar
        style={{marginLeft: 15, marginRight: 15}}
        theme={stateTheme.theme}
        visible={snackbarclipboard}
        duration={500}
        onDismiss={() => setSBClipboard(false)}>
        URL copiée dans le presse-papier
      </Snackbar>

      <ImageViewing
        backgroundColor="#000000EE"
        animationType="fade"
        images={allImages}
        imageIndex={imageNumber}
        presentationStyle="fullScreen"
        visible={modalPicture}
        swipeToCloseEnabled={false}
        onRequestClose={() => setModalPicture(false)}
      />

      <SafeAreaView style={stateTheme.styles.container}>
        <Appbar.Header style={stateTheme.styles.header}>
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
          <Appbar.Action
            icon="theme-light-dark"
            color="#e33733"
            onPress={() => setTimeout(() => setSB(true), 50)}
          />
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
                    rules={imageRule}
                    mergeStyle={true}
                    style={{
                      // TODO Fix Colors Dark theme
                      body: {
                        fontFamily: 'Roboto-Light',
                        fontSize: 16,
                        textAlign: 'justify',
                      },
                      text: {
                        color: stateTheme.others.text,
                      },
                      code_block: {
                        color: stateTheme.others.text,
                        backgroundColor: stateTheme.others.codeblockcolor,
                      },
                      fence: {
                        color: stateTheme.others.text,
                        backgroundColor: stateTheme.others.codeblockcolor,
                      },
                      code_inline: {
                        color: stateTheme.others.text,
                        backgroundColor: stateTheme.others.codeblockcolor,
                        fontSize: 20,
                        fontStyle: 'normal',
                      },
                      blockquote: {
                        color: stateTheme.others.text,
                        backgroundColor: stateTheme.others.codeblockcolor,
                        fontStyle: 'italic',
                      },
                      heading3: {
                        fontWeight: 'bold',
                      },
                      heading2: {
                        fontWeight: 'bold',
                      },
                      list_item: {
                        color: stateTheme.others.text,
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
                    color: ${stateTheme.others.codeblockcolor}
                  }
                  p {
                    font-size: 16px;
                  }
                  a {
                    color: ${stateTheme.others.links}
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
              color: stateTheme.t === 'dark' ? 'white' : 'black',
              icon: 'content-copy',
              label: "Copier l'url",
              onPress: () => {
                setTimeout(() => setSBClipboard(true), 100);
                Clipboard.setString(WEBSITE_ROOT + route.params.url);
              },
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
              setFabIcon('dots-horizontal');
            }
            setFab(open);
          }}
          onPress={() => {
            if (!fab) {
              setFabIcon('close');
            } else {
              setFabIcon('dots-horizontal');
            }
          }}
        />
      </Portal>
    </PaperProvider>
  );
});
