import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
  View,
} from 'react-native';
import {
  Appbar,
  Banner,
  Provider as PaperProvider,
  Title,
} from 'react-native-paper';

import 'react-native-gesture-handler';
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
  const [title, setTitle] = useState('search');
  const [currentPage, setCurrentPage] = useState(1);

  const stateTheme = useSelector((state) => state.theme);

  function loadMore() {
    setCurrentPage(currentPage + 1);
  }

  useEffect(() => {
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  function getPosts() {
    let page = currentPage;
    let tmp = 'search';
    if (route.params.mode !== undefined) {
      tmp = route.params.mode;
      if (tmp === 'search') {
        setTitle(route.params.search);
      } else {
        setTitle(route.params.displayName);
      }
    }
    if (route.params.search.trim() !== undefined) {
      fetch(
        `${
          config.api
        }/blog-posts?page=${page}&${tmp}=${route.params.search.trim()}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
        .then((response) => response.json())
        .then((responseData) => {
          if (responseData.pages === 0) {
            setValues([]);
            setLoading(false);
            return;
          }
          if (page <= responseData.pages) {
            let j;
            if (page === 1) {
              j = responseData.data;
            } else {
              j = [...val, ...responseData.data];
            }
            setValues(j);
            setLoading(false);
            setBanner(false);
            setUpdate(!update);
          }
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
            title={'BecauseOfProg : ' + title}
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

        {val && !val.length && (
          <View
            style={{
              flex: 1,
              marginTop: 50,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Title>{I18n.t('noResult')}</Title>
          </View>
        )}

        <FlatList
          contentContainerStyle={{paddingBottom: banner ? 250 : 105}}
          style={{
            minHeight: Dimensions.get('window').height,
          }}
          extraData={update}
          data={val}
          onEndReached={({distanceFromEnd}) => {
            if (distanceFromEnd < 0) {
              return;
            }
            loadMore();
          }}
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
