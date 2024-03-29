import FastImage from 'react-native-fast-image';
import {Card, Chip, Paragraph, Title} from 'react-native-paper';
import {Image, Text, View} from 'react-native';
import withPreventDoubleClick from '../utils/withPreventDoubleClick';
import React, {useEffect, useState} from 'react';
import moment from 'moment';
import {useSelector} from 'react-redux';

export default React.memo(function CardView(props) {
  const CardDC = withPreventDoubleClick(Card);
  const [read, setRead] = useState(false);

  const readArticles = useSelector((state) => state.readArticles);

  useEffect(() => {
    if (props.item !== undefined) {
      if (readArticles.includes(props.item.url)) {
        setRead(true);
      } else {
        setRead(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readArticles]);

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
            marginLeft: props.category !== 'global' ? 10 : null,
            alignItems: props.category === 'global' ? 'center' : null,
            justifyContent: props.category === 'global' ? 'space-around' : null,
          }}>
          <Chip
            onPress={() => {
              props.navigation.push('Search', {
                search: props.item.author.username,
                mode: 'author',
                displayName: props.item.author.displayname,
              });
            }}
            avatar={<Image source={{uri: props.item.author.picture}} />}
            mode="flat">
            <Text style={{fontFamily: 'Roboto-Light'}}>
              {props.item.author.displayname}
            </Text>
          </Chip>
          <Chip
            mode="flat"
            style={{marginLeft: props.category !== 'global' ? 8 : null}}>
            <Text style={{fontFamily: 'Roboto-Light'}}>
              {moment.unix(props.item.timestamp).format('DD/MM/YYYY')}
            </Text>
          </Chip>
          {props.category === 'global' && (
            <Chip
              mode="flat"
              onPress={() => {
                props.jumpTo(props.item.category);
              }}>
              <Text style={{fontFamily: 'Roboto-Light'}}>
                {props.item.category}
              </Text>
            </Chip>
          )}
        </View>
      </CardDC>
    </View>
  );
});
