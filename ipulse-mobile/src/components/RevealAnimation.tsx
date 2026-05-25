import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

interface RevealAnimationProps {
  duration?: number;
}

export default function RevealAnimation({ duration }: RevealAnimationProps) {
  const source = require('../../assets/images/loading-transparent.mov');
  const player = useVideoPlayer(source, player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        contentFit="contain"
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
      />
    </View>
  );
}
