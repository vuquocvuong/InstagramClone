import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { register, login } from '../services/authService';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validateInputs = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!emailRegex.test(email)) {
      setEmailError('Vui lòng nhập email hợp lệ (ví dụ: user@domain.com)');
      isValid = false;
    }

    if (!passwordRegex.test(password)) {
      setPasswordError(
        'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
      );
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    try {
      await register(email, password);
      alert('Đăng ký thành công');
      setIsRegisterMode(false);
    } catch (err) {
      alert('Lỗi đăng ký: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    try {
      await login(email, password);
      alert('Đăng nhập thành công');
    } catch (err) {
      alert('Lỗi đăng nhập: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setEmailError('');
    setPasswordError('');
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://i.imgur.com/zqpwkLQ.png' }}
        style={styles.logo}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, emailError ? styles.inputError : null]}
        autoCapitalize="none"
        placeholderTextColor="#999"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <TextInput
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, passwordError ? styles.inputError : null]}
        placeholderTextColor="#999"
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#0095f6" style={{ marginTop: 10 }} />
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={isRegisterMode ? handleRegister : handleLogin}
        >
          <Text style={styles.buttonText}>
            {isRegisterMode ? 'Đăng ký' : 'Đăng nhập'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={toggleAuthMode}>
        <Text style={styles.linkText}>
          {isRegisterMode
            ? 'Đã có tài khoản? Đăng nhập'
            : 'Bạn chưa có tài khoản? Đăng ký'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#fafafa',
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  button: {
    width: '100%',
    backgroundColor: '#0095f6',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkText: {
    color: '#00376b',
    marginTop: 15,
  },
});

export default AuthScreen;
