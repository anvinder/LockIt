import React from 'react';
import { View, ScrollView, Text, StyleSheet, SafeAreaView } from 'react-native';

const TextViewer = ({ route }) => {
  const { content, fileName } = route.params;
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.fileName}>{fileName}</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.content}>{content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default TextViewer;