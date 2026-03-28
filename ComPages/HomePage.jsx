import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function HomePage({ onGetStarted }) {
  const photos = [
    "https://cdn.pixabay.com/photo/2020/05/22/03/10/vegetables-5203555_1280.jpg",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1649871371385-8190d1b9b370?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTE5fHxncm9jZXJ5fGVufDB8fDB8fHww"
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Full Screen Image Slider */}
      <View style={{ flex: 1 }}>
        <ScrollView
          pagingEnabled
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {photos.map((img, index) => (
            <View key={index} style={{ position: 'relative' }}>
              <Image
                source={{ uri: img }}
                style={{
                  width: screenWidth,
                  height: screenHeight,
                  resizeMode: "cover"
                }}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Text Content Overlay - Directly on photos */}
      <View
        style={{
          position: "absolute",
          bottom: 100,
          left: 20,
          right: 20,
          alignItems: "center",
        }}
      >
        <Text style={{
          fontSize: 32,
          fontWeight: "700",
          marginBottom: 15,
          textAlign: "center",
          lineHeight: 38,
          color: "white",
          textShadowColor: 'rgba(0, 0, 0, 0.75)',
          textShadowOffset: { width: -1, height: 1 },
          textShadowRadius: 10
        }}>
        Fresh groceries{"\n"}delivered fast
        </Text>

        <Text style={{
          fontSize: 16,
          color: "white",
          marginBottom: 30,
          textAlign: "center",
          lineHeight: 22,
          textShadowColor: 'rgba(0, 0, 0, 0.75)',
          textShadowOffset: { width: -1, height: 1 },
          textShadowRadius: 10
        }}>
          Get your essentials delivered in minutes with special rewards
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: "#4CAF50",
            paddingVertical: 16,
            paddingHorizontal: 40,
            borderRadius: 12,
            alignItems: "center",
            width: "100%",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          }}
          onPress={onGetStarted}
        >
          <Text style={{
            color: "white",
            fontSize: 18,
            fontWeight: "600"
          }}>
            Get started
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}