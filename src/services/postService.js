import firestore from '@react-native-firebase/firestore';

export const fetchPosts = async () => {
  const snapshot = await firestore()
    .collection('posts')
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();

    return {
      id: doc.id,                           // Cần để like/comment hoạt động
      likes: data.likes || [],              // đảm bảo có trường likes
      caption: data.caption || '',
      imageUrl: data.imageUrl || '',
      username: data.username || '',
      avatar: data.avatar || '',
      createdAt: data.createdAt,
    };
  });
};
