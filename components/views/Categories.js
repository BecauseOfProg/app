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
  const [banner, setBanner] = useState(false);
  const [update, setUpdate] = useState(false);
  const [scrolltotopfab, setSTTF] = useState(false);
  const list = useRef(null);

  useEffect(() => {
    if (props.refresh !== null) {
      setRefreshing(false);
    }
  }, [props.refresh]);

  useEffect(() => {
    if (val !== null) {
      setLoading(false);
      setUpdate((u) => !u);
    }
  }, [val]);

  useEffect(() => {
    setBanner(props.banner);
    if (props.banner === true) {
      setLoading(false);
    }
  }, [props.banner]);

  useEffect(() => {
    if (props.everything != null) {
      let j = props.everything;
      if (props.categoryTitle !== 'global') {
        let final = [];
        j.forEach((a) => {
          if (a.category === props.categoryTitle) {
            final.push(a);
          }
        });
        setValues(final);
        setLoading(false);
        setRefreshing(false);
      } else {
        setValues(j);
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [props.categoryTitle, props.everything]);

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
            label: 'Fermer',
            onPress: () => props.closeAllBanners(),
          },
          {
            label: 'Réessayer',
            onPress: () => {
              setRefreshing(true);
              props.gP();
            },
          },
        ]}
        icon="wifi-off">
        Pas de connexion Internet ou veuillez réessayer plus tard !
      </Banner>
      {loading ? (
        <ActivityIndicator
          style={{marginTop: 50}}
          size="large"
          color="#e33733"
        />
      ) : (
        <FlatList
          contentContainerStyle={{paddingBottom: 105}}
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
                props.gP();
              }}
            />
          }
          extraData={update}
          data={val}
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
                currentTheme={props.currentTheme}
              />
            );
          }}
        />
      )}
    </View>
  );
});
