import FastImage from 'react-native-fast-image';
import {Card, Chip, Paragraph, Title} from 'react-native-paper';
import {Image, Text, View} from 'react-native';
import withPreventDoubleClick from '../utils/withPreventDoubleClick';
import React from 'react';
import moment from 'moment';

export default React.memo(function CardView(props) {
  const CardDC = withPreventDoubleClick(Card);
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
            theme: props.currentTheme,
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
            {props.item.title}
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
