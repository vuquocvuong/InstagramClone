import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';

const PostCard = ({ post }) => {
  const currentUser = auth().currentUser?.uid;
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUsername = () => {
      if (!currentUser || !auth().currentUser?.email) {
        setUsername(`user_${currentUser?.slice(0, 6) || 'unknown'}`);
        return;
      }
      try {
        const email = auth().currentUser.email;
        const extractedUsername = email.split('@')[0]; // Extract part before @
        setUsername(extractedUsername);
      } catch (error) {
        console.error('Error extracting username from email:', error);
        setUsername(`user_${currentUser.slice(0, 6)}`);
      }
    };
    fetchUsername();
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('posts')
      .doc(post.id)
      .onSnapshot(doc => {
        const data = doc.data();
        const likes = data?.likes || [];
        setLikeCount(likes.length);
        setLiked(likes.includes(currentUser));
      }, error => {
        console.error('Error fetching post likes:', error);
      });

    return () => unsubscribe();
  }, [post.id, currentUser]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('posts')
      .doc(post.id)
      .collection('comments')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        const fetched = snapshot.docs.map(doc => doc.data());
        setComments(fetched);
      }, error => {
        console.error('Error fetching comments:', error);
      });

    return () => unsubscribe();
  }, [post.id]);

  const toggleLike = async () => {
    try {
      const ref = firestore().collection('posts').doc(post.id);
      if (liked) {
        await ref.update({
          likes: firestore.FieldValue.arrayRemove(currentUser),
        });
      } else {
        await ref.update({
          likes: firestore.FieldValue.arrayUnion(currentUser),
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const sendComment = async () => {
    if (!comment.trim()) return;

    try {
      await firestore()
        .collection('posts')
        .doc(post.id)
        .collection('comments')
        .add({
          content: comment,
          username: username, // Use the extracted username from email
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      setComment('');
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: post.avatar }} style={styles.avatar} />
        <Text style={styles.username}>{post.username}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <Image source={{ uri: post.imageUrl }} style={styles.image} />

      <View style={styles.actions}>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={toggleLike} style={styles.actionButton}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={26}
              color={liked ? '#e1306c' : '#000'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleComments} style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={26} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.likeCount}>{likeCount} likes</Text>

      <View style={styles.captionContainer}>
        <Text>
          <Text style={styles.captionUsername}>{post.username}</Text>{' '}
          <Text style={styles.caption}>{post.caption}</Text>
        </Text>
      </View>

      {showComments && (
        <View style={styles.commentSection}>
          <ScrollView style={styles.commentList}>
            {comments.length > 0 ? (
              comments.map((cmt, index) => (
                <Text key={index} style={styles.commentText}>
                  <Text style={styles.commentUser}>{cmt.username}</Text>{' '}
                  {cmt.content}
                </Text>
              ))
            ) : (
              <Text style={styles.noComments}>Chưa có bình luận nào.</Text>
            )}
          </ScrollView>

          <View style={styles.commentBox}>
            <Image
              source={{ uri: post.avatar }}
              style={styles.commentAvatar}
            />
            <TextInput
              placeholder="Add a comment..."
              value={comment}
              onChangeText={setComment}
              style={styles.commentInput}
            />
            <TouchableOpacity onPress={sendComment} disabled={!comment.trim()}>
              <Text style={[styles.postButton, !comment.trim() && styles.postButtonDisabled]}>
                Post
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
    color: '#262626',
    flex: 1,
  },
  moreButton: {
    padding: 4,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#fafafa',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    paddingBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 16,
  },
  likeCount: {
    fontWeight: '600',
    fontSize: 14,
    color: '#262626',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  captionContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  captionUsername: {
    fontWeight: '600',
    fontSize: 14,
    color: '#262626',
  },
  caption: {
    fontSize: 14,
    color: '#262626',
  },
  commentSection: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  commentList: {
    maxHeight: 150,
  },
  commentText: {
    fontSize: 14,
    color: '#262626',
    lineHeight: 18,
    marginBottom: 4,
  },
  commentUser: {
    fontWeight: '600',
  },
  noComments: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  commentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: '#262626',
    paddingVertical: 4,
  },
  postButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0095f6',
  },
  postButtonDisabled: {
    color: '#b3dbff',
  },
});

export default PostCard;