import FastImage from 'react-native-fast-image';
import {Card, Chip, Paragraph, Title} from 'react-native-paper';
import {Image, Text, View} from 'react-native';
import withPreventDoubleClick from '../utils/withPreventDoubleClick';
import React, {useState, useEffect} from 'react';
import moment from 'moment';
import {Cache} from 'react-native-cache';
import AsyncStorage from '@react-native-community/async-storage';

const cache = new Cache({
  namespace: 'articles',
  policy: {
    maxEntries: 50000,
  },
  backend: AsyncStorage,
});

export default React.memo(function CardView(props) {
  const CardDC = withPreventDoubleClick(Card);
  const [read, setRead] = useState(false);

  useEffect(() => {
    cache.get('@offline_post_' + props.item.url).then((value) => {
      if (value !== undefined && value !== null) {
        setRead(true);
      }
    });
  });

  return (
    <View
      style={{
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
      }}>
      <CardDC
        onPress={() => {
          props.navigation.push('WebView', {
            url: props.item.url,
          });
          setTimeout(() => {
            if (!read) {
              setRead(true);
            }
          }, 350);
        }}
        style={{marginTop: props.top}}>
        <FastImage
          style={{height: 185, marginBottom: 10}}
          source={{
            uri: props.item.banner,
            priority: FastImage.priority.low,
          }}
        />
        <Card.Content>
          <Title
            style={{
              textAlign: 'justify',
              lineHeight: 23,
              fontFamily: 'Roboto-Regular',
            }}>
            {props.item.title} {read && <Text style={{color: 'green'}}>✓</Text>}
          </Title>
          <Paragraph
            style={{
              textAlign: 'justify',
              fontFamily: 'Roboto-Light',
            }}>
            {props.item.description.trim()}
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
            avatar={<Image source={{uri: props.item.author.picture}} />}
            mode="flat">
            <Text style={{fontFamily: 'Roboto-Light'}}>
              {props.item.author.displayname}
            </Text>
          </Chip>
          <Chip mode="flat">
            <Text style={{fontFamily: 'Roboto-Light'}}>
              {moment.unix(props.item.timestamp).format('DD/MM/YYYY')}
            </Text>
          </Chip>
          <Chip mode="flat">
            <Text style={{fontFamily: 'Roboto-Light'}}>
              {props.item.category}
            </Text>
          </Chip>
        </View>
      </CardDC>
    </View>
  );
});
