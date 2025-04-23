import auth from '@react-native-firebase/auth';

// Đăng ký tài khoản
export const register = async (email, password) => {
  return await auth().createUserWithEmailAndPassword(email, password);
};

// Đăng nhập
export const login = async (email, password) => {
  return await auth().signInWithEmailAndPassword(email, password);
};

// Đăng xuất
export const logout = async () => {
  return await auth().signOut();
};
