import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

import AppNavigator from './AppNavigator';    // Tab Home/Profile/Upload
import AuthScreen from '../screens/AuthScreen'; // màn hình auth

const MainNavigator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null; 

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthScreen />} {/*Hiển thị AuthScreen khi chưa login */}
    </NavigationContainer>
  );
};

export default MainNavigator;
