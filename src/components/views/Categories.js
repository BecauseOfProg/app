import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {Banner, FAB, Portal} from 'react-native-paper';

import 'react-native-gesture-handler';

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import CardView from './CardView';
import {Cache} from 'react-native-cache';
import AsyncStorage from '@react-native-community/async-storage';

import {useDispatch, useSelector} from 'react-redux';
import {closeBanners, openBanners} from '../../redux/reducer';
import I18n from '../utils/i18n';

const cache = new Cache({
  namespace: 'everything',
  policy: {
    maxEntries: 50000,
  },
  backend: AsyncStorage,
});

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#e33733',
  },
});

export default React.memo(function Categories(props) {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [val, setValues] = useState(null);

  // STATES
  const banner = useSelector((state) => state.banner);
  const dispatch = useDispatch();

  const [update, setUpdate] = useState(false);
  const [scrolltotopfab, setSTTF] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const list = useRef(null);

  function loadMore() {
    setCurrentPage(currentPage + 1);
  }

  useEffect(() => {
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  function getPosts() {
    let page = currentPage;
    let url;
    if (props.categoryTitle === 'global') {
      url = `https://api.becauseofprog.fr/v1/blog-posts?page=${page}`;
    } else {
      url = `https://api.becauseofprog.fr/v1/blog-posts?page=${page}&category=${props.categoryTitle}`;
    }

    setTimeout(() => {
      fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((responseData) => {
          if (page <= responseData.pages) {
            let j;
            if (page === 1) {
              j = responseData.data;
              cache
                .set('@offlineposts_' + props.categoryTitle, JSON.stringify(j))
                .then((r) => {});
            } else {
              j = [...val, ...responseData.data];
            }
            dispatch(closeBanners());
            setLoading(false);
            setRefreshing(false);
            setValues(j);
            setUpdate(!update);
          }
        })
        .catch(() => {
          dispatch(openBanners());
          setLoading(false);
          setRefreshing(false);

          if (val == null) {
            cache.get('@offlineposts_' + props.categoryTitle).then((value) => {
              if (value !== undefined && value !== null) {
                setValues(JSON.parse(value));
                setLoading(false);
                setRefreshing(false);
                setUpdate(!update);
              }
            });
          }
        });
    }, 100);
  }

  return (
    <View>
      <Portal>
        <FAB
          visible={scrolltotopfab}
          style={styles.fab}
          small
          icon="arrow-up"
          onPress={() => list.current.scrollToIndex({index: 0, animated: true})}
        />
      </Portal>
      <Banner
        visible={banner}
        style={{marginBottom: 0}}
        actions={[
          {
            label: I18n.t('close'),
            onPress: () => dispatch(closeBanners()),
          },
          {
            label: I18n.t('retry'),
            onPress: () => {
              setRefreshing(true);
              getPosts();
            },
          },
        ]}
        icon="wifi-off">
        {I18n.t('errorInternet')}
      </Banner>
      {loading ? (
        <ActivityIndicator
          style={{marginTop: 50}}
          size="large"
          color="#e33733"
        />
      ) : (
        <FlatList
          contentContainerStyle={{paddingBottom: banner ? 250 : 105}}
          style={{
            minHeight: Dimensions.get('window').height,
          }}
          ref={list}
          onScroll={(event) => {
            if (event.nativeEvent.contentOffset.y > 400) {
              setSTTF(true);
            } else {
              setSTTF(false);
            }
          }}
          refreshControl={
            <RefreshControl
              colors={['#e33733']}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                getPosts();
              }}
            />
          }
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
            return (
              <CardView
                item={item}
                top={top}
                navigation={props.navigation}
                jumpTo={props.jumpTo}
              />
            );
          }}
        />
      )}
    </View>
  );
});
