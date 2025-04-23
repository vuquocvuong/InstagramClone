import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import PostCard from '../components/PostCard';
import { logout } from '../services/authService';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [username, setUsername] = useState('Chưa có tên');

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Bạn chưa đăng nhập');
      setLoading(false);
      return;
    }

    setUser(currentUser);

    // Extract username from email
    if (currentUser.email) {
      const extractedUsername = currentUser.email.split('@')[0]; // Extract part before @
      setUsername(extractedUsername);
    }

    const userRef = firestore().collection('users').doc(currentUser.uid);
    userRef.get().then(doc => {
      if (doc.exists) {
        setFollowers(doc.data().followers?.length || 0);
        setFollowing(doc.data().following?.length || 0);
      }
    });

    const unsubscribe = firestore()
      .collection('posts')
      .where('userId', '==', currentUser.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snapshot => {
          const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserPosts(posts);
          setLoading(false);
        },
        error => {
          console.error('Firestore error:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
      Alert.alert('Lỗi đăng xuất', err.message);
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.profileInfo}>
          <View style={styles.header}>
            <Image
              source={{ uri: user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}` }}
              style={styles.avatar}
            />
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>Bài viết</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{followers}</Text>
                <Text style={styles.statLabel}>Người theo dõi</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{following}</Text>
                <Text style={styles.statLabel}>Đang theo dõi</Text>
              </View>
            </View>
          </View>
          <Text style={styles.name}>{username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      }
      ListFooterComponent={
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      }
      data={userPosts}
      keyExtractor={item => item.id}
      renderItem={renderPost}
      numColumns={3}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginLeft: 10,
  },
  stats: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#555',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  email: {
    color: 'gray',
    marginLeft: 10,
    marginBottom: 10,
  },
  logoutButton: {
    marginHorizontal: 10,
    backgroundColor: '#ff4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'center',
    marginVertical: 20,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postContainer: {
    flex: 1 / 3,
    aspectRatio:1,
    margin: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default ProfileScreen;