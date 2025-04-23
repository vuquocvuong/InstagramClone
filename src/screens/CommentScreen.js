import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const CommentScreen = ({ route }) => {
  const { postId, avatar } = route.params;
  const currentUser = auth().currentUser?.uid;
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [username, setUsername] = useState(currentUser);

  useEffect(() => {
    const fetchUsername = async () => {
      const userDoc = await firestore().collection('users').doc(currentUser).get();
      setUsername(userDoc.data()?.displayName || currentUser);
    };
    fetchUsername();
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        const fetched = snapshot.docs.map(doc => doc.data());
        setComments(fetched);
      }, error => {
        console.error('Error fetching comments:', error);
      });

    return () => unsubscribe();
  }, [postId]);

  const sendComment = async () => {
    if (!comment.trim()) return;

    try {
      await firestore()
        .collection('posts')
        .doc(postId)
        .collection('comments')
        .add({
          content: comment,
          username: username,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      setComment('');
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  };

  return (
    <View style={styles.container}>
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
          source={{ uri: avatar }}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  commentList: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#262626',
    lineHeight: 18,
    marginBottom: 8,
  },
  commentUser: {
    fontWeight: '600',
  },
  noComments: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
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

export default CommentScreen;