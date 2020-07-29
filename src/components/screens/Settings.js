import React, {useEffect, useState} from 'react';
import {Image, SafeAreaView, ScrollView, View} from 'react-native';
import withPreventDoubleClick from '../utils/withPreventDoubleClick';
import {useDispatch, useSelector} from 'react-redux';
import {
  Appbar,
  Button,
  Card,
  Dialog,
  IconButton,
  List,
  Paragraph,
  Portal,
  Provider as PaperProvider,
  Switch,
  Title,
} from 'react-native-paper';
import I18n from '../utils/i18n';
import AsyncStorage from '@react-native-community/async-storage';
import {readArticles} from '../../redux/reducer';
import {Cache} from 'react-native-cache';

const cache = new Cache({
  namespace: 'articles',
  policy: {
    maxEntries: 50000,
  },
  backend: AsyncStorage,
});

const cacheEverything = new Cache({
  namespace: 'everything',
  policy: {
    maxEntries: 50000,
  },
  backend: AsyncStorage,
});

const langs = [
  [require('../../../assets/images/flags/fr.png'), 'Français', 'fr-FR'],
  [require('../../../assets/images/flags/en.png'), 'Anglais', 'en-GB'],
];

export default React.memo(function Settings({route, navigation}) {
  const stateTheme = useSelector((state) => state.theme);

  const [refresh, setRefresh] = useState(false);

  const [cacheArticlesContent, setCacheArticlesContent] = useState(true);
  const [readArticlesSwitch, setRAS] = useState(true);

  const [dialogReadArticles, setDRA] = useState(false);
  const [dialogContentRemove, setDCR] = useState(false);
  const [dialogRemoveCache, setDRCache] = useState(false);

  const AppbarBackActionDC = withPreventDoubleClick(Appbar.BackAction);

  const dispatch = useDispatch();

  useEffect(() => {
    AsyncStorage.getItem('@cacheArticlesContent')
      .then((b) => {
        if (b == null || JSON.parse(b)) {
          setCacheArticlesContent(true);
        } else {
          setCacheArticlesContent(false);
        }
      })
      .catch(() => {});

    AsyncStorage.getItem('@cacheRead')
      .then((b) => {
        if (b == null || JSON.parse(b)) {
          setRAS(true);
        } else {
          setRAS(false);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(
      '@cacheArticlesContent',
      JSON.stringify(cacheArticlesContent),
    )
      .then(() => {})
      .catch(() => {});
  }, [cacheArticlesContent]);

  useEffect(() => {
    AsyncStorage.setItem('@cacheRead', JSON.stringify(readArticlesSwitch))
      .then(() => {})
      .catch(() => {});
  }, [readArticlesSwitch]);

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
            title={I18n.t('settings')}
            color="#e33733"
            style={{flex: 1}}
          />
        </Appbar.Header>

        <Portal>
          <Dialog
            visible={dialogReadArticles}
            onDismiss={() => {
              setDRA(false);
            }}>
            <Dialog.Title>{I18n.t('removeReadArticles')}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{I18n.t('removeReadArticlesC')}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => {
                  setDRA(false);
                }}>
                {I18n.t('cancel')}
              </Button>
              <Button
                onPress={() => {
                  dispatch(readArticles([]));
                  AsyncStorage.setItem('@readArticles', JSON.stringify([]))
                    .then(() => {
                      setDRA(false);
                    })
                    .catch(() => {});
                }}>
                {I18n.t('ok')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Portal>
          <Dialog
            visible={dialogContentRemove}
            onDismiss={() => {
              setDCR(false);
            }}>
            <Dialog.Title>{I18n.t('removeCacheContent')}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{I18n.t('removeCacheContentC')}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => {
                  setDCR(false);
                }}>
                {I18n.t('cancel')}
              </Button>
              <Button
                onPress={() => {
                  cache
                    .clearAll()
                    .then((r) => setDCR(false))
                    .catch(() => {});
                }}>
                {I18n.t('ok')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Portal>
          <Dialog
            visible={dialogRemoveCache}
            onDismiss={() => {
              setDRCache(false);
            }}>
            <Dialog.Title>{I18n.t('removeGlobalCache')}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{I18n.t('removeGlobalCacheC')}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => {
                  setDRCache(false);
                }}>
                {I18n.t('cancel')}
              </Button>
              <Button
                onPress={() => {
                  cacheEverything
                    .clearAll()
                    .then((r) =>
                      cache.clearAll().then((r) => setDRCache(false)),
                    )
                    .catch(() => {});
                }}>
                {I18n.t('ok')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <ScrollView style={{padding: 10}}>
          <View>
            <Title style={{marginLeft: 10, fontSize: 24, color: '#e33733'}}>
              {I18n.t('titleLang')}
            </Title>
            <Card>
              <List.Accordion title={I18n.t('appLang')}>
                {langs.map((l, index) => (
                  <List.Item
                    key={index}
                    onPress={() => {
                      AsyncStorage.setItem('@lang', l[2])
                        .then(() => {
                          I18n.locale = l[2];
                          setRefresh((r) => !r);
                        })
                        .catch(() => {});
                    }}
                    title={l[1]}
                    left={() => (
                      <Image
                        style={{
                          left: 10,
                          top: 13,
                          marginRight: 20,
                          height: 18,
                          width: 18,
                        }}
                        source={l[0]}
                      />
                    )}
                    right={(props) =>
                      I18n.locale === l[2] ? (
                        <List.Icon {...props} icon="check" />
                      ) : (
                        <List.Icon {...props} icon="check" color="#ffffff00" />
                      )
                    }
                  />
                ))}
              </List.Accordion>
            </Card>
          </View>
          <View style={{marginTop: 15}}>
            <Title style={{marginLeft: 10, fontSize: 24, color: '#e33733'}}>
              {I18n.t('saveTitle')}
            </Title>
            <Card>
              <Card.Title
                style={{marginTop: 10}}
                title={I18n.t('cachingArticlesTitle')}
                subtitle={I18n.t('cachingArticlesSubtitle')}
                subtitleNumberOfLines={2}
                right={() => (
                  <Switch
                    style={{marginRight: 6}}
                    value={cacheArticlesContent}
                    onValueChange={() => {
                      setCacheArticlesContent(!cacheArticlesContent);
                    }}
                  />
                )}
              />
              <Card.Title
                title={I18n.t('readArticlesTitle')}
                subtitle={I18n.t('readArticlesSubtitle')}
                subtitleNumberOfLines={2}
                right={() => (
                  <Switch
                    style={{marginRight: 6}}
                    value={readArticlesSwitch}
                    onValueChange={() => {
                      setRAS(!readArticlesSwitch);
                    }}
                  />
                )}
              />
              <Card.Title
                title={I18n.t('removeReadArticlesTitle')}
                subtitle={I18n.t('removeReadArticlesSubtitle')}
                subtitleNumberOfLines={2}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="delete"
                    color="gray"
                    onPress={() => {
                      setDRA(true);
                    }}
                  />
                )}
              />
              <Card.Title
                title={I18n.t('removeArticlesContentTitle')}
                subtitle={I18n.t('removeArticlesContentSubtitle')}
                subtitleNumberOfLines={2}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="delete"
                    color="gray"
                    onPress={() => {
                      setDCR(true);
                    }}
                  />
                )}
              />
              <Card.Title
                style={{marginBottom: 10}}
                title={I18n.t('removeGlobalCacheTitle')}
                subtitle={I18n.t('removeGlobalCacheSubtitle')}
                subtitleNumberOfLines={2}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="delete"
                    color="gray"
                    onPress={() => {
                      setDRCache(true);
                    }}
                  />
                )}
              />
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
});
