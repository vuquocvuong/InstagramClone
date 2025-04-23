import React, { useState } from 'react';
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import RNFS from 'react-native-fs';

const CreatePostScreen = ({ navigation }) => {
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);

  const uploadImageFromUrl = async (url) => {
    try {
      const fileName = `${Date.now()}.jpg`;
      const localPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      const download = await RNFS.downloadFile({
        fromUrl: url,
        toFile: localPath,
      }).promise;

      if (download.statusCode !== 200) {
        throw new Error('Tải ảnh thất bại');
      }

      const ref = storage().ref(`posts/${fileName}`);
      await ref.putFile(localPath);
      await RNFS.unlink(localPath);

      return await ref.getDownloadURL();
    } catch (err) {
      console.error('Lỗi uploadImageFromUrl:', err);
      throw err;
    }
  };

  const uploadPost = async () => {
    if (!imageUrl.trim() || !caption.trim()) {
      return Alert.alert('Thiếu dữ liệu', 'Hãy nhập link ảnh và mô tả!');
    }

    try {
      setUploading(true);

      await firestore().collection('posts').add({
        userId: auth().currentUser.uid,
        username: auth().currentUser.displayName || 'user123',
        avatar: auth().currentUser.photoURL || `https://i.pravatar.cc/150?u=user123`,
        caption,
        imageUrl,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Đăng bài thành công');
      setCaption('');
      setImageUrl('');
      setPreviewUri(null);
      navigation.goBack?.();
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi đăng bài', err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Input Link Ảnh */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Link ảnh</Text>
        <TextInput
          placeholder="Dán link ảnh (https...)"
          value={imageUrl}
          onChangeText={(text) => {
            setImageUrl(text);
            setPreviewUri(text);
          }}
          style={styles.input}
          autoCapitalize="none"
        />
      </View>

      {/* Preview Ảnh */}
      {previewUri ? (
        <Image source={{ uri: previewUri }} style={styles.image} />
      ) : (
        <View style={styles.imagePreviewPlaceholder}>
          <Text style={styles.placeholderText}>Ảnh sẽ hiển thị ở đây</Text>
        </View>
      )}

      {/* Input Mô tả */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          placeholder="Viết mô tả..."
          value={caption}
          onChangeText={setCaption}
          multiline
          style={[styles.input, styles.captionInput]}
          textAlignVertical="top"
        />
      </View>

      {/* Nút Đăng Bài */}
      {uploading ? (
        <ActivityIndicator size="large" color="#3897f0" />
      ) : (
        <TouchableOpacity onPress={uploadPost} style={styles.button}>
          <Text style={styles.buttonText}>🚀 Đăng bài</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  captionInput: {
    height: 100,
    paddingTop: 12,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  imagePreviewPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3897f0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CreatePostScreen;

// import { launchImageLibrary } from 'react-native-image-picker';
// const CreatePostScreen = ({ navigation }) => {
//   const [caption, setCaption] = useState('');
//   const [imageUri, setImageUri] = useState(null);
//   const [uploading, setUploading] = useState(false);

//   const requestPermission = async () => {
//     if (Platform.OS === 'android') {
//       const sdkInt = parseInt(Platform.Version, 10);
//       const permission =
//         sdkInt >= 33
//           ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
//           : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

//       const granted = await PermissionsAndroid.request(permission);
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     }
//     return true;
//   };

//   const pickImage = async () => {
//     const hasPermission = await requestPermission();
//     if (!hasPermission) return Alert.alert('Bạn cần cấp quyền ảnh!');

//     launchImageLibrary({ mediaType: 'photo' }, response => {
//       if (response.didCancel) return;
//       if (response.errorCode) {
//         return Alert.alert('Lỗi', response.errorMessage);
//       }

//       if (response.assets?.length > 0) {
//         setImageUri(response.assets[0].uri);
//       }
//     });
//   };

//   const uploadPost = async () => {
//     if (!imageUri || !caption.trim()) {
//       return Alert.alert('Thông báo', 'Hãy chọn ảnh và viết mô tả!');
//     }

//     try {
//       setUploading(true);
//       const filename = `posts/${Date.now()}.jpg`;
//       const ref = storage().ref(filename);
//       await ref.putFile(imageUri);
//       const downloadURL = await ref.getDownloadURL();

//       await firestore().collection('posts').add({
//         username: 'user123',
//         avatar: 'https://i.pravatar.cc/150?u=user123',
//         caption,
//         imageUrl: downloadURL,
//         createdAt: firestore.FieldValue.serverTimestamp(),
//       });

//       Alert.alert(' Đăng bài thành công');
//       setCaption('');
//       setImageUri(null);
//       navigation.goBack?.();
//     } catch (err) {
//       console.error(err);
//       Alert.alert(' Lỗi đăng bài', err.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
//         {imageUri ? (
//           <Image source={{ uri: imageUri }} style={styles.image} />
//         ) : (
//           <Text style={styles.pickText}>Chạm để chọn ảnh</Text>
//         )}
//       </TouchableOpacity>

//       <TextInput
//         placeholder="Viết chú thích..."
//         value={caption}
//         onChangeText={setCaption}
//         multiline
//         style={styles.input}
//       />

//       {uploading ? (
//         <ActivityIndicator size="large" />
//       ) : (
//         <TouchableOpacity onPress={uploadPost} style={styles.button}>
//           <Text style={styles.buttonText}> Đăng bài</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: '#fff' },
//   imagePicker: {
//     height: 300,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   pickText: {
//     color: '#888',
//     fontSize: 16,
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 12,
//   },
//   input: {
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderRadius: 10,
//     padding: 10,
//     textAlignVertical: 'top',
//     height: 100,
//     marginBottom: 16,
//     fontSize: 14,
//   },
//   button: {
//     backgroundColor: '#3897f0',
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default CreatePostScreen;
