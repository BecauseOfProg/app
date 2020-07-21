import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Appbar,
  Banner,
  Card,
  Chip,
  Paragraph,
  Provider as PaperProvider,
  Title,
} from 'react-native-paper';

import 'react-native-gesture-handler';

import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import withPreventDoubleClick from '../utils/withPreventDoubleClick';

import {useSelector} from 'react-redux';

export default React.memo(function Search({route, navigation}) {
  const [loading, setLoading] = useState(true);
  const [val, setValues] = useState(null);
  const [banner, setBanner] = useState(false);

  const stateTheme = useSelector((state) => state.theme);

  useEffect(() => {
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getPosts() {
    console.log('From Internet');
    fetch('https://api.becauseofprog.fr/v1/blog-posts', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        let j = responseData.data;

        let final = [];
        j.forEach((a) => {
          let labels = a.labels.map(function (x) {
            return x.trim().toUpperCase();
          });
          if (
            a.title
              .toUpperCase()
              .includes(route.params.search.trim().toUpperCase()) ||
            labels.includes(route.params.search.trim().toUpperCase())
          ) {
            final.push(a);
          }
        });
        setValues(final);
        setLoading(false);
        setBanner(false);
      })
      .catch(() => setBanner(true));
  }

  function dateFormatted2(date) {
    const d = new Date(date * 1000);

    return (
      ('0' + d.getDate()).slice(-2) +
      '/' +
      ('0' + d.getMonth()).slice(-2) +
      '/' +
      d.getFullYear()
    ).trim();
  }

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
            title={'BecauseOfProg : ' + route.params.search}
            color="#e33733"
            style={{flex: 1}}
          />
        </Appbar.Header>
        <Banner
          visible={banner}
          actions={[
            {
              label: 'Fermer',
              onPress: () => setBanner(false),
            },
            {
              label: 'Réessayer',
              onPress: () => getPosts(),
            },
          ]}
          icon="wifi-off">
          Pas de connexion Internet ou veuillez réessayer plus tard !
        </Banner>

        {loading && (
          <ActivityIndicator
            style={{marginTop: 50}}
            size="large"
            color="#e33733"
          />
        )}

        <ScrollView style={{marginTop: 10}} removeClippedSubviews={true}>
          {val &&
            val.map((c, index) => {
              return [
                <View
                  key={index++}
                  style={{
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingBottom: 10,
                  }}>
                  <Card
                    onPress={() => {
                      navigation.push('WebView', {url: c.url});
                    }}
                    onLongPress={() => {}}
                    style={{marginBottom: 0}}>
                    <Card.Cover
                      style={{marginBottom: 10}}
                      source={{uri: c.banner}}
                    />
                    <Card.Content>
                      <Title style={{textAlign: 'justify', lineHeight: 23}}>
                        {c.title}
                      </Title>
                      <Paragraph style={{textAlign: 'justify'}}>
                        {c.description.trim()}
                      </Paragraph>
                    </Card.Content>

                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        marginTop: 20,
                        marginBottom: 10,
                        alignItems: 'center',
                        justifyContent: 'space-around',
                      }}>
                      <Chip
                        avatar={<Image source={{uri: c.author.picture}} />}
                        mode="flat">
                        {c.author.displayname}
                      </Chip>
                      <Chip mode="flat">{dateFormatted2(c.timestamp)}</Chip>
                      <Chip mode="flat">{c.category}</Chip>
                    </View>
                  </Card>
                </View>,
              ];
            })}
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
});
