import * as React from 'react';
import {useEffect, useState} from 'react';
import {Appbar, Banner, Provider as PaperProvider} from 'react-native-paper';

import 'react-native-gesture-handler';

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
} from 'react-native';
import withPreventDoubleClick from '../utils/withPreventDoubleClick';

import {useSelector} from 'react-redux';
import CardView from '../views/CardView';
import I18n from '../utils/i18n';
import config from '../../../configuration.json';

export default React.memo(function Search({route, navigation}) {
  const [loading, setLoading] = useState(true);
  const [val, setValues] = useState(null);
  const [banner, setBanner] = useState(false);
  const [update, setUpdate] = useState(false);

  const stateTheme = useSelector((state) => state.theme);

  useEffect(() => {
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getPosts() {
    if (route.params.search.trim() !== undefined) {
      fetch(`${config.api}blog-posts?search=${route.params.search.trim()}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((responseData) => {
          let j = responseData.data;
          setValues(j);
          setLoading(false);
          setBanner(false);
          setUpdate(!update);
        })
        .catch(() => setBanner(true));
    }
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
              label: I18n.t('close'),
              onPress: () => setBanner(false),
            },
            {
              label: I18n.t('retry'),
              onPress: () => getPosts(),
            },
          ]}
          icon="wifi-off">
          {I18n.t('errorInternet')}
        </Banner>

        {loading && (
          <ActivityIndicator
            style={{marginTop: 50}}
            size="large"
            color="#e33733"
          />
        )}

        <FlatList
          contentContainerStyle={{paddingBottom: banner ? 250 : 105}}
          style={{
            minHeight: Dimensions.get('window').height,
          }}
          extraData={update}
          data={val}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          keyExtractor={(item) => item.timestamp.toString()}
          renderItem={({item, index}) => {
            let top;
            if (index === 0) {
              top = 10;
            } else {
              top = 0;
            }
            return <CardView item={item} top={top} navigation={navigation} />;
          }}
        />
      </SafeAreaView>
    </PaperProvider>
  );
});
